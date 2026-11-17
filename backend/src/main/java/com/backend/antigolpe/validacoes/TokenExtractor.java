package com.backend.antigolpe.validacoes;

import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Extrai um candidato a token de um texto ou link, apenas por análise do texto.
 * Nunca acessa o link. O formato reconhecido não autentica nada: só a consulta
 * ao cadastro no backend confirma.
 *
 * Aceita o formato legado (ex.: BRD-2026-SEC89) e o alvo (ex.: BRD-BR-SP-XXXXXXXX).
 */
@Component
public class TokenExtractor {

    private static final Pattern TOKEN = Pattern.compile(
        "(?<![A-Z0-9])BRD(?:-[A-Z0-9]{2,40}){2,4}(?![A-Z0-9-])",
        Pattern.CASE_INSENSITIVE
    );

    public Optional<String> extrair(String entrada) {
        if (entrada == null) {
            return Optional.empty();
        }
        Matcher matcher = TOKEN.matcher(entrada);
        return matcher.find()
            ? Optional.of(matcher.group().toUpperCase(Locale.ROOT))
            : Optional.empty();
    }
}
