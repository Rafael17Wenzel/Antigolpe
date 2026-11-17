package com.backend.antigolpe.seguranca;

import ch.qos.logback.classic.pattern.ExtendedThrowableProxyConverter;
import ch.qos.logback.classic.spi.IThrowableProxy;

/** Conversor do Logback: stack trace com tokens mascarados (%exSeguro). */
public class MascaraTokenExcecaoConverter extends ExtendedThrowableProxyConverter {
    @Override
    protected String throwableProxyToString(IThrowableProxy tp) {
        return MascaraToken.mascarar(super.throwableProxyToString(tp));
    }
}
