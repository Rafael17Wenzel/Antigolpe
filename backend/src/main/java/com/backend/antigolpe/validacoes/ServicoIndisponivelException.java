package com.backend.antigolpe.validacoes;

/** A consulta não pôde ser feita. Nunca deve ser tratada como resultado negativo. */
public class ServicoIndisponivelException extends RuntimeException {
    public ServicoIndisponivelException(Throwable causa) {
        super("Consulta indisponível", causa);
    }
}
