package com.backend.antigolpe;

import com.backend.antigolpe.demo.DemoSeeder;
import com.backend.antigolpe.denuncias.DenunciaRepository;
import com.backend.antigolpe.validacoes.ValidacaoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Sprint 05: denúncias persistidas com dados mínimos e referência opcional. */
@SpringBootTest
class DenunciaApiTest {

    @Autowired WebApplicationContext context;
    @Autowired DenunciaRepository repository;
    @Autowired ValidacaoService validacaoService;
    @Autowired JdbcTemplate jdbc;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    private ResultActions enviar(Map<String, Object> campos) throws Exception {
        String json = campos.entrySet().stream()
            .map(e -> "\"" + e.getKey() + "\":" + (e.getValue() instanceof String s ? "\"" + s + "\"" : e.getValue()))
            .collect(Collectors.joining(",", "{", "}"));
        return mvc.perform(post("/api/denuncias").contentType(MediaType.APPLICATION_JSON).content(json));
    }

    @Test
    void ofertaNaoCadastradaPodeSerDenunciadaSemReferencia() throws Exception {
        String protocolo = com.jayway.jsonpath.JsonPath.read(enviar(Map.of(
                "urlSuspeita", DemoSeeder.LINK_GOLPE, "descricao", "Pediram taxa de inscrição", "aceiteAviso", true))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.recebida").value(true))
            .andExpect(jsonPath("$.protocolo").value(matchesPattern("AG-[0-9A-Z]{10}")))
            .andExpect(jsonPath("$.mensagem").value(containsString("não é encaminhada")))
            .andReturn().getResponse().getContentAsString(), "$.protocolo");

        var salva = repository.findByProtocolo(protocolo).orElseThrow();
        assertThat(salva.getValidacaoId()).isNull();
        assertThat(salva.getEmailContato()).isNull();
        assertThat(salva.getUrlSuspeita()).isEqualTo(DemoSeeder.LINK_GOLPE);
    }

    @Test
    void denunciaLigadaAValidacaoExistente() throws Exception {
        String id = validacaoService.validar(DemoSeeder.TOKEN_REVOGADO).idValidacao();
        String protocolo = com.jayway.jsonpath.JsonPath.read(enviar(Map.of(
                "urlSuspeita", "texto", "descricao", "detalhes", "idValidacao", id,
                "emailContato", "pessoa@exemplo.com", "aceiteAviso", true))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString(), "$.protocolo");

        var salva = repository.findByProtocolo(protocolo).orElseThrow();
        assertThat(salva.getValidacaoId()).hasToString(id);
        assertThat(salva.getEmailContato()).isEqualTo("pessoa@exemplo.com");
    }

    @Test
    void referenciaInexistenteOuMalformadaEhIgnorada() throws Exception {
        for (String ref : new String[]{"00000000-0000-0000-0000-000000000000", "nao-e-uuid"}) {
            String protocolo = com.jayway.jsonpath.JsonPath.read(enviar(Map.of(
                    "urlSuspeita", "x", "descricao", "y", "idValidacao", ref, "aceiteAviso", true))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(), "$.protocolo");
            assertThat(repository.findByProtocolo(protocolo).orElseThrow().getValidacaoId()).isNull();
        }
    }

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
        "''|detalhes|true|Informe o link, token ou texto suspeito.",
        "link|''|true|Descreva o que aconteceu.",
        "link|detalhes|false|Confirme que leu o aviso de privacidade.",
    })
    void entradasInvalidasRetornam400ComMensagem(String url, String descricao, boolean aceite, String msg) throws Exception {
        enviar(Map.of("urlSuspeita", url, "descricao", descricao, "aceiteAviso", aceite))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.mensagem").value(msg));
    }

    @Test
    void emailInvalidoETextoLongoRetornam400() throws Exception {
        enviar(Map.of("urlSuspeita", "x", "descricao", "y", "emailContato", "nao-e-email", "aceiteAviso", true))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.mensagem").value(containsString("e-mail válido")));
        enviar(Map.of("urlSuspeita", "x", "descricao", "y".repeat(2001), "aceiteAviso", true))
            .andExpect(status().isBadRequest());
        enviar(Map.of("urlSuspeita", "x", "descricao", "y"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void naoHaRotaPublicaParaListarDenuncias() throws Exception {
        mvc.perform(get("/api/denuncias")).andExpect(status().isMethodNotAllowed());
    }

    @Test
    void bancoRejeitaDenunciaSemAceite() {
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> jdbc.update("""
            INSERT INTO denuncia (protocolo, url_suspeita, descricao, aceite_aviso, registrada_em)
            VALUES ('AG-TESTE00000', 'x', 'y', FALSE, CURRENT_TIMESTAMP)
            """)).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }
}
