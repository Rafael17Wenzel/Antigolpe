package com.backend.antigolpe.seguranca;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Mascara tokens completos em textos livres (logs, denúncias). Mantém o prefixo
 * regional e os 4 últimos caracteres, que já são guardados para auditoria (D019).
 */
public final class MascaraToken {

    private static final Pattern TOKEN =
        Pattern.compile("(?i)(?<![A-Z0-9])BRD((?:-[A-Z0-9]{2,40}){2,4})(?![A-Z0-9])");

    private MascaraToken() {
    }

    public static String mascarar(String texto) {
        if (texto == null || texto.isEmpty()) return texto;
        Matcher m = TOKEN.matcher(texto);
        if (!m.find()) return texto;
        StringBuilder sb = new StringBuilder();
        do {
            m.appendReplacement(sb, Matcher.quoteReplacement(mascararUm(m.group())));
        } while (m.find());
        m.appendTail(sb);
        return sb.toString();
    }

    private static String mascararUm(String token) {
        int ultimo = token.lastIndexOf('-');
        String prefixo = token.substring(0, ultimo + 1);
        String segredo = token.substring(ultimo + 1);
        if (segredo.length() <= 4) {
            return prefixo + "*".repeat(segredo.length());
        }
        return prefixo + "*".repeat(segredo.length() - 4) + segredo.substring(segredo.length() - 4);
    }
}
