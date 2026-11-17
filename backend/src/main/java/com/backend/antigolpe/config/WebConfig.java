package com.backend.antigolpe.config;

import com.backend.antigolpe.observabilidade.Metricas;
import com.backend.antigolpe.seguranca.LimiteRequisicoes;
import com.backend.antigolpe.seguranca.LimiteRequisicoesInterceptor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Clock;
import java.time.Duration;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String[] allowedOrigins;

    private final LimiteRequisicoes limiteValidacao;
    private final LimiteRequisicoes limiteDenuncia;
    private final LimiteRequisicoes limiteSugestao;
    private final Metricas metricas;

    public WebConfig(@Qualifier("limiteValidacao") LimiteRequisicoes limiteValidacao,
                     @Qualifier("limiteDenuncia") LimiteRequisicoes limiteDenuncia,
                     @Qualifier("limiteSugestao") LimiteRequisicoes limiteSugestao,
                     Metricas metricas) {
        this.limiteValidacao = limiteValidacao;
        this.limiteDenuncia = limiteDenuncia;
        this.limiteSugestao = limiteSugestao;
        this.metricas = metricas;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(allowedOrigins)
            .allowedMethods("GET", "POST", "OPTIONS")
            .exposedHeaders("Retry-After");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LimiteRequisicoesInterceptor("validar", limiteValidacao, metricas))
            .addPathPatterns("/api/vagas/validar");
        registry.addInterceptor(new LimiteRequisicoesInterceptor("denuncias", limiteDenuncia, metricas))
            .addPathPatterns("/api/denuncias");
        registry.addInterceptor(new LimiteRequisicoesInterceptor("sugestoes", limiteSugestao, metricas))
            .addPathPatterns("/api/vagas/sugestoes");
    }

    @Configuration
    static class Limites {
        @Bean
        LimiteRequisicoes limiteValidacao(@Value("${app.limite.validacao.por-minuto:20}") int porMinuto, Clock clock) {
            return new LimiteRequisicoes(porMinuto, Duration.ofMinutes(1), clock);
        }

        @Bean
        LimiteRequisicoes limiteDenuncia(@Value("${app.limite.denuncia.por-hora:10}") int porHora, Clock clock) {
            return new LimiteRequisicoes(porHora, Duration.ofHours(1), clock);
        }

        @Bean
        LimiteRequisicoes limiteSugestao(@Value("${app.limite.sugestao.por-minuto:30}") int porMinuto, Clock clock) {
            return new LimiteRequisicoes(porMinuto, Duration.ofMinutes(1), clock);
        }
    }
}
