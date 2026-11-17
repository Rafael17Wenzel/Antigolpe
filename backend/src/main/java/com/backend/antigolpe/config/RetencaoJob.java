package com.backend.antigolpe.config;

import com.backend.antigolpe.denuncias.DenunciaRepository;
import com.backend.antigolpe.validacoes.ValidacaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.Clock;
import java.time.OffsetDateTime;

/** Apaga diariamente validações e denúncias além do prazo de retenção configurado. */
@Configuration
@EnableScheduling
public class RetencaoJob {

    private static final Logger log = LoggerFactory.getLogger(RetencaoJob.class);

    private final ValidacaoRepository validacoes;
    private final DenunciaRepository denuncias;
    private final Clock clock;
    private final int diasValidacao;
    private final int diasDenuncia;

    public RetencaoJob(ValidacaoRepository validacoes, DenunciaRepository denuncias, Clock clock,
                       @Value("${app.retencao.validacao-dias:90}") int diasValidacao,
                       @Value("${app.retencao.denuncia-dias:180}") int diasDenuncia) {
        this.validacoes = validacoes;
        this.denuncias = denuncias;
        this.clock = clock;
        this.diasValidacao = diasValidacao;
        this.diasDenuncia = diasDenuncia;
    }

    @Scheduled(cron = "${app.retencao.cron:0 30 3 * * *}")
    public void aplicar() {
        OffsetDateTime agora = OffsetDateTime.now(clock);
        int d = denuncias.apagarAnterioresA(agora.minusDays(diasDenuncia));
        int v = validacoes.apagarAnterioresA(agora.minusDays(diasValidacao));
        log.info("Retenção aplicada: {} denúncia(s) e {} validação(ões) removidas.", d, v);
    }
}
