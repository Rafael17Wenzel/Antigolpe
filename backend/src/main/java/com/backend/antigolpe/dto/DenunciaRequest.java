package com.backend.antigolpe.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * @param urlSuspeita  link, token ou texto denunciado (obrigatório)
 * @param emailContato contato opcional
 * @param descricao    detalhes (obrigatório)
 * @param idValidacao  referência opcional à consulta que originou a denúncia
 * @param aceiteAviso  confirmação de leitura do aviso de privacidade (obrigatória)
 */
public record DenunciaRequest(
    @NotBlank(message = "Informe o link, token ou texto suspeito.")
    @Size(max = 2048, message = "O link informado é longo demais (máximo de 2048 caracteres).")
    String urlSuspeita,

    @Email(message = "Informe um e-mail válido ou deixe o campo em branco.")
    @Size(max = 254, message = "O e-mail informado é longo demais.")
    String emailContato,

    @NotBlank(message = "Descreva o que aconteceu.")
    @Size(max = 2000, message = "Os detalhes são longos demais (máximo de 2000 caracteres).")
    String descricao,

    @Size(max = 36)
    String idValidacao,

    @NotNull(message = "Confirme que leu o aviso de privacidade.")
    @AssertTrue(message = "Confirme que leu o aviso de privacidade.")
    Boolean aceiteAviso
) {}
