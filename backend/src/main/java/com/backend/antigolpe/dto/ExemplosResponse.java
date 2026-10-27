package com.backend.antigolpe.dto;

/** Valores mockados usados pelos testes rápidos do frontend. */
public record ExemplosResponse(
    Exemplo valido,
    Exemplo golpe
) {
    public record Exemplo(
        String vaga,
        String tokenOuLink
    ) {}
}
