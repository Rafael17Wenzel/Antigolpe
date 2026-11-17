package com.backend.antigolpe.recomendacoes;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Sugestões opcionais de vagas, exibidas após uma consulta não confirmada. */
@RestController
@Validated
public class SugestaoController {

    private final SugestaoService service;

    public SugestaoController(SugestaoService service) {
        this.service = service;
    }

    @GetMapping("/api/vagas/sugestoes")
    public SugestoesResponse sugerir(
            @RequestParam(required = false)
            @Pattern(regexp = "^[A-Za-z]{2}$", message = "Informe a UF com 2 letras.") String uf,
            @RequestParam(required = false)
            @Size(max = 100, message = "Cidade longa demais.") String cidade) {
        return service.sugerir(uf, cidade);
    }
}
