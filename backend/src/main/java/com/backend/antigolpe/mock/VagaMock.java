package com.backend.antigolpe.mock;

/**
 * Vaga fictícia do protótipo. Cada vaga possui um único token de demonstração.
 */
public record VagaMock(
    String id,
    String cargo,
    String token
) {}
