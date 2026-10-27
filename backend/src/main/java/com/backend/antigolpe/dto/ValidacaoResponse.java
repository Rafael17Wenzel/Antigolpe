package com.backend.antigolpe.dto;

public record ValidacaoResponse(
    boolean valido,
    String status,
    String mensagem,
    String vaga,
    String tokenConsultado
) {}
