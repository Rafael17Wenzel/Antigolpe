package com.backend.antigolpe;

import com.backend.antigolpe.demo.DemoSeeder;
import com.backend.antigolpe.validacoes.ValidacaoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Migrations e validação contra um PostgreSQL REAL. Roda só quando TEST_PG_URL,
 * TEST_PG_USER e TEST_PG_PASSWORD estão definidos (ex.: jdbc:postgresql://localhost:5432/antigolpe_test).
 * O banco deve estar vazio: o Flyway cria tudo.
 */
@SpringBootTest
@EnabledIfEnvironmentVariable(named = "TEST_PG_URL", matches = "jdbc:postgresql:.+")
class PostgresIntegracaoTest {

    @DynamicPropertySource
    static void postgres(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", () -> System.getenv("TEST_PG_URL"));
        r.add("spring.datasource.username", () -> System.getenv("TEST_PG_USER"));
        r.add("spring.datasource.password", () -> System.getenv("TEST_PG_PASSWORD"));
    }

    @Autowired JdbcTemplate jdbc;
    @Autowired ValidacaoService validacaoService;

    @Test
    void migrationsRodamNoPostgresEValidacaoUsaUfDoBanco() {
        assertThat(jdbc.queryForObject("SELECT version()", String.class)).startsWith("PostgreSQL");
        assertThat(jdbc.queryForObject(
            "SELECT COUNT(*) FROM flyway_schema_history WHERE success", Integer.class)).isGreaterThanOrEqualTo(2);
        var r = validacaoService.validar(DemoSeeder.TOKEN_MG);
        assertThat(r.status()).isEqualTo("CONFIRMADO");
        assertThat(r.vaga().uf()).isEqualTo("MG");
        assertThat(validacaoService.validar(DemoSeeder.TOKEN_REVOGADO).status()).isEqualTo("NAO_CONFIRMADO");
    }
}
