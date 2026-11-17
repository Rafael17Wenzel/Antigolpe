package com.backend.antigolpe.dto;

/**
 * Dados públicos da vaga vinculada ao token. uf, cidade e fonteCadastrada
 * passam a ser preenchidos a partir do banco (Sprint 03).
 */
public record VagaResumo(
    String id,
    String cargo,
    String uf,
    String cidade,
    String fonteCadastrada
) {}
