package com.backend.antigolpe.controller;

import com.backend.antigolpe.dto.CursoResponse;
import com.backend.antigolpe.dto.ExemplosResponse;
import com.backend.antigolpe.dto.ValidacaoRequest;
import com.backend.antigolpe.dto.ValidacaoResponse;
import com.backend.antigolpe.dto.VagaResponse;
import com.backend.antigolpe.mock.CursoMockRepository;
import com.backend.antigolpe.mock.VagaMock;
import com.backend.antigolpe.mock.VagaMockRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/vagas")
public class VagaController {

    private static final String MSG_NAO_CONFIRMADO =
        "Não foi possível confirmar a oferta na base fictícia. "
            + "Não prossiga com cadastros ou pagamentos sem "
            + "confirmar a oportunidade por um canal oficial.";

    private static final String MSG_OUTRA_VAGA =
        "O token existe na base fictícia, mas não pertence à vaga selecionada. "
            + "Não prossiga com cadastros ou pagamentos sem "
            + "confirmar a oportunidade por um canal oficial.";

    private final VagaMockRepository repository;
    private final CursoMockRepository cursoRepository;

    public VagaController(VagaMockRepository repository,
                          CursoMockRepository cursoRepository) {
        this.repository = repository;
        this.cursoRepository = cursoRepository;
    }

    @GetMapping
    public List<VagaResponse> listar() {
        return repository.listar().stream()
            .map(v -> new VagaResponse(v.id(), v.cargo(), cursoRepository.buscar(v.cursos())))
            .toList();
    }

    @GetMapping("/exemplos")
    public ExemplosResponse exemplos() {
        VagaMock primeira = repository.listar().getFirst();

        return new ExemplosResponse(
            new ExemplosResponse.Exemplo(primeira.id(), primeira.token()),
            new ExemplosResponse.Exemplo(primeira.id(), VagaMockRepository.LINK_GOLPE_EXEMPLO)
        );
    }

    @PostMapping("/validar")
    public ValidacaoResponse validar(@RequestBody ValidacaoRequest request) {

        if (request == null
                || request.vaga() == null
                || request.vaga().isBlank()
                || request.tokenOuLink() == null
                || request.tokenOuLink().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Informe a vaga e o token ou link."
            );
        }

        VagaMock vaga = repository.buscarPorId(request.vaga().trim())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Vaga não encontrada na base fictícia."
            ));

        String token = request.tokenOuLink().trim();
        Optional<VagaMock> dono = repository.buscarPorToken(token);

        if (dono.isPresent() && dono.get().id().equals(vaga.id())) {
            return new ValidacaoResponse(
                true,
                "VALIDO_DEMONSTRACAO",
                "Token reconhecido na base fictícia do protótipo para esta vaga.",
                vaga.cargo(),
                token,
                cursoRepository.buscar(vaga.cursos())
            );
        }

        return new ValidacaoResponse(
            false,
            "NAO_CONFIRMADO",
            dono.isPresent() ? MSG_OUTRA_VAGA : MSG_NAO_CONFIRMADO,
            vaga.cargo(),
            token,
            cursosAcolhimento(vaga)
        );
    }

    /** Trilha de segurança primeiro, depois os cursos do cargo (sem repetir). */
    private List<CursoResponse> cursosAcolhimento(VagaMock vaga) {
        List<String> ids = Stream.concat(
                CursoMockRepository.TRILHA_SEGURANCA.stream(),
                vaga.cursos().stream())
            .distinct()
            .toList();

        return cursoRepository.buscar(ids);
    }
}
