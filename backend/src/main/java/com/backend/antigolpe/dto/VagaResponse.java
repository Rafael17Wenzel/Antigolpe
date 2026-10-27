package com.backend.antigolpe.dto;

import java.util.List;

/** Vaga exposta ao frontend (sem o token), com os cursos do cargo. */
public record VagaResponse(
    String id,
    String cargo,
    List<CursoResponse> cursos
) {}
