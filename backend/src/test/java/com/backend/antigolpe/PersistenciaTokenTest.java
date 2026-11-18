package com.backend.antigolpe;

import com.backend.antigolpe.demo.DemoSeeder;
import com.backend.antigolpe.dto.ValidacaoResponse;
import com.backend.antigolpe.tokens.FormatoToken;
import com.backend.antigolpe.tokens.TokenService;
import com.backend.antigolpe.validacoes.ValidacaoService;
import com.backend.antigolpe.vagas.Modalidade;
import com.backend.antigolpe.vagas.SituacaoVaga;
import com.backend.antigolpe.vagas.Vaga;
import com.backend.antigolpe.vagas.VagaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Sprint 03 (atualizado na D056): migrations, constraints, token em texto e concorrência. */
@SpringBootTest
class PersistenciaTokenTest {

    @Autowired JdbcTemplate jdbc;
    @Autowired VagaRepository vagas;
    @Autowired TokenService tokenService;
    @Autowired ValidacaoService validacaoService;

    @Test
    void migrationsCriamDadosDeReferencia() {
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM regiao", Integer.class)).isEqualTo(27);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM curso", Integer.class)).isEqualTo(12);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM categoria", Integer.class)).isEqualTo(4);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM trilha_curso", Integer.class)).isEqualTo(3);
    }

    @Test
    void tokenEhGuardadoEmTextoNormalizado() {
        // D056: o RH precisa consultar o token sempre, então ele fica em texto puro (maiúsculas)
        assertThat(jdbc.queryForObject("SELECT codigo FROM token WHERE final_visivel = '8NWD'", String.class))
            .isEqualTo(DemoSeeder.TOKEN_SP);
        assertThat(jdbc.queryForObject("SELECT prefixo FROM token WHERE codigo = ?", String.class, DemoSeeder.TOKEN_SP))
            .isEqualTo("BRD-BR-SP");
    }

    @Test
    void migrationRemoveuOHash() {
        assertThat(jdbc.queryForObject(
            "SELECT COUNT(*) FROM information_schema.columns WHERE LOWER(table_name) = 'token' AND LOWER(column_name) = 'hash'",
            Integer.class)).isZero();
    }

    @Test
    void codigoDuplicadoEhRejeitadoPelaConstraint() {
        Vaga vaga = vagas.findBySlug("seguranca-informacao").orElseThrow();
        OffsetDateTime agora = OffsetDateTime.now();
        assertThatThrownBy(() -> tokenService.cadastrar(vaga, DemoSeeder.TOKEN_SP, agora, agora.plusDays(1)))
            .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void validadeInvertidaEhRejeitadaPeloBanco() {
        Long vagaId = vagas.findBySlug("seguranca-informacao").orElseThrow().getId();
        assertThatThrownBy(() -> jdbc.update("""
            INSERT INTO token (vaga_id, codigo, prefixo, final_visivel, valido_de, valido_ate)
            VALUES (?, ?, 'BRD-BR-SP', 'XXXX', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '1' DAY)
            """, vagaId, "BRD-BR-SP-INVERTIDO000000X"))
            .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void vagaPresencialSemUfEhRejeitadaPeloBanco() {
        assertThatThrownBy(() -> jdbc.update("""
            INSERT INTO vaga (slug, cargo, modalidade, uf, fonte_cadastrada, situacao)
            VALUES ('sem-uf', 'Teste', 'PRESENCIAL', NULL, 'teste', 'PUBLICADA')
            """))
            .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void ufInexistenteEhRejeitadaPeloBanco() {
        assertThatThrownBy(() -> jdbc.update("""
            INSERT INTO vaga (slug, cargo, modalidade, uf, fonte_cadastrada, situacao)
            VALUES ('uf-invalida', 'Teste', 'PRESENCIAL', 'XX', 'teste', 'PUBLICADA')
            """))
            .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void tokensGeradosSaoUnicosESeguemOFormatoRegional() {
        Vaga sp = vagas.findBySlug("seguranca-informacao").orElseThrow();
        Vaga remota = vagas.findBySlug("desenvolvimento-software").orElseThrow();
        Set<String> gerados = new HashSet<>();
        for (int i = 0; i < 2000; i++) {
            gerados.add(tokenService.gerarValor(sp));
        }
        assertThat(gerados).hasSize(2000).allMatch(t -> FormatoToken.regiao(t).orElseThrow().equals("SP"));
        assertThat(FormatoToken.regiao(tokenService.gerarValor(remota))).contains("RM");
    }

    @Test
    void tokenEmitidoConfirmaERetornaUfDoBanco() {
        Vaga vaga = vagas.save(new Vaga("vaga-teste-ba", "Cargo de Teste", Modalidade.PRESENCIAL, "BA",
            "Salvador", "teste", SituacaoVaga.PUBLICADA, true));
        OffsetDateTime agora = OffsetDateTime.now();
        String valor = tokenService.emitir(vaga, agora.minusMinutes(1), agora.plusDays(1)).getCodigo();

        ValidacaoResponse r = validacaoService.validar(valor);
        assertThat(r.status()).isEqualTo("CONFIRMADO");
        assertThat(r.vaga().uf()).isEqualTo("BA");
    }

    @Test
    void consultasConcorrentesTemResultadoConsistente() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(16);
        try {
            List<Callable<String>> tarefas = IntStream.range(0, 200)
                .<Callable<String>>mapToObj(i -> () -> validacaoService.validar(
                    i % 2 == 0 ? DemoSeeder.TOKEN_SP : DemoSeeder.TOKEN_REVOGADO).status())
                .toList();
            List<Future<String>> resultados = pool.invokeAll(tarefas);
            for (int i = 0; i < resultados.size(); i++) {
                assertThat(resultados.get(i).get()).isEqualTo(i % 2 == 0 ? "CONFIRMADO" : "NAO_CONFIRMADO");
            }
        } finally {
            pool.shutdown();
        }
    }

    @Test
    void cadastroConcorrenteDoMesmoTokenSoAceitaUm() throws Exception {
        Vaga vaga = vagas.findBySlug("recursos-humanos").orElseThrow();
        String valor = "BRD-BR-MG-CONCORRENC1A0000".substring(0, 26);
        OffsetDateTime agora = OffsetDateTime.now();
        ExecutorService pool = Executors.newFixedThreadPool(8);
        try {
            List<Callable<Boolean>> tarefas = IntStream.range(0, 8).<Callable<Boolean>>mapToObj(i -> () -> {
                try {
                    tokenService.cadastrar(vaga, valor, agora, agora.plusDays(1));
                    return true;
                } catch (DataIntegrityViolationException e) {
                    return false;
                }
            }).toList();
            long sucessos = pool.invokeAll(tarefas).stream().filter(f -> {
                try { return f.get(); } catch (Exception e) { return false; }
            }).count();
            assertThat(sucessos).isEqualTo(1);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM token WHERE codigo = ?", Integer.class,
                valor)).isEqualTo(1);
        } finally {
            pool.shutdown();
        }
    }
}
