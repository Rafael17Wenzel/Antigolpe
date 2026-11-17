package com.backend.antigolpe.validacoes;

import com.backend.antigolpe.cursos.CursoConsulta;
import com.backend.antigolpe.dto.CursoResponse;
import com.backend.antigolpe.dto.ValidacaoResponse;
import com.backend.antigolpe.dto.VagaResumo;
import com.backend.antigolpe.observabilidade.Metricas;
import com.backend.antigolpe.tokens.FormatoToken;
import com.backend.antigolpe.tokens.Token;
import com.backend.antigolpe.tokens.TokenHasher;
import com.backend.antigolpe.tokens.TokenRepository;
import com.backend.antigolpe.vagas.Vaga;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Regra de validação: a vaga é identificada exclusivamente pelo token consultado
 * no cadastro (busca por HMAC). Nada é inferido do prefixo ou do texto da mensagem;
 * o prefixo só pode impedir uma confirmação, nunca produzi-la.
 */
@Service
public class ValidacaoService {

    static final String MSG_CONFIRMADO =
        "Encontramos este token no cadastro do protótipo, vinculado à vaga abaixo. "
            + "Isso indica correspondência no cadastro, mas não garante que a mensagem, "
            + "o recrutador ou o link sejam autênticos. Nunca pague taxas nem informe senhas.";

    static final String MSG_NAO_CONFIRMADO =
        "Não encontramos uma vaga ativa para este token no cadastro do protótipo. "
            + "Isso, por si só, não significa que seja golpe, mas não prossiga com cadastros "
            + "ou pagamentos sem confirmar a oportunidade por um canal oficial.";

    static final String MSG_SEM_TOKEN =
        "Não identificamos um token no texto ou link informado. Isso, por si só, não significa "
            + "que seja golpe, mas não prossiga com cadastros ou pagamentos sem confirmar a "
            + "oportunidade por um canal oficial.";

    private final TokenExtractor extractor;
    private final TokenHasher hasher;
    private final TokenRepository tokenRepository;
    private final CursoConsulta cursoConsulta;
    private final ValidacaoRepository validacaoRepository;
    private final Clock clock;
    private final Metricas metricas;

    public ValidacaoService(TokenExtractor extractor, TokenHasher hasher, TokenRepository tokenRepository,
                            CursoConsulta cursoConsulta, ValidacaoRepository validacaoRepository, Clock clock,
                            Metricas metricas) {
        this.extractor = extractor;
        this.hasher = hasher;
        this.tokenRepository = tokenRepository;
        this.cursoConsulta = cursoConsulta;
        this.validacaoRepository = validacaoRepository;
        this.clock = clock;
        this.metricas = metricas;
    }

    public ValidacaoResponse validar(String tokenOuLink) {
        UUID id = UUID.randomUUID();
        String idValidacao = id.toString();
        OffsetDateTime agora = OffsetDateTime.now(clock);
        Optional<String> candidato = extractor.extrair(tokenOuLink);

        if (candidato.isEmpty()) {
            registrar(new Validacao(id, ResultadoInterno.SEM_TOKEN, null, null, agora));
            metricas.validacao(ResultadoInterno.SEM_TOKEN);
            return naoConfirmado(idValidacao, ResultadoInterno.SEM_TOKEN);
        }

        Optional<Token> token;
        try {
            token = tokenRepository.findByHash(hasher.hash(candidato.get()));
        } catch (RuntimeException ex) {
            throw new ServicoIndisponivelException(ex);
        }

        ResultadoInterno resultado = classificar(token, candidato.get(), agora);
        registrar(new Validacao(id, resultado,
            token.map(Token::getId).orElse(null),
            resultado == ResultadoInterno.CONFIRMADO ? token.get().getVaga().getId() : null,
            agora));
        metricas.validacao(resultado);
        if (resultado != ResultadoInterno.CONFIRMADO) {
            return naoConfirmado(idValidacao, resultado);
        }

        Vaga vaga = token.orElseThrow().getVaga();
        return new ValidacaoResponse(
            resultado.statusPublico(),
            MSG_CONFIRMADO,
            new VagaResumo(vaga.getSlug(), vaga.getCargo(), vaga.getUf(), vaga.getCidade(), vaga.getFonteCadastrada()),
            idValidacao,
            cursos(() -> cursoConsulta.daVaga(vaga.getId()))
        );
    }

    static ResultadoInterno classificar(Optional<Token> encontrado, String candidato, OffsetDateTime agora) {
        if (encontrado.isEmpty()) {
            return ResultadoInterno.NAO_ENCONTRADO;
        }
        Token token = encontrado.get();
        if (!token.isAtivo()) {
            return ResultadoInterno.REVOGADO;
        }
        if (!token.vigenteEm(agora)) {
            return ResultadoInterno.EXPIRADO;
        }
        Vaga vaga = token.getVaga();
        if (!vaga.publicada()) {
            return ResultadoInterno.VAGA_INATIVA;
        }
        Optional<String> regiao = FormatoToken.regiao(TokenHasher.normalizar(candidato));
        if (regiao.isPresent() && !regiao.get().equals(vaga.codigoRegional())) {
            return ResultadoInterno.PREFIXO_DIVERGENTE;
        }
        return ResultadoInterno.CONFIRMADO;
    }

    private ValidacaoResponse naoConfirmado(String idValidacao, ResultadoInterno resultado) {
        // Mesma mensagem para todos os motivos ligados ao cadastro: evita enumeração.
        String mensagem = resultado == ResultadoInterno.SEM_TOKEN ? MSG_SEM_TOKEN : MSG_NAO_CONFIRMADO;
        return new ValidacaoResponse(resultado.statusPublico(), mensagem, null, idValidacao,
            cursos(() -> cursoConsulta.daTrilha(CursoConsulta.TRILHA_SEGURANCA)));
    }

    /** Histórico sem segredos. Falha ao registrar = consulta indisponível (nunca resultado negativo). */
    private void registrar(Validacao validacao) {
        try {
            validacaoRepository.save(validacao);
        } catch (RuntimeException ex) {
            throw new ServicoIndisponivelException(ex);
        }
    }

    private static List<CursoResponse> cursos(java.util.function.Supplier<List<CursoResponse>> busca) {
        try {
            return busca.get();
        } catch (RuntimeException ex) {
            throw new ServicoIndisponivelException(ex);
        }
    }
}
