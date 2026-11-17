package com.backend.antigolpe;

import com.backend.antigolpe.tokens.TokenHasher;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TokenHasherTest {

    private static final String CHAVE = "uma-chave-de-teste-com-mais-de-32-caracteres";

    @Test
    void hashEhDeterministicoEIgnoraMaiusculas() {
        TokenHasher h = new TokenHasher(CHAVE, false);
        assertThat(h.hash(" brd-br-sp-abc ")).isEqualTo(h.hash("BRD-BR-SP-ABC")).hasSize(64);
    }

    @Test
    void chavesDiferentesGeramHashesDiferentes() {
        assertThat(new TokenHasher(CHAVE, false).hash("BRD-BR-SP-ABC"))
            .isNotEqualTo(new TokenHasher(CHAVE + "x", false).hash("BRD-BR-SP-ABC"));
    }

    @Test
    void semChaveEmProducaoNaoSobe() {
        assertThatThrownBy(() -> new TokenHasher("", false))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("TOKEN_HMAC_SECRET");
    }

    @Test
    void chaveCurtaNaoSobe() {
        assertThatThrownBy(() -> new TokenHasher("curta", false))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("32");
    }

    @Test
    void chaveEfemeraSoQuandoPermitida() {
        assertThat(new TokenHasher("", true).hash("BRD-BR-SP-ABC")).hasSize(64);
    }
}
