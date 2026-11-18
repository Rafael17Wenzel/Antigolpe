package com.backend.antigolpe.admin;

import com.backend.antigolpe.admin.AdminDtos.DenunciaView;
import com.backend.antigolpe.admin.AdminDtos.VagaForm;
import com.backend.antigolpe.admin.AdminDtos.VagaView;
import com.backend.antigolpe.cursos.CursoConsulta;
import com.backend.antigolpe.denuncias.DenunciaRepository;
import com.backend.antigolpe.dto.CursoResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Área administrativa do RH (protegida por JWT em AdminAuthInterceptor). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminVagaService vagas;
    private final DenunciaRepository denuncias;
    private final CursoConsulta cursos;

    public AdminController(AdminVagaService vagas, DenunciaRepository denuncias, CursoConsulta cursos) {
        this.vagas = vagas;
        this.denuncias = denuncias;
        this.cursos = cursos;
    }

    @GetMapping("/vagas")
    public List<VagaView> listarVagas() {
        return vagas.listar();
    }

    @GetMapping("/vagas/{id}")
    public VagaView buscarVaga(@PathVariable String id) {
        return vagas.buscar(id);
    }

    @PostMapping("/vagas")
    @ResponseStatus(HttpStatus.CREATED)
    public VagaView criarVaga(@Valid @RequestBody VagaForm form) {
        return vagas.criar(form);
    }

    @PutMapping("/vagas/{id}")
    public VagaView atualizarVaga(@PathVariable String id, @Valid @RequestBody VagaForm form) {
        return vagas.atualizar(id, form);
    }

    @PostMapping("/vagas/{id}/encerrar")
    public VagaView encerrarVaga(@PathVariable String id) {
        return vagas.encerrar(id);
    }

    @DeleteMapping("/vagas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirVaga(@PathVariable String id) {
        vagas.excluir(id);
    }

    @GetMapping("/cursos")
    public List<CursoResponse> catalogo() {
        return cursos.catalogo();
    }

    /** Somente leitura: as 500 denúncias mais recentes (a retenção apaga as antigas). */
    @GetMapping("/denuncias")
    public List<DenunciaView> listarDenuncias() {
        return denuncias.findTop500ByOrderByRegistradaEmDescIdDesc().stream()
            .map(d -> new DenunciaView(d.getProtocolo(), d.getRegistradaEm(), d.getUrlSuspeita(),
                d.getDescricao(), d.getEmailContato(), d.getValidacaoId() != null))
            .toList();
    }
}
