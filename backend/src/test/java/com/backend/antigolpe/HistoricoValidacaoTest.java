package com.backend.antigolpe;

import com.backend.antigolpe.demo.DemoSeeder;
import com.backend.antigolpe.validacoes.ResultadoInterno;
import com.backend.antigolpe.validacoes.ValidacaoRepository;
import com.backend.antigolpe.validacoes.ValidacaoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/** Sprint 05: cada consulta gera um registro sem o token e sem dados pessoais. */
@SpringBootTest
class HistoricoValidacaoTest {

    @Autowired ValidacaoService service;
    @Autowired ValidacaoRepository repository;
    @Autowired JdbcTemplate jdbc;

    @Test
    void registraResultadoInternoSemGuardarOToken() {
        String confirmado = service.validar(DemoSeeder.TOKEN_SP).idValidacao();
        String revogado = service.validar(DemoSeeder.TOKEN_REVOGADO).idValidacao();
        String semToken = service.validar(DemoSeeder.LINK_GOLPE).idValidacao();

        var c = repository.findById(UUID.fromString(confirmado)).orElseThrow();
        assertThat(c.getResultadoInterno()).isEqualTo(ResultadoInterno.CONFIRMADO);
        assertThat(c.getStatusPublico()).isEqualTo("CONFIRMADO");
        assertThat(c.getVagaId()).isNotNull();
        assertThat(c.getTokenId()).isNotNull();

        var r = repository.findById(UUID.fromString(revogado)).orElseThrow();
        assertThat(r.getResultadoInterno()).isEqualTo(ResultadoInterno.REVOGADO);
        assertThat(r.getStatusPublico()).isEqualTo("NAO_CONFIRMADO");
        assertThat(r.getVagaId()).isNull();

        assertThat(repository.findById(UUID.fromString(semToken)).orElseThrow().getResultadoInterno())
            .isEqualTo(ResultadoInterno.SEM_TOKEN);
    }

    @Test
    void tabelaDeValidacaoNaoTemColunaParaTextoTokenIpOuNavegador() {
        List<String> colunas = jdbc.queryForList(
            "SELECT LOWER(column_name) FROM information_schema.columns WHERE LOWER(table_name) = 'validacao'",
            String.class);
        assertThat(colunas).containsExactlyInAnyOrder(
            "id", "resultado_interno", "status_publico", "token_id", "vaga_id", "criada_em");
    }

    @Test
    void nenhumValorDeTokenApareceNoHistorico() {
        service.validar("https://exemplo.invalid/?t=" + DemoSeeder.TOKEN_MG);
        List<Map<String, Object>> linhas = jdbc.queryForList("SELECT * FROM validacao");
        assertThat(linhas.toString()).doesNotContain("T3B7R5Y9Q2X8M4VC").doesNotContain("exemplo.invalid");
    }
}
