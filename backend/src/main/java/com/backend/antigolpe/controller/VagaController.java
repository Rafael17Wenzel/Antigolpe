package com.backend.antigolpe.controller;

import com.backend.antigolpe.dto.ValidacaoRequest;
import com.backend.antigolpe.dto.ValidacaoResponse;
import com.backend.antigolpe.validacoes.ValidacaoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vagas")
public class VagaController {

    private final ValidacaoService validacaoService;

    public VagaController(ValidacaoService validacaoService) {
        this.validacaoService = validacaoService;
    }

    @PostMapping("/validar")
    public ValidacaoResponse validar(@Valid @RequestBody ValidacaoRequest request) {
        return validacaoService.validar(request.tokenOuLink());
    }
}
