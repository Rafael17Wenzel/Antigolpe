package com.backend.antigolpe.dto;

import java.util.List;

/**
 * Resultado público da validação.
 *
 * @param status             CONFIRMADO ou NAO_CONFIRMADO
 * @param vaga               vaga vinculada ao token; nula quando não confirmado
 * @param idValidacao        identificador opaco da consulta (sem o token)
 * @param cursosRecomendados confirmado: cursos do cargo; não confirmado: trilha de segurança
 */
public record ValidacaoResponse(
    String status,
    String mensagem,
    VagaResumo vaga,
    String idValidacao,
    List<CursoResponse> cursosRecomendados
) {}
