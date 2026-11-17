package com.backend.antigolpe.tokens;

import com.backend.antigolpe.vagas.Vaga;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

/**
 * Token de vaga. O valor em claro nunca é persistido: guarda-se só o HMAC
 * (hash), o prefixo público (ex.: BRD-BR-SP) e os 4 últimos caracteres para auditoria.
 */
@Entity
@Table(name = "token")
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vaga_id")
    private Vaga vaga;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(nullable = false, unique = true, length = 64)
    private String hash;

    @Column(nullable = false, length = 12)
    private String prefixo;

    @Column(name = "final_visivel", nullable = false, length = 4)
    private String finalVisivel;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "valido_de", nullable = false)
    private OffsetDateTime validoDe;

    @Column(name = "valido_ate", nullable = false)
    private OffsetDateTime validoAte;

    @Column(name = "revogado_em")
    private OffsetDateTime revogadoEm;

    @Column(name = "criado_em", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime criadoEm;

    protected Token() {}

    public Token(Vaga vaga, String hash, String prefixo, String finalVisivel,
                 OffsetDateTime validoDe, OffsetDateTime validoAte) {
        this.vaga = vaga;
        this.hash = hash;
        this.prefixo = prefixo;
        this.finalVisivel = finalVisivel;
        this.validoDe = validoDe;
        this.validoAte = validoAte;
    }

    public void revogar(OffsetDateTime quando) {
        this.ativo = false;
        this.revogadoEm = quando;
    }

    public boolean vigenteEm(OffsetDateTime instante) {
        return !instante.isBefore(validoDe) && instante.isBefore(validoAte);
    }

    public Long getId() { return id; }
    public Vaga getVaga() { return vaga; }
    public String getHash() { return hash; }
    public String getPrefixo() { return prefixo; }
    public String getFinalVisivel() { return finalVisivel; }
    public boolean isAtivo() { return ativo; }
    public OffsetDateTime getValidoDe() { return validoDe; }
    public OffsetDateTime getValidoAte() { return validoAte; }
    public OffsetDateTime getRevogadoEm() { return revogadoEm; }
}
