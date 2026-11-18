package com.backend.antigolpe;

import com.backend.antigolpe.demo.DemoSeeder;
import com.backend.antigolpe.tokens.TokenRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Falha técnica na consulta nunca vira resultado negativo (503). */
@SpringBootTest
@TestPropertySource(properties = "app.demo.seed=false")
class IndisponibilidadeTest {

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private TokenRepository tokenRepository;

    @MockitoBean
    private com.backend.antigolpe.denuncias.DenunciaRepository denunciaRepository;

    @Test
    void falhaAoGravarDenunciaNuncaRetornaProtocolo() throws Exception {
        when(denunciaRepository.saveAndFlush(org.mockito.ArgumentMatchers.any()))
            .thenThrow(new DataAccessResourceFailureException("disco cheio: segredo-interno"));

        MockMvcBuilders.webAppContextSetup(context).build()
            .perform(post("/api/denuncias").contentType(MediaType.APPLICATION_JSON)
                .content("{\"urlSuspeita\":\"x\",\"descricao\":\"y\",\"aceiteAviso\":true}"))
            .andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.protocolo").doesNotExist())
            .andExpect(content().string(not(containsString("segredo-interno"))));
    }

    @Test
    void falhaDoBancoRetorna503SemDetalhes() throws Exception {
        when(tokenRepository.findByCodigo(anyString()))
            .thenThrow(new DataAccessResourceFailureException("conexão recusada: segredo-interno"));

        MockMvcBuilders.webAppContextSetup(context).build()
            .perform(post("/api/vagas/validar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"tokenOuLink\":\"" + DemoSeeder.TOKEN_SP + "\"}"))
            .andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.status").doesNotExist())
            .andExpect(jsonPath("$.mensagem").value(containsString("não indica golpe")))
            .andExpect(content().string(not(containsString("segredo-interno"))));
    }
}
