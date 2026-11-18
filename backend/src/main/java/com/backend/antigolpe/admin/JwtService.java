package com.backend.antigolpe.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * JWT HS256 mínimo para a área administrativa: cabeçalho fixo (só HS256 é aceito,
 * nunca "none"), assinatura comparada em tempo constante e expiração obrigatória.
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String ALG = "HmacSHA256";
    private static final String CABECALHO = b64("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
    static final String EMISSOR = "antigolpe";

    private final SecretKeySpec chave;
    private final Duration validade;
    private final Clock clock;
    private final JsonMapper json = JsonMapper.builder().build();

    public JwtService(@Value("${app.admin.jwt-secret:}") String segredo,
                      @Value("${app.admin.sessao-horas:8}") long horas, Clock clock) {
        if (segredo == null || segredo.length() < 32) {
            byte[] aleatoria = new byte[32];
            new SecureRandom().nextBytes(aleatoria);
            this.chave = new SecretKeySpec(aleatoria, ALG);
            if (segredo != null && !segredo.isBlank()) {
                log.warn("JWT_SECRET com menos de 32 caracteres foi ignorado; usando chave aleatória.");
            } else {
                log.info("JWT_SECRET não definido: chave aleatória (sessões caem ao reiniciar).");
            }
        } else {
            this.chave = new SecretKeySpec(segredo.getBytes(StandardCharsets.UTF_8), ALG);
        }
        this.validade = Duration.ofHours(horas);
        this.clock = clock;
    }

    public record Emitido(String token, Instant expiraEm) {}

    public Emitido emitir(String usuario) {
        Instant agora = clock.instant();
        Instant expira = agora.plus(validade);
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("iss", EMISSOR);
        claims.put("sub", usuario);
        claims.put("papel", "RH");
        claims.put("iat", agora.getEpochSecond());
        claims.put("exp", expira.getEpochSecond());
        String corpo = b64(json.writeValueAsBytes(claims));
        String assinado = CABECALHO + "." + corpo;
        return new Emitido(assinado + "." + b64(assinar(assinado)), expira);
    }

    /** Usuário do token, se a assinatura, o emissor e a validade estiverem corretos. */
    public Optional<String> validar(String token) {
        if (token == null) return Optional.empty();
        String[] partes = token.split("\\.", -1);
        if (partes.length != 3 || !CABECALHO.equals(partes[0])) return Optional.empty();
        try {
            byte[] esperada = assinar(partes[0] + "." + partes[1]);
            byte[] recebida = Base64.getUrlDecoder().decode(partes[2]);
            if (!MessageDigest.isEqual(esperada, recebida)) return Optional.empty();
            Map<?, ?> claims = json.readValue(Base64.getUrlDecoder().decode(partes[1]), Map.class);
            if (!EMISSOR.equals(claims.get("iss"))) return Optional.empty();
            if (!(claims.get("exp") instanceof Number exp)) return Optional.empty();
            if (clock.instant().getEpochSecond() >= exp.longValue()) return Optional.empty();
            return claims.get("sub") instanceof String sub ? Optional.of(sub) : Optional.empty();
        } catch (RuntimeException formatoInvalido) {
            return Optional.empty();
        }
    }

    private byte[] assinar(String conteudo) {
        try {
            Mac mac = Mac.getInstance(ALG);
            mac.init(chave);
            return mac.doFinal(conteudo.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao assinar JWT", e);
        }
    }

    private static String b64(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
