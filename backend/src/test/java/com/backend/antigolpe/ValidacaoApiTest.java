package com.backend.antigolpe;

import com.backend.antigolpe.demo.DemoSeeder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Sprints 02 e 03: a vaga (e a região) vêm do banco, identificadas só pelo token. */
@SpringBootTest
class ValidacaoApiTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    private ResultActions validar(String tokenOuLink) throws Exception {
        String json = tokenOuLink == null ? "{}" : "{\"tokenOuLink\":\"" + tokenOuLink + "\"}";
        return mvc.perform(post("/api/vagas/validar").contentType(MediaType.APPLICATION_JSON).content(json));
    }

    @Test
    void tokenValidoRetornaCargoEUfDoBanco() throws Exception {
        validar(DemoSeeder.TOKEN_SP)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CONFIRMADO"))
            .andExpect(jsonPath("$.vaga.id").value("seguranca-informacao"))
            .andExpect(jsonPath("$.vaga.cargo").value("Analista de Segurança da Informação"))
            .andExpect(jsonPath("$.vaga.uf").value("SP"))
            .andExpect(jsonPath("$.vaga.cidade").value("São Paulo"))
            .andExpect(jsonPath("$.vaga.fonteCadastrada").value(containsString("fictício")))
            .andExpect(jsonPath("$.mensagem").value(containsString("não garante")))
            .andExpect(jsonPath("$.idValidacao").isNotEmpty())
            .andExpect(jsonPath("$.cursosRecomendados", hasSize(3)))
            .andExpect(jsonPath("$.cursosRecomendados[0].id").value("seguranca-ti"));
    }

    @Test
    void vagaRemotaConfirmaSemUf() throws Exception {
        validar(DemoSeeder.TOKEN_REMOTO)
            .andExpect(jsonPath("$.status").value("CONFIRMADO"))
            .andExpect(jsonPath("$.vaga.id").value("desenvolvimento-software"))
            .andExpect(jsonPath("$.vaga.uf").doesNotExist());
    }

    @Test
    void cargoEnviadoPeloClienteEIgnorado() throws Exception {
        mvc.perform(post("/api/vagas/validar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"vaga\":\"seguranca-informacao\",\"tokenOuLink\":\"" + DemoSeeder.TOKEN_MG + "\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.vaga.id").value("recursos-humanos"))
            .andExpect(jsonPath("$.vaga.uf").value("MG"));
    }

    @Test
    void tokenEmMinusculasDentroDeLinkEhConfirmado() throws Exception {
        validar("https://exemplo.invalid/vaga?token=" + DemoSeeder.TOKEN_RJ.toLowerCase())
            .andExpect(jsonPath("$.status").value("CONFIRMADO"))
            .andExpect(jsonPath("$.vaga.uf").value("RJ"));
    }

    @Test
    void prefixoRegionalAlteradoNaoConfirma() throws Exception {
        // Token válido de MG com o prefixo trocado para SP
        validar(DemoSeeder.TOKEN_MG.replace("-MG-", "-SP-"))
            .andExpect(jsonPath("$.status").value("NAO_CONFIRMADO"))
            .andExpect(jsonPath("$.vaga").doesNotExist());
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "BRD-BR-SP-0000000000000000",          // não cadastrado
        DemoSeeder.TOKEN_EXPIRADO,
        DemoSeeder.TOKEN_REVOGADO,
        DemoSeeder.TOKEN_VAGA_ENCERRADA,
        "BRD-2026-SEC89"                       // formato legado: não migrado
    })
    void naoConfirmadosTemAMesmaRespostaPublica(String token) throws Exception {
        validar(token)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("NAO_CONFIRMADO"))
            .andExpect(jsonPath("$.vaga").doesNotExist())
            .andExpect(jsonPath("$.mensagem").value(containsString("Não encontramos uma vaga ativa")))
            .andExpect(jsonPath("$.mensagem").value(containsString("não significa que seja golpe")))
            .andExpect(jsonPath("$.cursosRecomendados", hasSize(3)))
            .andExpect(jsonPath("$.cursosRecomendados[0].id").value("seguranca-ti"));
    }

    @Test
    void linkSemTokenNaoEhDeclaradoGolpe() throws Exception {
        validar(DemoSeeder.LINK_GOLPE)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("NAO_CONFIRMADO"))
            .andExpect(jsonPath("$.mensagem").value(containsString("Não identificamos um token")))
            .andExpect(jsonPath("$.mensagem").value(containsString("não significa que seja golpe")));
    }

    @Test
    void respostaNaoDevolveOTokenConsultado() throws Exception {
        validar(DemoSeeder.TOKEN_SP)
            .andExpect(content().string(not(containsString("7K2M9Q4XH3TZ8NWD"))));
    }

    @Test
    void entradaAusenteRetorna400() throws Exception {
        validar(null)
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.mensagem").value("Informe o token ou link recebido."));
    }

    @Test
    void entradaLongaDemaisRetorna400() throws Exception {
        validar("a".repeat(2049))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.mensagem").value(containsString("2048")));
    }
}
