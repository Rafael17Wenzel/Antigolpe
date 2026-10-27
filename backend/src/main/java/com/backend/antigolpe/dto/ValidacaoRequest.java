package com.backend.antigolpe.dto;

/**
 * @param vaga        id da vaga (ver GET /api/vagas)
 * @param tokenOuLink token ou link recebido pelo candidato
 */
public record ValidacaoRequest(
    String vaga,
    String tokenOuLink
) {}
