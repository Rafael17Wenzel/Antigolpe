package com.backend.antigolpe;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.lessThanOrEqualTo;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Sprint 06: sugestões regionais por UF escolhida, sem GPS, sem prefixo do token e sem links. */
@SpringBootTest
class SugestaoApiTest {

    @Autowired WebApplicationContext context;
    @Autowired JdbcTemplate jdbc;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void ufComVagasPriorizaAUfELimitaATres() throws Exception {
        mvc.perform(get("/api/vagas/sugestoes").param("uf", "sp"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.uf").value("SP"))
            .andExpect(jsonPath("$.vagas", hasSize(3)))
            .andExpect(jsonPath("$.vagas[0].uf").value("SP"))
            .andExpect(jsonPath("$.vagas[1].uf").value("SP"))
            .andExpect(jsonPath("$.vagas[2].modalidade").value("REMOTA"));
    }

    @Test
    void mesmaCidadeVemPrimeiro() throws Exception {
        mvc.perform(get("/api/vagas/sugestoes").param("uf", "SP").param("cidade", "campinas"))
            .andExpect(jsonPath("$.vagas[0].id").value("suporte-tecnico-sp"));
    }

    @Test
    void encerradasERascunhosNuncaAparecem() throws Exception {
        for (String uf : new String[]{"SP", "RJ", "MG"}) {
            mvc.perform(get("/api/vagas/sugestoes").param("uf", uf))
                .andExpect(jsonPath("$.vagas[*].id", not(hasItem("analista-dados-encerrada"))))
                .andExpect(jsonPath("$.vagas[*].id", not(hasItem("estagio-ti-rascunho"))));
        }
    }

    @Test
    void ufSemVagasUsaFallbackDeRemotas() throws Exception {
        mvc.perform(get("/api/vagas/sugestoes").param("uf", "AC"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.vagas", hasSize(2)))
            .andExpect(jsonPath("$.vagas[*].modalidade", everyItem(is("REMOTA"))));
    }

    @Test
    void semRegiaoFuncionaComRemotas() throws Exception {
        mvc.perform(get("/api/vagas/sugestoes"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.uf").doesNotExist())
            .andExpect(jsonPath("$.criterio").value(containsString("Sem região")))
            .andExpect(jsonPath("$.vagas[*].modalidade", everyItem(is("REMOTA"))));
    }

    @Test
    void vagasFicticiasVemMarcadasEFonteCadastrada() throws Exception {
        mvc.perform(get("/api/vagas/sugestoes").param("uf", "RJ"))
            .andExpect(jsonPath("$.vagas[*].ficticia", everyItem(is(true))))
            .andExpect(jsonPath("$.vagas[0].fonteCadastrada").value(containsString("fictício")))
            .andExpect(jsonPath("$.aviso").value(containsString("site oficial")));
    }

    @Test
    void respostaNaoTemLinks() throws Exception {
        mvc.perform(get("/api/vagas/sugestoes").param("uf", "SP"))
            .andExpect(content().string(not(containsString("http"))));
    }

    @Test
    void regiaoDesconhecidaOuMalformadaRetorna400() throws Exception {
        mvc.perform(get("/api/vagas/sugestoes").param("uf", "ZZ"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.mensagem").value(containsString("Região desconhecida")));
        mvc.perform(get("/api/vagas/sugestoes").param("uf", "SAO"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.mensagem").value("Informe a UF com 2 letras."));
    }

    @Test
    void semNenhumaVagaElegivelRetornaListaVazia() throws Exception {
        jdbc.update("UPDATE vaga SET situacao = 'ENCERRADA' WHERE modalidade = 'REMOTA'");
        try {
            mvc.perform(get("/api/vagas/sugestoes").param("uf", "TO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vagas", hasSize(0)));
        } finally {
            jdbc.update("UPDATE vaga SET situacao = 'PUBLICADA' WHERE modalidade = 'REMOTA'");
        }
    }

    @Test
    void listaDeRegioesTem27Ufs() throws Exception {
        mvc.perform(get("/api/regioes"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(27)))
            .andExpect(jsonPath("$[0].nome").value("Acre"));
    }

    @Test
    void limiteRespeitado() throws Exception {
        mvc.perform(get("/api/vagas/sugestoes").param("uf", "SP"))
            .andExpect(jsonPath("$.vagas.length()", lessThanOrEqualTo(3)));
    }
}
