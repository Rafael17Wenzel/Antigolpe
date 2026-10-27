package com.backend.antigolpe.mock;

import java.util.List;

/**
 * Vaga fictícia do protótipo. Cada vaga possui um único token de demonstração
 * e os ids dos cursos recomendados para o cargo.
 */
public record VagaMock(
    String id,
    String cargo,
    String token,
    List<String> cursos
) {}
