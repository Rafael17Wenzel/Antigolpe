package com.backend.antigolpe.simulador;

import com.backend.antigolpe.observabilidade.Metricas;
import com.backend.antigolpe.validacoes.TokenExtractor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

/**
 * Lê o token de um print com o Gemini (D061). A imagem só passa por memória: não é gravada
 * nem registrada em log. O que o modelo devolve só vale se casar com o padrão de token;
 * a confirmação continua sendo do cadastro, depois da revisão da pessoa.
 */
@Service
public class LeituraImagemService {

    private static final Logger log = LoggerFactory.getLogger(LeituraImagemService.class);
    static final long TAMANHO_MAXIMO = 5L * 1024 * 1024;
    static final String MSG_INDISPONIVEL =
        "O serviço de leitura de imagens por IA está com problemas no momento. Use a leitura local ou digite o token.";

    private final GeminiCliente gemini;
    private final TokenExtractor extractor;
    private final Metricas metricas;

    public LeituraImagemService(GeminiCliente gemini, TokenExtractor extractor, Metricas metricas) {
        this.gemini = gemini;
        this.extractor = extractor;
        this.metricas = metricas;
    }

    public record Resultado(String token, String origem) {}

    public Resultado ler(byte[] imagem) {
        String tipo = tipoPorAssinatura(imagem)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Formato não aceito. Use uma imagem PNG, JPEG ou WebP."));
        if (imagem.length > TAMANHO_MAXIMO) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "A imagem passa de 5 MB.");
        }
        if (!gemini.configurado()) {
            metricas.leituraIa("nao_configurado");
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, MSG_INDISPONIVEL);
        }
        String texto;
        try {
            texto = gemini.lerTexto(imagem, tipo);
        } catch (GeminiCliente.GeminiIndisponivelException e) {
            metricas.leituraIa("erro");
            log.warn("Leitura por IA indisponível: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, MSG_INDISPONIVEL);
        }
        // Só aceita algo no formato de token; texto livre do modelo é descartado
        Optional<String> token = extractor.extrair(texto);
        metricas.leituraIa(token.isPresent() ? "token" : "sem_token");
        return new Resultado(token.orElse(null), "ia");
    }

    /** Tipo pelo conteúdo do arquivo (não pela extensão nem pelo cabeçalho enviado). */
    static Optional<String> tipoPorAssinatura(byte[] b) {
        if (b == null || b.length < 12) return Optional.empty();
        if ((b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') return Optional.of("image/png");
        if ((b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) return Optional.of("image/jpeg");
        if (b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F' && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return Optional.of("image/webp");
        }
        return Optional.empty();
    }
}
