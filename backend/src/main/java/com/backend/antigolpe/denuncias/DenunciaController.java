package com.backend.antigolpe.denuncias;

import com.backend.antigolpe.dto.DenunciaRequest;
import com.backend.antigolpe.dto.DenunciaResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Registro de denúncias. Não há rota pública de consulta ou listagem: o acesso
 * aos registros é restrito (ver docs/SECURITY.md e DECISIONS D032).
 */
@RestController
@RequestMapping("/api/denuncias")
public class DenunciaController {

    private final DenunciaService service;

    public DenunciaController(DenunciaService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DenunciaResponse registrar(@Valid @RequestBody DenunciaRequest request) {
        return service.registrar(request);
    }
}
