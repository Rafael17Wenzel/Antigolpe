package com.backend.antigolpe.controller;

import com.backend.antigolpe.dto.DenunciaRequest;
import com.backend.antigolpe.dto.DenunciaResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/denuncias")
public class DenunciaController {

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public DenunciaResponse registrar(
            @RequestBody DenunciaRequest request) {

        if (request == null
                || request.urlSuspeita() == null
                || request.urlSuspeita().isBlank()
                || request.descricao() == null
                || request.descricao().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Informe o link suspeito e os detalhes da denúncia."
            );
        }

        // Protocolo fictício. Nada é salvo ou enviado a terceiros.
        String protocolo = "DEMO-" +
            UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();

        return new DenunciaResponse(
            true,
            protocolo,
            "Denúncia simulada recebida. Nenhum sistema externo foi notificado."
        );
    }
}
