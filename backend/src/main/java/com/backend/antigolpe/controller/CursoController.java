package com.backend.antigolpe.controller;

import com.backend.antigolpe.dto.CursoResponse;
import com.backend.antigolpe.mock.CursoMockRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
public class CursoController {

    private final CursoMockRepository cursoRepository;

    public CursoController(CursoMockRepository cursoRepository) {
        this.cursoRepository = cursoRepository;
    }

    /** Trilha de segurança exibida antes de o usuário escolher um cargo. */
    @GetMapping("/seguranca")
    public List<CursoResponse> trilhaSeguranca() {
        return cursoRepository.trilhaSeguranca();
    }
}
