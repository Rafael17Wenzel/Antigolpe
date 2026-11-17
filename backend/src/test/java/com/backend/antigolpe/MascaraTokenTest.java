package com.backend.antigolpe;

import com.backend.antigolpe.seguranca.LimiteRequisicoes;
import com.backend.antigolpe.seguranca.MascaraToken;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;

/** Sprint 08: unidades de mascaramento e de limite por janela. */
class MascaraTokenTest {

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
        "BRD-BR-SP-7K2M9Q4XH3TZ8NWD|BRD-BR-SP-************8NWD",
        "codigo brd-br-rm-h6n2c8w4z9k5d3jf ok|codigo brd-br-rm-************d3jf ok",
        "http://a.example/?token=BRD-BR-RJ-P4V8X2KD9M3QR7TB&x=1|http://a.example/?token=BRD-BR-RJ-************R7TB&x=1",
        "BRD-2026-SEC89|BRD-2026-*EC89",
        "sem token aqui|sem token aqui",
        "BRD-BR-SP-AAAAAAAAAAAAAAAA e BRD-BR-MG-BBBBBBBBBBBBBBBB|BRD-BR-SP-************AAAA e BRD-BR-MG-************BBBB"
    })
    void mascara(String entrada, String esperado) {
        assertThat(MascaraToken.mascarar(entrada)).isEqualTo(esperado);
    }

    @Test
    void nuloEVazio() {
        assertThat(MascaraToken.mascarar(null)).isNull();
        assertThat(MascaraToken.mascarar("")).isEmpty();
    }

    @Test
    void limiteLiberaAposAJanela() {
        AtomicLong agora = new AtomicLong(1_000_000);
        Clock clock = new Clock() {
            public ZoneOffset getZone() { return ZoneOffset.UTC; }
            public Clock withZone(java.time.ZoneId z) { return this; }
            public Instant instant() { return Instant.ofEpochMilli(agora.get()); }
        };
        LimiteRequisicoes limite = new LimiteRequisicoes(2, Duration.ofMinutes(1), clock);
        assertThat(limite.consumir("a")).isZero();
        assertThat(limite.consumir("a")).isZero();
        assertThat(limite.consumir("a")).isEqualTo(60);
        assertThat(limite.consumir("b")).isZero();
        agora.addAndGet(30_000);
        assertThat(limite.consumir("a")).isEqualTo(30);
        agora.addAndGet(30_000);
        assertThat(limite.consumir("a")).isZero();
    }
}
