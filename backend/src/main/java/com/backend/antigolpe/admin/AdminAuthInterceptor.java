package com.backend.antigolpe.admin;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;

/** Protege /api/admin/** (exceto o login): exige "Authorization: Bearer <JWT>" válido. */
public class AdminAuthInterceptor implements HandlerInterceptor {

    public static final String ATRIBUTO_USUARIO = "antigolpe.admin.usuario";
    static final String MENSAGEM = "Sessão inválida ou expirada. Entre novamente.";

    private final JwtService jwt;

    public AdminAuthInterceptor(JwtService jwt) {
        this.jwt = jwt;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
        throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        String cabecalho = request.getHeader(HttpHeaders.AUTHORIZATION);
        String token = cabecalho != null && cabecalho.startsWith("Bearer ") ? cabecalho.substring(7).trim() : null;
        var usuario = jwt.validar(token);
        if (usuario.isPresent()) {
            request.setAttribute(ATRIBUTO_USUARIO, usuario.get());
            return true;
        }
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"mensagem\":\"" + MENSAGEM + "\"}");
        return false;
    }
}
