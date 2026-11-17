package com.backend.antigolpe.recomendacoes;

import java.util.List;

/**
 * Sugestões de vagas elegíveis. Sem links: o candidato deve procurar a vaga no
 * site oficial, digitando o endereço. Vagas fictícias vêm marcadas.
 *
 * @param uf       UF escolhida pelo usuário (nula = sem região)
 * @param criterio como a lista foi montada
 */
public record SugestoesResponse(
    String uf,
    String criterio,
    List<Sugestao> vagas,
    String aviso
) {
    public record Sugestao(
        String id,
        String cargo,
        String modalidade,
        String uf,
        String cidade,
        String fonteCadastrada,
        boolean ficticia
    ) {}
}
