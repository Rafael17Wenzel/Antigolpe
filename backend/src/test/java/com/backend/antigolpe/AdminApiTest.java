package com.backend.antigolpe;

import com.backend.antigolpe.admin.JwtService;
import com.backend.antigolpe.demo.DemoSeeder;
import com.backend.antigolpe.seguranca.CabecalhosSegurancaFilter;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Sprint 11: login JWT do RH, CRUD de vagas com token visível e lista de denúncias. */
@SpringBootTest
class AdminApiTest {

    @Autowired WebApplicationContext context;
    @Autowired CabecalhosSegurancaFilter cabecalhos;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;

    private MockMvc mvc;
    private String bearer;

    @BeforeEach
    void setUp() throws Exception {
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(cabecalhos).build();
        String r = login("root", "root").andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        bearer = "Bearer " + JsonPath.read(r, "$.token");
    }

    /** O contexto Spring é compartilhado com outros testes: remove as vagas criadas aqui. */
    @AfterEach
    void limpar() {
        String criadas = "SELECT id FROM vaga WHERE fonte_cadastrada = 'Cadastro do RH (teste)'";
        jdbc.update("DELETE FROM token WHERE vaga_id IN (" + criadas + ")");
        jdbc.update("DELETE FROM vaga_curso WHERE vaga_id IN (" + criadas + ")");
        jdbc.update("DELETE FROM vaga WHERE fonte_cadastrada = 'Cadastro do RH (teste)'");
    }

    private ResultActions login(String usuario, String senha) throws Exception {
        return mvc.perform(post("/api/admin/login").contentType(MediaType.APPLICATION_JSON)
            .content("{\"usuario\":\"" + usuario + "\",\"senha\":\"" + senha + "\"}"));
    }

    private String form(String cargo, String modalidade, String uf, String situacao, LocalDate validoAte, String cursos) {
        return """
            {"cargo":"%s","modalidade":"%s","uf":%s,"cidade":"Recife","fonteCadastrada":"Cadastro do RH (teste)",
             "situacao":"%s","ficticia":true,"tokenValidoAte":"%s","cursos":%s}
            """.formatted(cargo, modalidade, uf == null ? "null" : "\"" + uf + "\"", situacao, validoAte, cursos);
    }

    private ResultActions validar(String token) throws Exception {
        return mvc.perform(post("/api/vagas/validar").contentType(MediaType.APPLICATION_JSON)
            .content("{\"tokenOuLink\":\"" + token + "\"}"));
    }

    @Test
    void loginComRootDevolveJwtDe8Horas() throws Exception {
        login("root", "root")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.usuario").value("root"))
            .andExpect(jsonPath("$.token").value(matchesPattern("^[\\w-]+\\.[\\w-]+\\.[\\w-]+$")))
            .andExpect(jsonPath("$.expiraEm").exists());
    }

    @Test
    void credenciaisErradasRecebem401ComMensagemGenerica() throws Exception {
        for (String[] c : List.of(new String[] {"root", "errada"}, new String[] {"admin", "root"})) {
            login(c[0], c[1]).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensagem").value("Usuário ou senha inválidos."))
                .andExpect(jsonPath("$.token").doesNotExist());
        }
    }

    @Test
    void rotasAdminExigemJwtValido() throws Exception {
        mvc.perform(get("/api/admin/vagas")).andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.mensagem").value(containsString("Entre novamente")));
        mvc.perform(get("/api/admin/denuncias").header("Authorization", "Bearer abc.def.ghi"))
            .andExpect(status().isUnauthorized());

        // Assinatura adulterada e algoritmo "none" são recusados
        String[] partes = bearer.substring(7).split("\\.");
        String corpoAlterado = Base64.getUrlEncoder().withoutPadding().encodeToString(
            "{\"iss\":\"antigolpe\",\"sub\":\"root\",\"exp\":9999999999}".getBytes(StandardCharsets.UTF_8));
        mvc.perform(get("/api/admin/vagas").header("Authorization", "Bearer " + partes[0] + "." + corpoAlterado + "." + partes[2]))
            .andExpect(status().isUnauthorized());
        String none = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"none\"}".getBytes());
        mvc.perform(get("/api/admin/vagas").header("Authorization", "Bearer " + none + "." + corpoAlterado + "."))
            .andExpect(status().isUnauthorized());

        mvc.perform(get("/api/admin/vagas").header("Authorization", bearer)).andExpect(status().isOk());
    }

    @Test
    void jwtExpiraDepoisDe8Horas() {
        Clock base = Clock.fixed(Instant.parse("2026-11-17T12:00:00Z"), ZoneOffset.UTC);
        JwtService servico = new JwtService("x".repeat(40), 8, base);
        String token = servico.emitir("root").token();
        assertThat(new JwtService("x".repeat(40), 8, Clock.offset(base, java.time.Duration.ofHours(7))).validar(token))
            .contains("root");
        assertThat(new JwtService("x".repeat(40), 8, Clock.offset(base, java.time.Duration.ofHours(8))).validar(token))
            .isEmpty();
        assertThat(new JwtService("y".repeat(40), 8, base).validar(token)).isEmpty();
    }

    @Test
    void listaVagasMostraTokensEmTexto() throws Exception {
        mvc.perform(get("/api/admin/vagas/seguranca-informacao").header("Authorization", bearer))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.cargo").value("Analista de Segurança da Informação"))
            .andExpect(jsonPath("$.tokens[0].codigo").value(DemoSeeder.TOKEN_SP))
            .andExpect(jsonPath("$.tokens[0].situacao").value("ATIVO"))
            .andExpect(jsonPath("$.cursos[*].id", hasItems("seguranca-ti", "redes", "lgpd")));
        mvc.perform(get("/api/admin/vagas").header("Authorization", bearer))
            .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(8)));
    }

    @Test
    void criarVagaGeraTokenQueConfirma() throws Exception {
        String r = mvc.perform(post("/api/admin/vagas").header("Authorization", bearer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(form("Analista de Crédito", "PRESENCIAL", "pe", "PUBLICADA", LocalDate.now().plusDays(30),
                    "[\"educacao-financeira\",\"lgpd\"]")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(startsWith("analista-de-credito-")))
            .andExpect(jsonPath("$.uf").value("PE"))
            .andExpect(jsonPath("$.cursos[0].id").value("educacao-financeira"))
            .andExpect(jsonPath("$.tokens.length()").value(1))
            .andExpect(jsonPath("$.tokens[0].codigo").value(matchesPattern("^BRD-BR-PE-[0-9A-Z]{16}$")))
            .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(r, "$.tokens[0].codigo");

        validar(token).andExpect(jsonPath("$.status").value("CONFIRMADO"))
            .andExpect(jsonPath("$.vaga.cargo").value("Analista de Crédito"))
            .andExpect(jsonPath("$.cursosRecomendados[0].id").value("educacao-financeira"));
    }

    @Test
    void editarVagaETrocarRegiaoReemiteToken() throws Exception {
        String r = mvc.perform(post("/api/admin/vagas").header("Authorization", bearer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(form("Caixa", "PRESENCIAL", "BA", "PUBLICADA", LocalDate.now().plusDays(10), "[]")))
            .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(r, "$.id");
        String tokenBa = JsonPath.read(r, "$.tokens[0].codigo");

        // Mesma região: só atualiza dados e validade; token continua o mesmo
        mvc.perform(put("/api/admin/vagas/" + id).header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON)
                .content(form("Caixa Executivo", "HIBRIDA", "BA", "PUBLICADA", LocalDate.now().plusDays(60), "[\"lgpd\"]")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.cargo").value("Caixa Executivo"))
            .andExpect(jsonPath("$.tokens.length()").value(1))
            .andExpect(jsonPath("$.tokens[0].codigo").value(tokenBa));

        // Outra região: token antigo revogado, novo token com o novo prefixo
        String r2 = mvc.perform(put("/api/admin/vagas/" + id).header("Authorization", bearer).contentType(MediaType.APPLICATION_JSON)
                .content(form("Caixa Executivo", "REMOTA", null, "PUBLICADA", LocalDate.now().plusDays(60), "[]")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tokens.length()").value(2))
            .andExpect(jsonPath("$.tokens[0].situacao").value("REVOGADO"))
            .andExpect(jsonPath("$.tokens[1].codigo").value(startsWith("BRD-BR-RM-")))
            .andReturn().getResponse().getContentAsString();
        validar(tokenBa).andExpect(jsonPath("$.status").value("NAO_CONFIRMADO"));
        validar(JsonPath.read(r2, "$.tokens[1].codigo")).andExpect(jsonPath("$.status").value("CONFIRMADO"));
    }

    @Test
    void validacoesDoFormulario() throws Exception {
        LocalDate amanha = LocalDate.now().plusDays(1);
        record Caso(String corpo, String mensagem) {}
        for (Caso c : List.of(
            new Caso(form("Ca", "PRESENCIAL", "SP", "PUBLICADA", amanha, "[]"), "cargo"),
            new Caso(form("Cargo ok", "PRESENCIAL", null, "PUBLICADA", amanha, "[]"), "UF"),
            new Caso(form("Cargo ok", "PRESENCIAL", "XX", "PUBLICADA", amanha, "[]"), "UF inválida"),
            new Caso(form("Cargo ok", "REMOTA", null, "PUBLICADA", LocalDate.now().minusDays(1), "[]"), "data passada"),
            new Caso(form("Cargo ok", "REMOTA", null, "PUBLICADA", amanha, "[\"nao-existe\"]"), "Curso desconhecido"),
            new Caso(form("Cargo ok", "VOADORA", null, "PUBLICADA", amanha, "[]"), "inválido"))) {
            mvc.perform(post("/api/admin/vagas").header("Authorization", bearer)
                    .contentType(MediaType.APPLICATION_JSON).content(c.corpo()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString(c.mensagem())));
        }
    }

    @Test
    void encerrarImpedeConfirmacaoEExcluirApagaTudo() throws Exception {
        String r = mvc.perform(post("/api/admin/vagas").header("Authorization", bearer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(form("Gerente de Contas", "PRESENCIAL", "RS", "PUBLICADA", LocalDate.now().plusDays(5), "[\"lgpd\"]")))
            .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(r, "$.id");
        String token = JsonPath.read(r, "$.tokens[0].codigo");
        validar(token).andExpect(jsonPath("$.status").value("CONFIRMADO"));

        mvc.perform(post("/api/admin/vagas/" + id + "/encerrar").header("Authorization", bearer))
            .andExpect(status().isOk()).andExpect(jsonPath("$.situacao").value("ENCERRADA"));
        validar(token).andExpect(jsonPath("$.status").value("NAO_CONFIRMADO"));

        mvc.perform(delete("/api/admin/vagas/" + id).header("Authorization", bearer)).andExpect(status().isNoContent());
        mvc.perform(get("/api/admin/vagas/" + id).header("Authorization", bearer)).andExpect(status().isNotFound());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM token WHERE codigo = ?", Integer.class, token)).isZero();
        validar(token).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("NAO_CONFIRMADO"));
        mvc.perform(delete("/api/admin/vagas/" + id).header("Authorization", bearer)).andExpect(status().isNotFound());
    }

    @Test
    void listaDeDenunciasEhSomenteLeitura() throws Exception {
        mvc.perform(post("/api/denuncias").contentType(MediaType.APPLICATION_JSON)
                .content("{\"urlSuspeita\":\"http://golpe.example\",\"descricao\":\"Pediram Pix\",\"emailContato\":\"a@b.com\",\"aceiteAviso\":true}"))
            .andExpect(status().isCreated());
        mvc.perform(get("/api/admin/denuncias").header("Authorization", bearer))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].protocolo").value(startsWith("AG-")))
            .andExpect(jsonPath("$[0].urlSuspeita").value("http://golpe.example"))
            .andExpect(jsonPath("$[0].emailContato").value("a@b.com"));
        mvc.perform(delete("/api/admin/denuncias").header("Authorization", bearer))
            .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void catalogoDeCursos() throws Exception {
        mvc.perform(get("/api/admin/cursos").header("Authorization", bearer))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(12));
    }
}
