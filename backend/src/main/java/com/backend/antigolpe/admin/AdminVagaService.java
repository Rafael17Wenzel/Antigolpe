package com.backend.antigolpe.admin;

import com.backend.antigolpe.admin.AdminDtos.CursoRef;
import com.backend.antigolpe.admin.AdminDtos.TokenView;
import com.backend.antigolpe.admin.AdminDtos.VagaForm;
import com.backend.antigolpe.admin.AdminDtos.VagaView;
import com.backend.antigolpe.tokens.Token;
import com.backend.antigolpe.tokens.TokenRepository;
import com.backend.antigolpe.tokens.TokenService;
import com.backend.antigolpe.vagas.Modalidade;
import com.backend.antigolpe.vagas.SituacaoVaga;
import com.backend.antigolpe.vagas.Vaga;
import com.backend.antigolpe.vagas.VagaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Gestão de vagas pelo RH. Toda vaga criada recebe um token gerado automaticamente,
 * visível sempre na área administrativa (D056). O token vale até o fim do dia informado
 * (horário de Brasília).
 */
@Service
public class AdminVagaService {

    static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");
    private static final char[] SUFIXO = "abcdefghjkmnpqrstvwxyz0123456789".toCharArray();

    private final VagaRepository vagas;
    private final TokenRepository tokens;
    private final TokenService tokenService;
    private final NamedParameterJdbcTemplate jdbc;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    public AdminVagaService(VagaRepository vagas, TokenRepository tokens, TokenService tokenService,
                            NamedParameterJdbcTemplate jdbc, Clock clock) {
        this.vagas = vagas;
        this.tokens = tokens;
        this.tokenService = tokenService;
        this.jdbc = jdbc;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<VagaView> listar() {
        return vagas.findAll().stream()
            .sorted((a, b) -> b.getId().compareTo(a.getId()))
            .map(this::view)
            .toList();
    }

    @Transactional(readOnly = true)
    public VagaView buscar(String slug) {
        return view(encontrar(slug));
    }

    @Transactional
    public VagaView criar(VagaForm f) {
        Dados d = validar(f);
        Vaga vaga = vagas.saveAndFlush(new Vaga(novoSlug(d.cargo), d.cargo, f.modalidade(), d.uf, d.cidade,
            d.fonte, f.situacao(), f.ficticia()));
        definirCursos(vaga, d.cursos);
        tokenService.emitir(vaga, OffsetDateTime.now(clock), d.validoAte);
        return view(vaga);
    }

    @Transactional
    public VagaView atualizar(String slug, VagaForm f) {
        Vaga vaga = encontrar(slug);
        Dados d = validar(f);
        String regiaoAntes = vaga.codigoRegional();
        vaga.atualizar(d.cargo, f.modalidade(), d.uf, d.cidade, d.fonte, f.situacao(), f.ficticia());
        vagas.saveAndFlush(vaga);
        definirCursos(vaga, d.cursos);

        OffsetDateTime agora = OffsetDateTime.now(clock);
        List<Token> ativos = tokens.findByVagaIdOrderByCriadoEmAscIdAsc(vaga.getId()).stream()
            .filter(Token::isAtivo).toList();
        if (!regiaoAntes.equals(vaga.codigoRegional())) {
            // O prefixo do token indica a região: ao mudar a região, os tokens antigos deixariam
            // de confirmar. Eles são revogados e um novo token é emitido.
            ativos.forEach(t -> t.revogar(agora));
            tokenService.emitir(vaga, agora, d.validoAte);
        } else if (ativos.isEmpty()) {
            tokenService.emitir(vaga, agora, d.validoAte);
        } else {
            ativos.forEach(t -> t.setValidoAte(d.validoAte));
        }
        tokens.flush();
        return view(vaga);
    }

    @Transactional
    public VagaView encerrar(String slug) {
        Vaga vaga = encontrar(slug);
        vaga.setSituacao(SituacaoVaga.ENCERRADA);
        vagas.saveAndFlush(vaga);
        return view(vaga);
    }

    /** Exclusão definitiva: apaga vaga, tokens e cursos ligados; validações antigas perdem a referência. */
    @Transactional
    public void excluir(String slug) {
        Vaga vaga = encontrar(slug);
        Map<String, Object> p = Map.of("id", vaga.getId());
        jdbc.update("DELETE FROM token WHERE vaga_id = :id", p);
        jdbc.update("DELETE FROM vaga_curso WHERE vaga_id = :id", p);
        vagas.delete(vaga);
        vagas.flush();
    }

    // ---------------------------------------------------------------------------------------

    private record Dados(String cargo, String uf, String cidade, String fonte, OffsetDateTime validoAte,
                         List<String> cursos) {}

    private Dados validar(VagaForm f) {
        String uf = vazio(f.uf()) ? null : f.uf().trim().toUpperCase(Locale.ROOT);
        if (f.modalidade() != Modalidade.REMOTA && uf == null) {
            throw erro("Informe a UF para vagas presenciais ou híbridas.");
        }
        if (uf != null && !existeUf(uf)) {
            throw erro("UF inválida.");
        }
        LocalDate hoje = LocalDate.now(clock.withZone(FUSO));
        if (f.tokenValidoAte().isBefore(hoje)) {
            throw erro("A validade do token não pode ser uma data passada.");
        }
        OffsetDateTime validoAte = f.tokenValidoAte().atTime(LocalTime.MAX).atZone(FUSO).toOffsetDateTime();

        List<String> cursos = f.cursos() == null ? List.of()
            : new ArrayList<>(new LinkedHashSet<>(f.cursos().stream().map(String::trim).toList()));
        for (String c : cursos) {
            Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM curso WHERE slug = :s", Map.of("s", c), Integer.class);
            if (n == null || n == 0) throw erro("Curso desconhecido: " + c);
        }
        return new Dados(f.cargo().trim(), uf, vazio(f.cidade()) ? null : f.cidade().trim(),
            f.fonteCadastrada().trim(), validoAte, cursos);
    }

    private void definirCursos(Vaga vaga, List<String> cursos) {
        jdbc.update("DELETE FROM vaga_curso WHERE vaga_id = :id", Map.of("id", vaga.getId()));
        short ordem = 1;
        for (String c : cursos) {
            jdbc.update("""
                INSERT INTO vaga_curso (vaga_id, curso_id, ordem)
                SELECT :vaga, id, :ordem FROM curso WHERE slug = :curso
                """, Map.of("vaga", vaga.getId(), "curso", c, "ordem", ordem++));
        }
    }

    private VagaView view(Vaga v) {
        List<CursoRef> cursos = jdbc.query("""
            SELECT c.slug, c.titulo FROM vaga_curso vc JOIN curso c ON c.id = vc.curso_id
             WHERE vc.vaga_id = :id ORDER BY vc.ordem
            """, Map.of("id", v.getId()), (rs, i) -> new CursoRef(rs.getString("slug"), rs.getString("titulo")));
        OffsetDateTime agora = OffsetDateTime.now(clock);
        List<TokenView> lista = tokens.findByVagaIdOrderByCriadoEmAscIdAsc(v.getId()).stream()
            .map(t -> new TokenView(t.getCodigo(), situacao(t, agora), t.getValidoDe(), t.getValidoAte(),
                t.getRevogadoEm()))
            .toList();
        return new VagaView(v.getSlug(), v.getCargo(), v.getModalidade(), v.getUf(), v.getCidade(),
            v.getFonteCadastrada(), v.getSituacao(), v.isFicticia(), v.getCriadaEm(), cursos, lista);
    }

    static String situacao(Token t, OffsetDateTime agora) {
        if (!t.isAtivo()) return "REVOGADO";
        if (agora.isBefore(t.getValidoDe())) return "AGENDADO";
        if (!agora.isBefore(t.getValidoAte())) return "EXPIRADO";
        return "ATIVO";
    }

    private Vaga encontrar(String slug) {
        return vagas.findBySlug(slug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vaga não encontrada."));
    }

    private boolean existeUf(String uf) {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM regiao WHERE uf = :uf", Map.of("uf", uf), Integer.class);
        return n != null && n > 0;
    }

    String novoSlug(String cargo) {
        String base = Normalizer.normalize(cargo, Normalizer.Form.NFD).replaceAll("\\p{M}", "")
            .toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        if (base.length() > 50) base = base.substring(0, 50).replaceAll("-$", "");
        String slug;
        do {
            StringBuilder s = new StringBuilder(base.isEmpty() ? "vaga" : base).append('-');
            for (int i = 0; i < 6; i++) s.append(SUFIXO[random.nextInt(SUFIXO.length)]);
            slug = s.toString();
        } while (vagas.findBySlug(slug).isPresent());
        return slug;
    }

    private static boolean vazio(String s) {
        return s == null || s.isBlank();
    }

    private static ResponseStatusException erro(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
