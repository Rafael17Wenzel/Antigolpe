package com.backend.antigolpe.seguranca;

import com.backend.antigolpe.observabilidade.Metricas;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;

/**
 * Aplica o limite às rotas públicas de escrita/consulta. Roda depois do CORS do
 * Spring MVC, então a resposta 429 chega ao navegador com os cabeçalhos de CORS.
 */
public class LimiteRequisicoesInterceptor implements HandlerInterceptor {

    static final String MENSAGEM =
        "Muitas consultas em pouco tempo. Aguarde um instante e tente novamente.";

    private final String rota;
    private final LimiteRequisicoes limite;
    private final Metricas metricas;

    public LimiteRequisicoesInterceptor(String rota, LimiteRequisicoes limite, Metricas metricas) {
        this.rota = rota;
        this.limite = limite;
        this.metricas = metricas;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
        throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        long espera = limite.consumir(request.getRemoteAddr());
        if (espera == 0) return true;

        metricas.limiteExcedido(rota);
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader(HttpHeaders.RETRY_AFTER, Long.toString(espera));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"mensagem\":\"" + MENSAGEM + "\"}");
        return false;
    }
}
