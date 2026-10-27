package com.backend.antigolpe.dto;

public record DenunciaRequest(
    String urlSuspeita,
    String emailContato,
    String descricao
) {}
