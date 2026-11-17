package com.backend.antigolpe;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de fumaça: a aplicação sobe, o health check responde e os
 * endpoints atuais respondem com o formato esperado.
 */
@SpringBootTest
class SmokeTest {

    private static final String ORIGEM_DEV = "http://localhost:5173";

    @Autowired
    private WebApplicationContext context;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void healthCheckRespondeUp() throws Exception {
        mvc.perform(get("/actuator/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void actuatorNaoExpoeOutrosEndpoints() throws Exception {
        mvc.perform(get("/actuator/env"))
            .andExpect(status().isNotFound());
    }

    @Test
    void exemplosDosTestesRapidos() throws Exception {
        mvc.perform(get("/api/vagas/exemplos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.valido.tokenOuLink").exists())
            .andExpect(jsonPath("$.golpe.tokenOuLink").exists());
    }

    @Test
    void validaTokenSemInformarCargo() throws Exception {
        mvc.perform(post("/api/vagas/validar")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"tokenOuLink\":\"BRD-BR-RM-H6N2C8W4Z9K5D3JF\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CONFIRMADO"))
            .andExpect(jsonPath("$.vaga.cargo").value("Desenvolvedor(a) de Software"));
    }

    @Test
    void validacaoVaziaRetorna400ComMensagem() throws Exception {
        mvc.perform(post("/api/vagas/validar")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"tokenOuLink\":\"\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.mensagem").value("Informe o token ou link recebido."));
    }

    @Test
    void corpoInvalidoRetorna400() throws Exception {
        mvc.perform(post("/api/vagas/validar")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{nao-e-json"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.mensagem").value("Corpo da requisição inválido."));
    }

    @Test
    void registraDenuncia() throws Exception {
        mvc.perform(post("/api/denuncias")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"urlSuspeita\":\"http://exemplo.invalid\",\"descricao\":\"teste\",\"aceiteAviso\":true}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.protocolo").value(matchesPattern("AG-[0-9A-Z]{10}")));
    }

    @Test
    void rotaInexistenteRetorna404SemDetalhes() throws Exception {
        mvc.perform(get("/api/inexistente"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.mensagem").value("Recurso não encontrado."));
    }

    @Test
    void corsLiberaOrigemConfigurada() throws Exception {
        mvc.perform(options("/api/vagas/validar")
                .header("Origin", ORIGEM_DEV)
                .header("Access-Control-Request-Method", "POST"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", ORIGEM_DEV));
    }

    @Test
    void corsBloqueiaOrigemDesconhecida() throws Exception {
        mvc.perform(options("/api/vagas/validar")
                .header("Origin", "https://site-desconhecido.example")
                .header("Access-Control-Request-Method", "POST"))
            .andExpect(status().isForbidden());
    }
}
