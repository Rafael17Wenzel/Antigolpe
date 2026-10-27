package com.backend.antigolpe.config;

import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * Devolve erros no formato { "mensagem": "..." }, que o frontend exibe ao usuário.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

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
}
