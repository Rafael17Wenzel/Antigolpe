package com.backend.antigolpe.seguranca;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Cabeçalhos de segurança da API (só JSON, nunca HTML): nada pode ser embutido,
 * executado ou guardado em cache. HSTS apenas em HTTPS. Corpos declarados acima de
 * 32 KB são recusados (413) antes de serem lidos; as entradas válidas são bem menores.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CabecalhosSegurancaFilter extends OncePerRequestFilter {

    static final long CORPO_MAXIMO = 32 * 1024;
    /** Upload do print para leitura por IA: até 5 MB de imagem + envelope multipart. */
    static final long CORPO_MAXIMO_IMAGEM = 6L * 1024 * 1024;
    static final String ROTA_IMAGEM = "/api/simulador/ler-imagem";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
        response.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
        response.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        response.setHeader("Cache-Control", "no-store");
        if (request.isSecure()) {
            response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }
        long maximo = ROTA_IMAGEM.equals(request.getRequestURI()) ? CORPO_MAXIMO_IMAGEM : CORPO_MAXIMO;
        if (request.getContentLengthLong() > maximo) {
            response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"mensagem\":\"Conteúdo grande demais.\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
