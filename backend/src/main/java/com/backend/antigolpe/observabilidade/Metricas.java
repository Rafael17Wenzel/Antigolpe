package com.backend.antigolpe.observabilidade;

import com.backend.antigolpe.validacoes.ResultadoInterno;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

/**
 * Métricas agregadas, sem dados sensíveis: só contadores com etiquetas de baixa
 * cardinalidade (resultado, rota). Nunca token, texto consultado, IP, e-mail ou URL.
 */
@Component
public class Metricas {

    private final MeterRegistry registry;

    public Metricas(MeterRegistry registry) {
        this.registry = registry;
    }

    public void validacao(ResultadoInterno resultado) {
        Counter.builder("antigolpe.validacoes")
            .description("Consultas de validação por resultado")
            .tag("status", resultado.statusPublico())
            .tag("resultado", resultado.name())
            .register(registry).increment();
    }

    public void indisponivel() {
        registry.counter("antigolpe.indisponivel").increment();
    }

    public void denuncia() {
        registry.counter("antigolpe.denuncias").increment();
    }

    /** Leitura de print pela IA: token, sem_token, erro, nao_configurado. */
    public void leituraIa(String resultado) {
        registry.counter("antigolpe.leitura.ia", "resultado", resultado).increment();
    }

    public void limiteExcedido(String rota) {
        registry.counter("antigolpe.limite.excedido", "rota", rota).increment();
    }
}
