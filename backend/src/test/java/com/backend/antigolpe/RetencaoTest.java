package com.backend.antigolpe;

import com.backend.antigolpe.config.RetencaoJob;
import com.backend.antigolpe.denuncias.Denuncia;
import com.backend.antigolpe.denuncias.DenunciaRepository;
import com.backend.antigolpe.validacoes.ResultadoInterno;
import com.backend.antigolpe.validacoes.Validacao;
import com.backend.antigolpe.validacoes.ValidacaoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/** Sprint 05: prazos de retenção (90 dias validação, 180 dias denúncia por padrão). */
@SpringBootTest
class RetencaoTest {

    @Autowired RetencaoJob job;
    @Autowired ValidacaoRepository validacoes;
    @Autowired DenunciaRepository denuncias;

    @Test
    void apagaSoOQuePassouDoPrazo() {
        OffsetDateTime agora = OffsetDateTime.now();
        UUID antiga = UUID.randomUUID();
        UUID recente = UUID.randomUUID();
        validacoes.save(new Validacao(antiga, ResultadoInterno.NAO_ENCONTRADO, null, null, agora.minusDays(91)));
        validacoes.save(new Validacao(recente, ResultadoInterno.NAO_ENCONTRADO, null, null, agora.minusDays(89)));
        Denuncia velha = denuncias.save(new Denuncia("AG-RETENCA0001", "x", null, "y", null, agora.minusDays(181)));
        Denuncia nova = denuncias.save(new Denuncia("AG-RETENCA0002", "x", null, "y", antiga, agora.minusDays(179)));

        job.aplicar();

        assertThat(validacoes.existsById(antiga)).isFalse();
        assertThat(validacoes.existsById(recente)).isTrue();
        assertThat(denuncias.existsById(velha.getId())).isFalse();
        // A denúncia recente permanece, sem a referência à validação apagada (ON DELETE SET NULL)
        assertThat(denuncias.findById(nova.getId()).orElseThrow().getValidacaoId()).isNull();
    }
}
