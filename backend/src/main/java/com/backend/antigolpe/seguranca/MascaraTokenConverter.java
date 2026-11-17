package com.backend.antigolpe.seguranca;

import ch.qos.logback.classic.pattern.MessageConverter;
import ch.qos.logback.classic.spi.ILoggingEvent;

/** Conversor do Logback: mensagem de log com tokens mascarados (%msgSeguro). */
public class MascaraTokenConverter extends MessageConverter {
    @Override
    public String convert(ILoggingEvent event) {
        return MascaraToken.mascarar(super.convert(event));
    }
}
