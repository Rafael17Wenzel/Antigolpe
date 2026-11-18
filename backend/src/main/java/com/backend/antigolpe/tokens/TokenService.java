package com.backend.antigolpe.tokens;

import com.backend.antigolpe.vagas.Vaga;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;

/** Emissão de tokens (guardados em texto puro, D056). */
@Service
public class TokenService {

    /** Alfabeto Crockford base32 (sem I, L, O, U): 5 bits por caractere, 16 caracteres = 80 bits. */
    private static final char[] ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ".toCharArray();

    private final SecureRandom random = new SecureRandom();
    private final TokenRepository repository;

    public TokenService(TokenRepository repository) {
        this.repository = repository;
    }

    public String gerarValor(Vaga vaga) {
        StringBuilder segredo = new StringBuilder(FormatoToken.TAMANHO_SEGREDO);
        for (int i = 0; i < FormatoToken.TAMANHO_SEGREDO; i++) {
            segredo.append(ALFABETO[random.nextInt(ALFABETO.length)]);
        }
        return FormatoToken.prefixo(vaga.codigoRegional()) + "-" + segredo;
    }

    /** Emite um token aleatório (único) para a vaga. */
    @Transactional
    public Token emitir(Vaga vaga, OffsetDateTime validoDe, OffsetDateTime validoAte) {
        String valor;
        do {
            valor = gerarValor(vaga);
        } while (repository.existsByCodigo(valor));
        return cadastrar(vaga, valor, validoDe, validoAte);
    }

    /** Cadastra um valor conhecido (dados de demonstração) ou recém-gerado. */
    @Transactional
    public Token cadastrar(Vaga vaga, String valor, OffsetDateTime validoDe, OffsetDateTime validoAte) {
        String normalizado = FormatoToken.normalizar(valor);
        String prefixo = normalizado.substring(0, normalizado.lastIndexOf('-'));
        String finalVisivel = normalizado.substring(normalizado.length() - 4);
        return repository.save(new Token(vaga, normalizado, prefixo, finalVisivel, validoDe, validoAte));
    }
}
