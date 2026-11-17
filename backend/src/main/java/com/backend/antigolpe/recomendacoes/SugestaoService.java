package com.backend.antigolpe.recomendacoes;

import com.backend.antigolpe.vagas.Vaga;
import com.backend.antigolpe.vagas.VagaRepository;
import com.backend.antigolpe.validacoes.ServicoIndisponivelException;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Sugere até 3 vagas publicadas e com fonte cadastrada. A região vem SOMENTE
 * da escolha manual do usuário (nunca do prefixo do token nem de geolocalização).
 * Ordem: mesma UF (mesma cidade primeiro) e, para completar, vagas remotas.
 */
@Service
public class SugestaoService {

    public static final int LIMITE = 3;

    static final String AVISO =
        "Sugestões do cadastro do protótipo. Para se candidatar, procure a vaga no site oficial, "
            + "digitando o endereço você mesmo. Nunca use links recebidos por mensagem.";

    private final VagaRepository vagas;
    private final JdbcTemplate jdbc;

    public SugestaoService(VagaRepository vagas, JdbcTemplate jdbc) {
        this.vagas = vagas;
        this.jdbc = jdbc;
    }

    public SugestoesResponse sugerir(String ufInformada, String cidade) {
        String uf = ufInformada == null || ufInformada.isBlank() ? null : ufInformada.trim().toUpperCase(Locale.ROOT);
        try {
            if (uf != null && !regiaoExiste(uf)) {
                throw new RegiaoDesconhecidaException();
            }

            List<Vaga> lista = new ArrayList<>();
            String criterio;
            if (uf == null) {
                lista.addAll(vagas.remotasElegiveis(PageRequest.of(0, LIMITE)));
                criterio = "Sem região informada: somente vagas remotas.";
            } else {
                lista.addAll(vagas.elegiveisNaUf(uf, cidade == null ? "" : cidade.trim(), PageRequest.of(0, LIMITE)));
                if (lista.size() < LIMITE) {
                    vagas.remotasElegiveis(PageRequest.of(0, LIMITE)).stream()
                        .filter(v -> !lista.contains(v))
                        .limit(LIMITE - lista.size())
                        .forEach(lista::add);
                }
                criterio = "Vagas em " + uf + " e, para completar, vagas remotas.";
            }

            return new SugestoesResponse(uf, criterio, lista.stream().map(SugestaoService::paraSugestao).toList(), AVISO);
        } catch (RegiaoDesconhecidaException e) {
            throw e;
        } catch (RuntimeException e) {
            throw new ServicoIndisponivelException(e);
        }
    }

    private boolean regiaoExiste(String uf) {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM regiao WHERE uf = ?", Integer.class, uf);
        return n != null && n > 0;
    }

    private static SugestoesResponse.Sugestao paraSugestao(Vaga v) {
        return new SugestoesResponse.Sugestao(v.getSlug(), v.getCargo(), v.getModalidade().name(),
            v.getUf(), v.getCidade(), v.getFonteCadastrada(), v.isFicticia());
    }

    /** UF informada não existe na tabela de regiões. */
    public static class RegiaoDesconhecidaException extends RuntimeException {
        public RegiaoDesconhecidaException() {
            super("Região desconhecida");
        }
    }
}
