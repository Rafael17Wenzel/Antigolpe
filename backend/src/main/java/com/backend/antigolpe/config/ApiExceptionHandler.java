package com.backend.antigolpe.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import com.backend.antigolpe.recomendacoes.SugestaoService;
import com.backend.antigolpe.validacoes.ServicoIndisponivelException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.Map;

/**
 * Devolve erros no formato { "mensagem": "..." }, que o frontend exibe ao usuário.
 * Mensagens internas, stack traces e valores enviados (como tokens) nunca são expostos.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    private final com.backend.antigolpe.observabilidade.Metricas metricas;

    public ApiExceptionHandler(com.backend.antigolpe.observabilidade.Metricas metricas) {
        this.metricas = metricas;
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleStatus(ResponseStatusException ex) {
        return ResponseEntity
            .status(ex.getStatusCode())
            .body(Map.of("mensagem", ex.getReason() != null ? ex.getReason() : "Requisição inválida."));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleBody(HttpMessageNotReadableException ex) {
        return ResponseEntity
            .badRequest()
            .body(Map.of("mensagem", "Corpo da requisição inválido."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidacao(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .findFirst()
            .orElse("Requisição inválida.");
        return ResponseEntity.badRequest().body(Map.of("mensagem", mensagem));
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<Map<String, String>> handleParametros(HandlerMethodValidationException ex) {
        String mensagem = ex.getAllErrors().stream()
            .map(e -> e.getDefaultMessage())
            .filter(java.util.Objects::nonNull)
            .findFirst()
            .orElse("Requisição inválida.");
        return ResponseEntity.badRequest().body(Map.of("mensagem", mensagem));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraint(ConstraintViolationException ex) {
        String mensagem = ex.getConstraintViolations().stream()
            .map(v -> v.getMessage()).findFirst().orElse("Requisição inválida.");
        return ResponseEntity.badRequest().body(Map.of("mensagem", mensagem));
    }

    @ExceptionHandler(SugestaoService.RegiaoDesconhecidaException.class)
    public ResponseEntity<Map<String, String>> handleRegiao(SugestaoService.RegiaoDesconhecidaException ex) {
        return ResponseEntity.badRequest().body(Map.of("mensagem", "Região desconhecida. Escolha uma UF da lista."));
    }

    /** Falha técnica na consulta: nunca vira resultado negativo. */
    @ExceptionHandler(ServicoIndisponivelException.class)
    public ResponseEntity<Map<String, String>> handleIndisponivel(ServicoIndisponivelException ex) {
        metricas.indisponivel();
        log.error("Consulta indisponível: {}", ex.getCause() != null ? ex.getCause().getClass().getName() : "-");
        return ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(Map.of("mensagem",
                "Não foi possível consultar agora. Isso não indica golpe nem confirma a vaga; tente novamente mais tarde."));
    }

    /**
     * Demais erros. Exceções do Spring que já carregam status (rota inexistente,
     * método não suportado etc.) mantêm o status; o resto vira 500 genérico.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleOther(Exception ex) {
        if (ex instanceof ErrorResponse errorResponse) {
            HttpStatusCode status = errorResponse.getStatusCode();
            return ResponseEntity
                .status(status)
                .body(Map.of("mensagem", mensagemPara(status)));
        }

        log.error("Erro não tratado: {}", ex.getClass().getName(), ex);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("mensagem", "Erro interno. Tente novamente mais tarde."));
    }

    private static String mensagemPara(HttpStatusCode status) {
        return switch (status.value()) {
            case 404 -> "Recurso não encontrado.";
            case 405 -> "Método não suportado.";
            case 415 -> "Tipo de conteúdo não suportado.";
            default -> status.is4xxClientError()
                ? "Requisição inválida."
                : "Erro interno. Tente novamente mais tarde.";
        };
    }
}
