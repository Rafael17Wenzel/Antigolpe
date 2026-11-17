package com.backend.antigolpe.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/** Sprint 09: conversão da DATABASE_URL do Render para JDBC. */
class DatabaseUrlEnvironmentPostProcessorTest {

    private final DatabaseUrlEnvironmentPostProcessor pp = new DatabaseUrlEnvironmentPostProcessor();

    @Test
    void converteUrlInternaDoRender() {
        assertThat(DatabaseUrlEnvironmentPostProcessor.converter(
                "postgresql://antigolpe:s3nh%40F0rte@dpg-abc123-a:5432/antigolpe_db"))
            .contains(Map.of(
                "DB_URL", "jdbc:postgresql://dpg-abc123-a:5432/antigolpe_db",
                "DB_USER", "antigolpe",
                "DB_PASSWORD", "s3nh@F0rte"));
    }

    @Test
    void mantemParametrosEPortaPadrao() {
        assertThat(DatabaseUrlEnvironmentPostProcessor.converter(
                "postgres://u:p@host.example.com/db?sslmode=require").orElseThrow())
            .containsEntry("DB_URL", "jdbc:postgresql://host.example.com:5432/db?sslmode=require");
    }

    @Test
    void ignoraFormatosDesconhecidos() {
        assertThat(DatabaseUrlEnvironmentPostProcessor.converter(null)).isEmpty();
        assertThat(DatabaseUrlEnvironmentPostProcessor.converter("")).isEmpty();
        assertThat(DatabaseUrlEnvironmentPostProcessor.converter("mysql://u:p@h/db")).isEmpty();
        assertThat(DatabaseUrlEnvironmentPostProcessor.converter("postgresql://u:p@h")).isEmpty();
        assertThat(DatabaseUrlEnvironmentPostProcessor.converter("não é url")).isEmpty();
    }

    @Test
    void preencheSoOQueNaoFoiDefinido() {
        MockEnvironment env = new MockEnvironment()
            .withProperty("DATABASE_URL", "postgresql://render:segredo@h:5432/db")
            .withProperty("DB_USER", "outro");
        pp.postProcessEnvironment(env, null);
        assertThat(env.getProperty("DB_URL")).isEqualTo("jdbc:postgresql://h:5432/db");
        assertThat(env.getProperty("DB_USER")).isEqualTo("outro");
        assertThat(env.getProperty("DB_PASSWORD")).isEqualTo("segredo");
    }

    @Test
    void dbUrlExplicitaPrevalece() {
        MockEnvironment env = new MockEnvironment()
            .withProperty("DATABASE_URL", "postgresql://render:segredo@h:5432/db")
            .withProperty("DB_URL", "jdbc:postgresql://manual:5432/x");
        pp.postProcessEnvironment(env, null);
        assertThat(env.getProperty("DB_URL")).isEqualTo("jdbc:postgresql://manual:5432/x");
        assertThat(env.getPropertySources().contains(DatabaseUrlEnvironmentPostProcessor.FONTE)).isFalse();
    }
}
