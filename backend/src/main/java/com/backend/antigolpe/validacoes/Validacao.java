package com.backend.antigolpe.validacoes;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Registro de uma consulta. Guarda só metadados: nunca o texto ou o token consultado.
 * O id é o identificador público opaco devolvido como idValidacao.
 */
@Entity
@Table(name = "validacao")
public class Validacao {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "resultado_interno", nullable = false, length = 20)
    private ResultadoInterno resultadoInterno;

    @Column(name = "status_publico", nullable = false, length = 16)
    private String statusPublico;

    @Column(name = "token_id")
    private Long tokenId;

    @Column(name = "vaga_id")
    private Long vagaId;

    @Column(name = "criada_em", nullable = false)
    private OffsetDateTime criadaEm;

    protected Validacao() {}

    public Validacao(UUID id, ResultadoInterno resultado, Long tokenId, Long vagaId, OffsetDateTime criadaEm) {
        this.id = id;
        this.resultadoInterno = resultado;
        this.statusPublico = resultado.statusPublico();
        this.tokenId = tokenId;
        this.vagaId = vagaId;
        this.criadaEm = criadaEm;
    }

    public UUID getId() { return id; }
    public ResultadoInterno getResultadoInterno() { return resultadoInterno; }
    public String getStatusPublico() { return statusPublico; }
    public Long getTokenId() { return tokenId; }
    public Long getVagaId() { return vagaId; }
    public OffsetDateTime getCriadaEm() { return criadaEm; }
}
