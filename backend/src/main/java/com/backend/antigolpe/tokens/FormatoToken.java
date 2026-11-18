package com.backend.antigolpe.tokens;

import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Formato ilustrativo do token: BRD-BR-&lt;REGIÃO&gt;-&lt;SEGREDO&gt;.
 * Região = UF (2 letras) ou "RM" para vaga remota sem UF. O prefixo serve à
 * leitura humana e à checagem de consistência; ele NÃO autentica nada.
 */
public final class FormatoToken {

    public static final String EMISSOR = "BRD";
    public static final String PAIS = "BR";
    public static final String REGIAO_REMOTA = "RM";
    public static final int TAMANHO_SEGREDO = 16;

    private static final Pattern REGIONAL = Pattern.compile("^BRD-BR-([A-Z]{2})-([0-9A-Z]{" + TAMANHO_SEGREDO + "})$");

    private FormatoToken() {}

    public static String normalizar(String token) {
        return token.trim().toUpperCase(Locale.ROOT);
    }

    /** Região indicada no prefixo, se o token estiver no formato regional. */
    public static Optional<String> regiao(String tokenNormalizado) {
        Matcher m = REGIONAL.matcher(tokenNormalizado);
        return m.matches() ? Optional.of(m.group(1)) : Optional.empty();
    }

    public static String prefixo(String codigoRegional) {
        return EMISSOR + "-" + PAIS + "-" + codigoRegional;
    }
}
