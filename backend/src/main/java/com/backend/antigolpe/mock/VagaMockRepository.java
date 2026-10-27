package com.backend.antigolpe.mock;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Base fictícia em memória. Nenhum dado real é consultado ou persistido.
 */
@Component
public class VagaMockRepository {

    private final List<VagaMock> vagas = List.of(
        new VagaMock("seguranca-informacao", "Analista de Segurança da Informação", "BRD-2026-SEC89"),
        new VagaMock("atendimento-agencia", "Analista de Atendimento (Agência)", "BRD-2026-X89K"),
        new VagaMock("desenvolvimento-software", "Desenvolvedor(a) de Software", "BRD-DEV-4022"),
        new VagaMock("recursos-humanos", "Analista de Recursos Humanos", "BRD-RH-1002")
    );

    /** Exemplo de link de golpe usado no teste rápido "Simular Golpe / Phishing". */
    public static final String LINK_GOLPE_EXEMPLO =
        "http://bradesco-vagas-premio.example/inscricao";

    public List<VagaMock> listar() {
        return vagas;
    }

    public Optional<VagaMock> buscarPorId(String id) {
        return vagas.stream()
            .filter(v -> v.id().equals(id))
            .findFirst();
    }

    public Optional<VagaMock> buscarPorToken(String token) {
        String normalizado = token.trim().toUpperCase(Locale.ROOT);
        return vagas.stream()
            .filter(v -> v.token().equals(normalizado))
            .findFirst();
    }
}
