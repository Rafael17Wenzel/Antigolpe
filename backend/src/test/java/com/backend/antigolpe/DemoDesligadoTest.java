package com.backend.antigolpe;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.support.PropertiesLoaderUtils;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Sem configuração explícita, nenhum dado fictício é carregado (como em produção). */
@SpringBootTest
@TestPropertySource(properties = "app.demo.seed=false")
class DemoDesligadoTest {

    @Autowired JdbcTemplate jdbc;
    @Autowired WebApplicationContext context;

    @Test
    void configuracaoPrincipalDeixaDemoDesligado() throws Exception {
        Properties props = PropertiesLoaderUtils.loadProperties(new ClassPathResource("application.properties"));
        // Ligável só por variável explícita (DEMO_SEED); o padrão continua desligado
        assertThat(props.getProperty("app.demo.seed")).isEqualTo("${DEMO_SEED:false}");
        assertThat(props.getProperty("app.token.permitir-chave-efemera")).isEqualTo("false");
    }

    @Test
    void bancoSobeSoComDadosDeReferenciaESemVagas() {
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM vaga", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM token", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM regiao", Integer.class)).isEqualTo(27);
    }

    @Test
    void exemplosNaoSaoExpostos() throws Exception {
        MockMvcBuilders.webAppContextSetup(context).build()
            .perform(get("/api/vagas/exemplos"))
            .andExpect(status().isNotFound());
    }
}
