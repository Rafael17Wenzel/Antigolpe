package com.backend.antigolpe.admin;

import com.backend.antigolpe.vagas.Modalidade;
import com.backend.antigolpe.vagas.SituacaoVaga;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/** Contratos da área administrativa. */
public final class AdminDtos {

    private AdminDtos() {}

    public record VagaForm(
        @NotBlank(message = "Informe o cargo.") @Size(min = 3, max = 120, message = "O cargo deve ter de 3 a 120 caracteres.")
        String cargo,
        @NotNull(message = "Informe a modalidade.") Modalidade modalidade,
        @Pattern(regexp = "^[A-Za-z]{2}$", message = "UF inválida.") String uf,
        @Size(max = 100, message = "A cidade deve ter até 100 caracteres.") String cidade,
        @NotBlank(message = "Informe a fonte da vaga.") @Size(max = 200, message = "A fonte deve ter até 200 caracteres.")
        String fonteCadastrada,
        @NotNull(message = "Informe a situação.") SituacaoVaga situacao,
        @NotNull(message = "Informe se a vaga é fictícia.") Boolean ficticia,
        @NotNull(message = "Informe até quando o token vale.") LocalDate tokenValidoAte,
        @Size(max = 10, message = "Escolha no máximo 10 cursos.") List<String> cursos) {}

    public record TokenView(String codigo, String situacao, OffsetDateTime validoDe, OffsetDateTime validoAte,
                            OffsetDateTime revogadoEm) {}

    public record CursoRef(String id, String titulo) {}

    public record VagaView(String id, String cargo, Modalidade modalidade, String uf, String cidade,
                           String fonteCadastrada, SituacaoVaga situacao, boolean ficticia,
                           OffsetDateTime criadaEm, List<CursoRef> cursos, List<TokenView> tokens) {}

    public record DenunciaView(String protocolo, OffsetDateTime registradaEm, String urlSuspeita,
                               String descricao, String emailContato, boolean ligadaAValidacao) {}
}
