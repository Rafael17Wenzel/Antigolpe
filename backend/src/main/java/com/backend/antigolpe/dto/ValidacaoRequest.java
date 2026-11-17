package com.backend.antigolpe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @param tokenOuLink token, link ou texto recebido pelo candidato
 */
public record ValidacaoRequest(
    @NotBlank(message = "Informe o token ou link recebido.")
    @Size(max = 2048, message = "O texto informado é longo demais (máximo de 2048 caracteres).")
    String tokenOuLink
) {}
