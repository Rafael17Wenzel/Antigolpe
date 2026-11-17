package com.backend.antigolpe.tokens;

import com.backend.antigolpe.vagas.Vaga;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;

/** Emissão e revogação de tokens. O valor em claro só existe no retorno de emitir(). */
@Service
public class TokenService {

    /** Alfabeto Crockford base32 (sem I, L, O, U): 5 bits por caractere, 16 caracteres = 80 bits. */
    private static final char[] ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ".toCharArray();

    private final SecureRandom random = new SecureRandom();
    private final TokenHasher hasher;
    private final TokenRepository repository;

    public TokenService(TokenHasher hasher, TokenRepository repository) {
        this.hasher = hasher;
        this.repository = repository;
    }

    public String gerarValor(Vaga vaga) {
        StringBuilder segredo = new StringBuilder(FormatoToken.TAMANHO_SEGREDO);
        for (int i = 0; i < FormatoToken.TAMANHO_SEGREDO; i++) {
            segredo.append(ALFABETO[random.nextInt(ALFABETO.length)]);
        }
        return FormatoToken.prefixo(vaga.codigoRegional()) + "-" + segredo;
    }

    /** Emite um token aleatório para a vaga e devolve o valor em claro (único momento em que existe). */
    @Transactional
    public String emitir(Vaga vaga, OffsetDateTime validoDe, OffsetDateTime validoAte) {
        String valor = gerarValor(vaga);
        cadastrar(vaga, valor, validoDe, validoAte);
        return valor;
    }

    /** Cadastra um valor conhecido (usado apenas pelos dados de demonstração). */
    @Transactional
    public Token cadastrar(Vaga vaga, String valor, OffsetDateTime validoDe, OffsetDateTime validoAte) {
        String normalizado = TokenHasher.normalizar(valor);
        String prefixo = normalizado.substring(0, normalizado.lastIndexOf('-'));
        String finalVisivel = normalizado.substring(normalizado.length() - 4);
        return repository.save(new Token(vaga, hasher.hash(normalizado), prefixo, finalVisivel, validoDe, validoAte));
    }
}
