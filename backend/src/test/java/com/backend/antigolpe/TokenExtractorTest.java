package com.backend.antigolpe;

import com.backend.antigolpe.validacoes.TokenExtractor;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

class TokenExtractorTest {

    private final TokenExtractor extractor = new TokenExtractor();

    @Test
    void extraiTokenPuroNormalizandoMaiusculas() {
        assertThat(extractor.extrair("  brd-dev-4022 ")).contains("BRD-DEV-4022");
    }

    @Test
    void extraiTokenDeLinkSemAcessarOLink() {
        assertThat(extractor.extrair("https://exemplo.invalid/vaga?token=BRD-2026-SEC89&ref=x"))
            .contains("BRD-2026-SEC89");
    }

    @Test
    void extraiTokenDeTextoEncaminhado() {
        assertThat(extractor.extrair("Olá! Seu código é BRD-BR-SP-7K2M9Q4X. Responda até amanhã."))
            .contains("BRD-BR-SP-7K2M9Q4X");
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "https://bradesco-vagas-premio.example/inscricao", "BRD", "BRD-1", "XBRD-DEV-4022"})
    void naoExtraiQuandoNaoHaToken(String entrada) {
        assertThat(extractor.extrair(entrada)).isEmpty();
    }

    @Test
    void nuloNaoQuebra() {
        assertThat(extractor.extrair(null)).isEmpty();
    }
}
