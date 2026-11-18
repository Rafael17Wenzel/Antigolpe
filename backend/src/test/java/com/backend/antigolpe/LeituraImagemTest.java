package com.backend.antigolpe;

import com.backend.antigolpe.demo.DemoSeeder;
import com.backend.antigolpe.seguranca.CabecalhosSegurancaFilter;
import com.backend.antigolpe.seguranca.LimiteRequisicoes;
import com.sun.net.httpserver.HttpServer;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Sprint 12: leitura do print pelo Gemini. Um servidor HTTP local faz o papel da API do Google,
 * então o teste não depende de rede nem de chave real.
 */
@SpringBootTest
@ExtendWith(OutputCaptureExtension.class)
class LeituraImagemTest {

    static final String CHAVE = "chave-de-teste-gemini-123";
    static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D, 'I', 'H', 'D', 'R'};

    static final HttpServer GEMINI;
    /** Resposta que o servidor falso dará: [status, corpo]. */
    static final AtomicReference<Object[]> RESPOSTA = new AtomicReference<>();
    static final AtomicReference<String> ULTIMA_CHAVE = new AtomicReference<>();
    static final AtomicReference<String> ULTIMO_CAMINHO = new AtomicReference<>();
    static final AtomicReference<String> ULTIMO_CORPO = new AtomicReference<>();

    static {
        try {
            GEMINI = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        GEMINI.createContext("/", troca -> {
            ULTIMA_CHAVE.set(troca.getRequestHeaders().getFirst("x-goog-api-key"));
            ULTIMO_CAMINHO.set(troca.getRequestURI().toString());
            ULTIMO_CORPO.set(new String(troca.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            Object[] r = RESPOSTA.get();
            if ((int) r[0] == -1) { // simula demora maior que o timeout
                try { Thread.sleep(3000); } catch (InterruptedException ignored) { }
                r = new Object[] {200, "{}"};
            }
            byte[] corpo = ((String) r[1]).getBytes(StandardCharsets.UTF_8);
            troca.sendResponseHeaders((int) r[0], corpo.length);
            troca.getResponseBody().write(corpo);
            troca.close();
        });
        GEMINI.setExecutor(java.util.concurrent.Executors.newCachedThreadPool());
        GEMINI.start();
    }

    @DynamicPropertySource
    static void propriedades(DynamicPropertyRegistry r) {
        r.add("app.gemini.url", () -> "http://127.0.0.1:" + GEMINI.getAddress().getPort());
        r.add("app.gemini.api-key", () -> CHAVE);
        r.add("app.gemini.timeout-segundos", () -> "1");
        r.add("app.limite.gemini.por-minuto", () -> "100000");
    }

    @AfterAll
    static void parar() {
        GEMINI.stop(0);
    }

    @Autowired WebApplicationContext context;
    @Autowired CabecalhosSegurancaFilter cabecalhos;
    @Autowired MeterRegistry metricas;
    @Autowired @Qualifier("limiteGemini") LimiteRequisicoes limiteGemini;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(cabecalhos).build();
        limiteGemini.limpar();
    }

    static String respostaGemini(String textoDoModelo) {
        return """
            {"candidates":[{"content":{"role":"model","parts":[{"text":%s}]}}]}
            """.formatted("\"" + textoDoModelo.replace("\\", "\\\\").replace("\"", "\\\"") + "\"");
    }

    private ResultActions enviar(byte[] imagem, String consentimento) throws Exception {
        var req = multipart("/api/simulador/ler-imagem").file(new MockMultipartFile("imagem", "print.png", "image/png", imagem));
        if (consentimento != null) req.param("consentimento", consentimento);
        return mvc.perform(req);
    }

    @Test
    void tokenLidoPelaIaEhDevolvidoNormalizado(CapturedOutput saida) throws Exception {
        RESPOSTA.set(new Object[] {200, respostaGemini("{\"token\": \"brd-br-mg-t3b7r5y9q2x8m4vc\"}")});
        enviar(PNG, "true")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value(DemoSeeder.TOKEN_MG))
            .andExpect(jsonPath("$.origem").value("ia"));

        // Chave no cabeçalho (nunca na URL), modelo padrão, imagem em base64 e instrução enviada
        assertThat(ULTIMA_CHAVE.get()).isEqualTo(CHAVE);
        assertThat(ULTIMO_CAMINHO.get()).isEqualTo("/v1beta/models/gemini-3.5-flash-lite:generateContent").doesNotContain(CHAVE);
        assertThat(ULTIMO_CORPO.get()).contains("\"mimeType\":\"image/png\"").contains("BRD-");
        assertThat(saida.getAll()).doesNotContain(CHAVE);
        assertThat(metricas.counter("antigolpe.leitura.ia", "resultado", "token").count()).isGreaterThanOrEqualTo(1);
    }

    @Test
    void semTokenNaImagemDevolveNulo() throws Exception {
        RESPOSTA.set(new Object[] {200, respostaGemini("{\"token\": null}")});
        enviar(PNG, "true").andExpect(status().isOk()).andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    void textoQueNaoEhTokenEhDescartado() throws Exception {
        // O modelo "inventou" algo fora do formato, ou obedeceu a uma instrução escrita na imagem
        RESPOSTA.set(new Object[] {200, respostaGemini("{\"token\": \"VAGA-CONFIRMADA-OFICIAL\"}")});
        enviar(PNG, "true").andExpect(status().isOk()).andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    void falhaDoGeminiViraIndisponivelSemExporDetalhes(CapturedOutput saida) throws Exception {
        RESPOSTA.set(new Object[] {500, "{\"error\":{\"message\":\"erro interno com " + CHAVE + "\"}}"});
        enviar(PNG, "true")
            .andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.mensagem").value(containsString("está com problemas")));
        RESPOSTA.set(new Object[] {429, "{}"});
        enviar(PNG, "true").andExpect(status().isServiceUnavailable());
        RESPOSTA.set(new Object[] {200, "isto não é json"});
        enviar(PNG, "true").andExpect(status().isServiceUnavailable());
        assertThat(saida.getAll()).doesNotContain(CHAVE);
    }

    @Test
    void demoraAlemDoLimiteViraIndisponivel() throws Exception {
        RESPOSTA.set(new Object[] {-1, ""});
        enviar(PNG, "true").andExpect(status().isServiceUnavailable());
    }

    @Test
    void exigeConsentimentoEImagemValida() throws Exception {
        RESPOSTA.set(new Object[] {200, respostaGemini("{\"token\": null}")});
        ULTIMO_CORPO.set(null);
        enviar(PNG, null).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.mensagem").value(containsString("concordar")));
        enviar(PNG, "false").andExpect(status().isBadRequest());
        enviar("não é imagem nenhuma".getBytes(StandardCharsets.UTF_8), "true").andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.mensagem").value(containsString("Formato não aceito")));
        assertThat(ULTIMO_CORPO.get()).as("nada foi enviado ao Gemini").isNull();
    }

    @Test
    void imagemAcimaDe5MbEhRecusada() throws Exception {
        byte[] grande = new byte[5 * 1024 * 1024 + 10];
        System.arraycopy(PNG, 0, grande, 0, PNG.length);
        enviar(grande, "true").andExpect(status().isPayloadTooLarge());
    }
}
