package com.backend.antigolpe.config;

import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * O Render entrega a conexão do PostgreSQL como {@code DATABASE_URL}
 * ({@code postgresql://usuario:senha@host:porta/banco}), formato que o JDBC não aceita.
 * Se {@code DB_URL} não estiver definida, deriva {@code DB_URL}, {@code DB_USER} e
 * {@code DB_PASSWORD} dessa variável. Valores definidos explicitamente sempre prevalecem.
 * Nada é registrado em log (a URL contém a senha).
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    static final String FONTE = "antigolpe-database-url";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication application) {
        if (temValor(env.getProperty("DB_URL"))) return;
        converter(env.getProperty("DATABASE_URL")).ifPresent(props -> {
            Map<String, Object> efetivos = new LinkedHashMap<>();
            props.forEach((k, v) -> {
                if (!temValor(env.getProperty(k))) efetivos.put(k, v);
            });
            env.getPropertySources().addLast(new MapPropertySource(FONTE, efetivos));
        });
    }

    /** Converte a URL do Render; vazio se ausente ou em formato não reconhecido. */
    static Optional<Map<String, String>> converter(String databaseUrl) {
        if (!temValor(databaseUrl)) return Optional.empty();
        try {
            URI uri = new URI(databaseUrl.trim());
            String esquema = uri.getScheme();
            if (!"postgres".equals(esquema) && !"postgresql".equals(esquema)) return Optional.empty();
            if (uri.getHost() == null || uri.getPath() == null || uri.getPath().length() < 2) return Optional.empty();

            int porta = uri.getPort() > 0 ? uri.getPort() : 5432;
            StringBuilder jdbc = new StringBuilder("jdbc:postgresql://")
                .append(uri.getHost()).append(':').append(porta).append(uri.getRawPath());
            if (uri.getRawQuery() != null) jdbc.append('?').append(uri.getRawQuery());

            Map<String, String> props = new LinkedHashMap<>();
            props.put("DB_URL", jdbc.toString());
            String userInfo = uri.getRawUserInfo();
            if (userInfo != null) {
                int i = userInfo.indexOf(':');
                props.put("DB_USER", decodificar(i < 0 ? userInfo : userInfo.substring(0, i)));
                if (i >= 0) props.put("DB_PASSWORD", decodificar(userInfo.substring(i + 1)));
            }
            return Optional.of(props);
        } catch (Exception formatoInvalido) {
            return Optional.empty();
        }
    }

    private static String decodificar(String s) {
        return URLDecoder.decode(s.replace("+", "%2B"), StandardCharsets.UTF_8);
    }

    private static boolean temValor(String s) {
        return s != null && !s.isBlank();
    }
}
