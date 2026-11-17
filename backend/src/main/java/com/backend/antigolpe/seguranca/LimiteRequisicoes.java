package com.backend.antigolpe.seguranca;

import java.time.Clock;
import java.time.Duration;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limite de requisições por cliente em janela fixa, em memória. Adequado a uma única
 * instância (protótipo). Com várias instâncias, usar armazenamento compartilhado.
 * A chave (endereço do cliente) fica só em memória: não é registrada nem persistida.
 */
public class LimiteRequisicoes {

    /** Teto de chaves em memória; acima disso, janelas vencidas são descartadas. */
    static final int MAX_CHAVES = 50_000;

    private final int limite;
    private final long janelaMs;
    private final Clock clock;
    private final Map<String, Janela> janelas = new ConcurrentHashMap<>();

    public LimiteRequisicoes(int limite, Duration janela, Clock clock) {
        if (limite < 1) throw new IllegalArgumentException("limite deve ser >= 1");
        this.limite = limite;
        this.janelaMs = janela.toMillis();
        this.clock = clock;
    }

    /** Resultado: 0 = permitido; > 0 = segundos até liberar. */
    public long consumir(String chave) {
        long agora = clock.millis();
        if (janelas.size() >= MAX_CHAVES) limparVencidas(agora);
        Janela j = janelas.compute(chave, (k, atual) ->
            atual == null || agora - atual.inicio >= janelaMs ? new Janela(agora, 1) : atual.mais1());
        if (j.contagem <= limite) return 0;
        return Math.max(1, (j.inicio + janelaMs - agora + 999) / 1000);
    }

    private void limparVencidas(long agora) {
        for (Iterator<Janela> it = janelas.values().iterator(); it.hasNext(); ) {
            if (agora - it.next().inicio >= janelaMs) it.remove();
        }
    }

    public void limpar() {
        janelas.clear();
    }

    public int limite() {
        return limite;
    }

    private record Janela(long inicio, int contagem) {
        Janela mais1() {
            return new Janela(inicio, contagem + 1);
        }
    }
}
