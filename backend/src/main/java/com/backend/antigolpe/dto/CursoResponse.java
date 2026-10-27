package com.backend.antigolpe.dto;

/**
 * Curso sugerido. Os títulos e categorias seguem o catálogo público da
 * Escola Virtual da Fundação Bradesco; as descrições são resumos do protótipo.
 */
public record CursoResponse(
    String id,
    String titulo,
    String descricao,
    String categoria
) {}
