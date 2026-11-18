package com.backend.antigolpe;

import com.backend.antigolpe.demo.DemoSeeder;
import com.backend.antigolpe.seguranca.CabecalhosSegurancaFilter;
import com.backend.antigolpe.seguranca.LimiteRequisicoes;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Sprint 08: limite de requisições, cabeçalhos, logs sem token, denúncia mascarada e métricas. */
@SpringBootTest
@ExtendWith(OutputCaptureExtension.class)
@TestPropertySource(properties = {
    "app.limite.validacao.por-minuto=3",
    "app.limite.denuncia.por-hora=2",
    "app.limite.sugestao.por-minuto=2",
    "app.limite.login.por-minuto=3"
})
class SegurancaTest {

    @Autowired WebApplicationContext context;
    @Autowired CabecalhosSegurancaFilter cabecalhos;
    @Autowired JdbcTemplate jdbc;
    @Autowired MeterRegistry metricas;
    @Autowired @Qualifier("limiteValidacao") LimiteRequisicoes limiteValidacao;
    @Autowired @Qualifier("limiteDenuncia") LimiteRequisicoes limiteDenuncia;
    @Autowired @Qualifier("limiteSugestao") LimiteRequisicoes limiteSugestao;
    @Autowired @Qualifier("limiteLogin") LimiteRequisicoes limiteLogin;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(cabecalhos).build();
        List.of(limiteValidacao, limiteDenuncia, limiteSugestao, limiteLogin).forEach(LimiteRequisicoes::limpar);
    }

    private MockHttpServletRequestBuilder validar(String valor, String ip) {
        return post("/api/vagas/validar").contentType(MediaType.APPLICATION_JSON)
            .content("{\"tokenOuLink\":\"" + valor + "\"}")
            .with(r -> { r.setRemoteAddr(ip); return r; });
    }

    @Test
    void excederLimiteDeValidacaoDevolve429ComRetryAfterECors() throws Exception {
        for (int i = 0; i < 3; i++) {
            mvc.perform(validar("BRD-BR-SP-0000000000000000", "203.0.113.7")).andExpect(status().isOk());
        }
        mvc.perform(validar("BRD-BR-SP-0000000000000001", "203.0.113.7").header("Origin", "http://localhost:5173"))
            .andExpect(status().isTooManyRequests())
            .andExpect(header().exists("Retry-After"))
            .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
            .andExpect(jsonPath("$.mensagem").value(containsString("Aguarde")));

        // Outro cliente não é afetado
        mvc.perform(validar(DemoSeeder.TOKEN_SP, "198.51.100.9")).andExpect(status().isOk());
        assertThat(metricas.counter("antigolpe.limite.excedido", "rota", "validar").count()).isGreaterThanOrEqualTo(1);
    }

    @Test
    void limiteDeDenunciaESugestoes() throws Exception {
        String corpo = "{\"urlSuspeita\":\"http://x.example\",\"descricao\":\"teste\",\"aceiteAviso\":true}";
        for (int i = 0; i < 2; i++) {
            mvc.perform(post("/api/denuncias").contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated());
        }
        mvc.perform(post("/api/denuncias").contentType(MediaType.APPLICATION_JSON).content(corpo))
            .andExpect(status().isTooManyRequests());

        mvc.perform(get("/api/vagas/sugestoes")).andExpect(status().isOk());
        mvc.perform(get("/api/vagas/sugestoes")).andExpect(status().isOk());
        mvc.perform(get("/api/vagas/sugestoes")).andExpect(status().isTooManyRequests());

        // Rotas sem limite seguem livres
        for (int i = 0; i < 5; i++) mvc.perform(get("/api/regioes")).andExpect(status().isOk());
    }

    @Test
    void loginTemLimiteContraForcaBruta() throws Exception {
        String errado = "{\"usuario\":\"root\",\"senha\":\"tentativa\"}";
        for (int i = 0; i < 3; i++) {
            mvc.perform(post("/api/admin/login").contentType(MediaType.APPLICATION_JSON).content(errado))
                .andExpect(status().isUnauthorized());
        }
        // Mesmo a senha certa é bloqueada até a janela liberar
        mvc.perform(post("/api/admin/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"usuario\":\"root\",\"senha\":\"root\"}"))
            .andExpect(status().isTooManyRequests())
            .andExpect(header().exists("Retry-After"));
    }

    @Test
    void preflightCorsNaoConsomeLimite() throws Exception {
        for (int i = 0; i < 5; i++) {
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                    .options("/api/vagas/validar")
                    .header("Origin", "http://localhost:5173")
                    .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk());
        }
        mvc.perform(validar(DemoSeeder.TOKEN_SP, "127.0.0.1")).andExpect(status().isOk());
    }

    @Test
    void cabecalhosDeSegurancaEmTodasAsRespostas() throws Exception {
        for (String rota : List.of("/api/regioes", "/actuator/health", "/rota-inexistente")) {
            mvc.perform(get(rota))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"))
                .andExpect(header().string("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'"))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().doesNotExist("Strict-Transport-Security"));
        }
        mvc.perform(get("/api/regioes").secure(true))
            .andExpect(header().string("Strict-Transport-Security", containsString("max-age=")));
    }

    @Test
    void corpoGrandeDemaisRecusadoSemSerLido() throws Exception {
        String enorme = "a".repeat(40_000);
        mvc.perform(post("/api/vagas/validar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"tokenOuLink\":\"" + enorme + "\"}"))
            .andExpect(status().isPayloadTooLarge())
            .andExpect(jsonPath("$.mensagem").exists());
    }

    @Test
    void logsNuncaContemTokenCompleto(CapturedOutput saida) throws Exception {
        String token = DemoSeeder.TOKEN_SP;
        mvc.perform(validar(token, "192.0.2.1")).andExpect(status().isOk());
        mvc.perform(validar("http://x.example/?token=" + token, "192.0.2.1")).andExpect(status().isOk());
        mvc.perform(post("/api/vagas/validar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"tokenOuLink\":\"" + token + "\""))
            .andExpect(status().isBadRequest());

        // Mesmo que algum código registre o token, o conversor mascara mensagem e stack trace
        var log = LoggerFactory.getLogger("teste.seguranca");
        log.warn("token recebido {}", token);
        log.error("falha", new IllegalStateException("erro com " + token.toLowerCase()));

        assertThat(saida.getAll()).doesNotContainIgnoringCase(token)
            .contains("BRD-BR-SP-************8NWD");
    }

    @Test
    void denunciaGuardaTokenMascarado() throws Exception {
        String corpo = "{\"urlSuspeita\":\"http://x.example/?token=" + DemoSeeder.TOKEN_RJ
            + "\",\"descricao\":\"recebi o codigo " + DemoSeeder.TOKEN_RJ + "\",\"aceiteAviso\":true}";
        String resposta = mvc.perform(post("/api/denuncias").contentType(MediaType.APPLICATION_JSON).content(corpo))
            .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String protocolo = com.jayway.jsonpath.JsonPath.read(resposta, "$.protocolo");

        var linha = jdbc.queryForMap("SELECT url_suspeita, descricao FROM denuncia WHERE protocolo = ?", protocolo);
        assertThat(linha.values()).allSatisfy(v -> assertThat((String) v)
            .doesNotContain(DemoSeeder.TOKEN_RJ).contains("BRD-BR-RJ-************R7TB"));
    }

    @Test
    void metricasContamResultadosSemDadosSensiveis() throws Exception {
        double antes = metricas.counter("antigolpe.validacoes", "status", "CONFIRMADO", "resultado", "CONFIRMADO").count();
        mvc.perform(validar(DemoSeeder.TOKEN_MG, "192.0.2.2")).andExpect(status().isOk());
        assertThat(metricas.counter("antigolpe.validacoes", "status", "CONFIRMADO", "resultado", "CONFIRMADO").count())
            .isEqualTo(antes + 1);

        metricas.getMeters().forEach(m -> m.getId().getTags().forEach(t -> {
            assertThat(t.getValue()).doesNotContain("BRD-").doesNotContain("@").doesNotContain("http");
        }));
    }
}
