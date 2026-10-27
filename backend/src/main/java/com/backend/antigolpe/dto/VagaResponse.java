package com.backend.antigolpe.dto;

/** Vaga exposta ao frontend (sem o token). */
public record VagaResponse(
    String id,
    String cargo
) {}
