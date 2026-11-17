package com.backend.antigolpe.validacoes;

/**
 * Situação interna da consulta. Para evitar enumeração de tokens, o público
 * só vê CONFIRMADO ou NAO_CONFIRMADO; os demais detalhes ficam para auditoria.
 */
public enum ResultadoInterno {
    CONFIRMADO,
    NAO_ENCONTRADO,
    EXPIRADO,
    REVOGADO,
    VAGA_INATIVA,
    PREFIXO_DIVERGENTE,
    SEM_TOKEN;

    public String statusPublico() {
        return this == CONFIRMADO ? "CONFIRMADO" : "NAO_CONFIRMADO";
    }
}
