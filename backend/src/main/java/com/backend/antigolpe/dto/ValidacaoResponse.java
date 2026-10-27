package com.backend.antigolpe.dto;

import java.util.List;

/**
 * @param cursosRecomendados válido: cursos do cargo; não confirmado:
 *                           trilha de segurança seguida dos cursos do cargo
 */
public record ValidacaoResponse(
    boolean valido,
    String status,
    String mensagem,
    String vaga,
    String tokenConsultado,
    List<CursoResponse> cursosRecomendados
) {}
