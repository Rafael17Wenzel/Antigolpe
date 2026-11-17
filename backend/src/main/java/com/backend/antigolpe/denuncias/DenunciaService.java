package com.backend.antigolpe.denuncias;

import com.backend.antigolpe.dto.DenunciaRequest;
import com.backend.antigolpe.dto.DenunciaResponse;
import com.backend.antigolpe.observabilidade.Metricas;
import com.backend.antigolpe.seguranca.MascaraToken;
import com.backend.antigolpe.validacoes.ServicoIndisponivelException;
import com.backend.antigolpe.validacoes.ValidacaoRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Registra denúncias com dados mínimos. A ligação com a validação é opcional:
 * ofertas não cadastradas podem ser denunciadas. Nada é enviado a terceiros.
 */
@Service
public class DenunciaService {

    static final String MENSAGEM =
        "Denúncia registrada no protótipo. Ela não é encaminhada ao Bradesco nem a outros órgãos; "
            + "guarde o protocolo e, se quiser, comunique também um canal oficial.";

    private static final char[] ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ".toCharArray();
    private static final int TENTATIVAS = 3;

    private final SecureRandom random = new SecureRandom();
    private final DenunciaRepository repository;
    private final ValidacaoRepository validacaoRepository;
    private final Clock clock;
    private final Metricas metricas;

    public DenunciaService(DenunciaRepository repository, ValidacaoRepository validacaoRepository, Clock clock,
                           Metricas metricas) {
        this.repository = repository;
        this.validacaoRepository = validacaoRepository;
        this.clock = clock;
        this.metricas = metricas;
    }

    public DenunciaResponse registrar(DenunciaRequest r) {
        try {
            UUID validacao = referenciaValida(r.idValidacao()).orElse(null);
            String email = r.emailContato() == null || r.emailContato().isBlank() ? null : r.emailContato().trim();

            for (int tentativa = 1; ; tentativa++) {
                try {
                    Denuncia salva = repository.saveAndFlush(new Denuncia(gerarProtocolo(),
                        MascaraToken.mascarar(r.urlSuspeita().trim()), email,
                        MascaraToken.mascarar(r.descricao().trim()), validacao, OffsetDateTime.now(clock)));
                    metricas.denuncia();
                    return new DenunciaResponse(true, salva.getProtocolo(), MENSAGEM);
                } catch (DataIntegrityViolationException colisao) {
                    if (tentativa >= TENTATIVAS) throw colisao;
                }
            }
        } catch (RuntimeException ex) {
            // Falha técnica nunca é apresentada como denúncia registrada.
            throw new ServicoIndisponivelException(ex);
        }
    }

    /** Usa a referência só se for um UUID de validação existente; caso contrário, ignora. */
    private Optional<UUID> referenciaValida(String idValidacao) {
        if (idValidacao == null || idValidacao.isBlank()) return Optional.empty();
        try {
            UUID id = UUID.fromString(idValidacao.trim());
            return validacaoRepository.existsById(id) ? Optional.of(id) : Optional.empty();
        } catch (IllegalArgumentException formatoInvalido) {
            return Optional.empty();
        }
    }

    String gerarProtocolo() {
        StringBuilder sb = new StringBuilder("AG-");
        for (int i = 0; i < 10; i++) sb.append(ALFABETO[random.nextInt(ALFABETO.length)]);
        return sb.toString();
    }
}
