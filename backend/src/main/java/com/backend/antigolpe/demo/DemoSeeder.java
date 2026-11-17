package com.backend.antigolpe.demo;

import com.backend.antigolpe.tokens.TokenService;
import com.backend.antigolpe.vagas.Modalidade;
import com.backend.antigolpe.vagas.SituacaoVaga;
import com.backend.antigolpe.vagas.Vaga;
import com.backend.antigolpe.vagas.VagaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Dados FICTÍCIOS de demonstração. Só roda com app.demo.seed=true (perfis dev/h2);
 * nunca por padrão. É idempotente: a cada início, as vagas fictícias são
 * atualizadas e seus tokens regenerados com a chave HMAC vigente.
 */
@Component
@ConditionalOnProperty(name = "app.demo.seed", havingValue = "true")
public class DemoSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoSeeder.class);
    public static final String FONTE_DEMO = "Cadastro fictício do protótipo acadêmico (não é vaga real)";

    record VagaDemo(String slug, String cargo, Modalidade modalidade, String uf, String cidade,
                    SituacaoVaga situacao, List<String> cursos) {}

    record TokenDemo(String valor, String vagaSlug, Duration inicio, Duration fim, boolean revogado) {}

    static final List<VagaDemo> VAGAS = List.of(
        new VagaDemo("seguranca-informacao", "Analista de Segurança da Informação", Modalidade.PRESENCIAL,
            "SP", "São Paulo", SituacaoVaga.PUBLICADA, List.of("seguranca-ti", "redes", "lgpd")),
        new VagaDemo("atendimento-agencia", "Analista de Atendimento (Agência)", Modalidade.PRESENCIAL,
            "RJ", "Rio de Janeiro", SituacaoVaga.PUBLICADA,
            List.of("atendimento-publico", "educacao-financeira", "postura-imagem")),
        new VagaDemo("desenvolvimento-software", "Desenvolvedor(a) de Software", Modalidade.REMOTA,
            null, null, SituacaoVaga.PUBLICADA, List.of("logica-programacao", "java-basico", "etica-sistemas")),
        new VagaDemo("recursos-humanos", "Analista de Recursos Humanos", Modalidade.HIBRIDA,
            "MG", "Belo Horizonte", SituacaoVaga.PUBLICADA,
            List.of("comunicacao-empresarial", "qualidade-vida", "lgpd")),
        new VagaDemo("analista-dados-encerrada", "Analista de Dados", Modalidade.PRESENCIAL,
            "SP", "Campinas", SituacaoVaga.ENCERRADA, List.of("logica-programacao")),
        // Vagas adicionais para as sugestões regionais (Sprint 06), também fictícias
        new VagaDemo("suporte-tecnico-sp", "Assistente de Suporte Técnico", Modalidade.PRESENCIAL,
            "SP", "Campinas", SituacaoVaga.PUBLICADA, List.of("redes", "letramento-digital")),
        new VagaDemo("atendimento-digital-remoto", "Atendente de Canais Digitais", Modalidade.REMOTA,
            null, null, SituacaoVaga.PUBLICADA, List.of("atendimento-publico", "letramento-digital")),
        new VagaDemo("estagio-ti-rascunho", "Estágio em Tecnologia", Modalidade.PRESENCIAL,
            "SP", "São Paulo", SituacaoVaga.RASCUNHO, List.of("logica-programacao"))
    );

    /** Valores conhecidos só para demonstração e testes (documentados no README). */
    public static final String TOKEN_SP = "BRD-BR-SP-7K2M9Q4XH3TZ8NWD";
    public static final String TOKEN_RJ = "BRD-BR-RJ-P4V8X2KD9M3QR7TB";
    public static final String TOKEN_REMOTO = "BRD-BR-RM-H6N2C8W4Z9K5D3JF";
    public static final String TOKEN_MG = "BRD-BR-MG-T3B7R5Y9Q2X8M4VC";
    public static final String TOKEN_EXPIRADO = "BRD-BR-RJ-E7X2P9D4K8M3Q6WA";
    public static final String TOKEN_REVOGADO = "BRD-BR-MG-R5V9K3T7B2N8D4XC";
    public static final String TOKEN_VAGA_ENCERRADA = "BRD-BR-SP-C8M4W2Q9T6K3X7PD";
    public static final String LINK_GOLPE = "http://bradesco-vagas-premio.example/inscricao";

    static final List<TokenDemo> TOKENS = List.of(
        new TokenDemo(TOKEN_SP, "seguranca-informacao", Duration.ofDays(-30), Duration.ofDays(365), false),
        new TokenDemo(TOKEN_RJ, "atendimento-agencia", Duration.ofDays(-30), Duration.ofDays(365), false),
        new TokenDemo(TOKEN_REMOTO, "desenvolvimento-software", Duration.ofDays(-30), Duration.ofDays(365), false),
        new TokenDemo(TOKEN_MG, "recursos-humanos", Duration.ofDays(-30), Duration.ofDays(365), false),
        new TokenDemo(TOKEN_EXPIRADO, "atendimento-agencia", Duration.ofDays(-90), Duration.ofDays(-1), false),
        new TokenDemo(TOKEN_REVOGADO, "recursos-humanos", Duration.ofDays(-30), Duration.ofDays(365), true),
        new TokenDemo(TOKEN_VAGA_ENCERRADA, "analista-dados-encerrada", Duration.ofDays(-30), Duration.ofDays(365), false)
    );

    private final VagaRepository vagas;
    private final TokenService tokenService;
    private final NamedParameterJdbcTemplate jdbc;
    private final Clock clock;

    public DemoSeeder(VagaRepository vagas, TokenService tokenService, NamedParameterJdbcTemplate jdbc, Clock clock) {
        this.vagas = vagas;
        this.tokenService = tokenService;
        this.jdbc = jdbc;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (VagaDemo d : VAGAS) {
            Vaga vaga = vagas.findBySlug(d.slug()).orElseGet(() -> vagas.save(new Vaga(
                d.slug(), d.cargo(), d.modalidade(), d.uf(), d.cidade(), FONTE_DEMO, d.situacao(), true)));
            vaga.setSituacao(d.situacao());
            jdbc.update("DELETE FROM vaga_curso WHERE vaga_id = :id", Map.of("id", vaga.getId()));
            short ordem = 1;
            for (String curso : d.cursos()) {
                jdbc.update("""
                    INSERT INTO vaga_curso (vaga_id, curso_id, ordem)
                    SELECT :vaga, id, :ordem FROM curso WHERE slug = :curso
                    """, Map.of("vaga", vaga.getId(), "curso", curso, "ordem", ordem++));
            }
        }
        vagas.flush();

        // Regenera os tokens das vagas fictícias com a chave HMAC vigente.
        jdbc.update("DELETE FROM token WHERE vaga_id IN (SELECT id FROM vaga WHERE ficticia = TRUE)", Map.of());
        OffsetDateTime agora = OffsetDateTime.now(clock);
        for (TokenDemo t : TOKENS) {
            Vaga vaga = vagas.findBySlug(t.vagaSlug()).orElseThrow();
            var token = tokenService.cadastrar(vaga, t.valor(), agora.plus(t.inicio()), agora.plus(t.fim()));
            if (t.revogado()) {
                token.revogar(agora);
            }
        }
        log.info("Dados fictícios de demonstração carregados: {} vagas, {} tokens.", VAGAS.size(), TOKENS.size());
    }
}
