package com.backend.antigolpe.tokens;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Locale;

/**
 * Calcula o HMAC-SHA256 determinístico do token normalizado, usado para busca.
 * A chave vem de TOKEN_HMAC_SECRET (mínimo de 32 caracteres). Sem chave, só é
 * permitido gerar uma chave efêmera quando app.token.permitir-chave-efemera=true
 * (perfis de desenvolvimento); em qualquer outro caso a aplicação não sobe.
 */
@Component
public class TokenHasher {

    private static final Logger log = LoggerFactory.getLogger(TokenHasher.class);
    private static final String ALGORITMO = "HmacSHA256";
    static final int TAMANHO_MINIMO_CHAVE = 32;

    private final SecretKeySpec chave;

    public TokenHasher(@Value("${app.token.hmac-secret:}") String segredo,
                       @Value("${app.token.permitir-chave-efemera:false}") boolean permitirEfemera) {
        if (segredo == null || segredo.isBlank()) {
            if (!permitirEfemera) {
                throw new IllegalStateException(
                    "TOKEN_HMAC_SECRET não definido. Defina a variável de ambiente (mínimo de "
                        + TAMANHO_MINIMO_CHAVE + " caracteres).");
            }
            byte[] aleatoria = new byte[32];
            new SecureRandom().nextBytes(aleatoria);
            this.chave = new SecretKeySpec(aleatoria, ALGORITMO);
            log.warn("TOKEN_HMAC_SECRET ausente: usando chave efêmera (somente desenvolvimento). "
                + "Tokens cadastrados deixam de valer ao reiniciar, exceto os de demonstração, que são regenerados.");
            return;
        }
        if (segredo.length() < TAMANHO_MINIMO_CHAVE) {
            throw new IllegalStateException(
                "TOKEN_HMAC_SECRET curto demais: use no mínimo " + TAMANHO_MINIMO_CHAVE + " caracteres.");
        }
        this.chave = new SecretKeySpec(segredo.getBytes(StandardCharsets.UTF_8), ALGORITMO);
    }

    public static String normalizar(String token) {
        return token.trim().toUpperCase(Locale.ROOT);
    }

    public String hash(String token) {
        try {
            Mac mac = Mac.getInstance(ALGORITMO);
            mac.init(chave);
            byte[] resultado = mac.doFinal(normalizar(token).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(resultado);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao calcular HMAC do token", e);
        }
    }
}
