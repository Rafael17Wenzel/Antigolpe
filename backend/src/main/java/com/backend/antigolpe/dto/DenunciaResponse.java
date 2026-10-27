package com.backend.antigolpe.dto;

public record DenunciaResponse(
    boolean recebida,
    String protocolo,
    String mensagem
) {}
