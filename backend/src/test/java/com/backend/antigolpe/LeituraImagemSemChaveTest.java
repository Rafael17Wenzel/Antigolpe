package com.backend.antigolpe;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Sem GEMINI_API_KEY a aplicação sobe normalmente e a leitura por IA responde 503 (o site usa o OCR local). */
@SpringBootTest
@TestPropertySource(properties = {"app.gemini.api-key=", "app.limite.gemini.por-minuto=2"})
class LeituraImagemSemChaveTest {

    @Autowired WebApplicationContext context;

    @Test
    void semChaveResponde503ELimiteVale() throws Exception {
        var mvc = MockMvcBuilders.webAppContextSetup(context).build();
        var arquivo = new MockMultipartFile("imagem", "p.png", "image/png", LeituraImagemTest.PNG);
        for (int i = 0; i < 2; i++) {
            mvc.perform(multipart("/api/simulador/ler-imagem").file(arquivo).param("consentimento", "true"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.mensagem").value(containsString("está com problemas")));
        }
        mvc.perform(multipart("/api/simulador/ler-imagem").file(arquivo).param("consentimento", "true"))
            .andExpect(status().isTooManyRequests());
    }
}
