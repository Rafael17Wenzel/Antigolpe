package com.backend.antigolpe.tokens;

import com.backend.antigolpe.vagas.Vaga;
import jakarta.persistence.*;

import java.time.OffsetDateTime;

/**
 * Token de vaga, guardado em TEXTO PURO (decisão D056, a pedido do projeto) para que o RH
 * possa consultá-lo na área administrativa. Prefixo e 4 últimos caracteres continuam
 * guardados à parte para exibição mascarada.
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

    @Column(nullable = false, unique = true, length = 40)
    private String codigo;

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

    public Token(Vaga vaga, String codigo, String prefixo, String finalVisivel,
                 OffsetDateTime validoDe, OffsetDateTime validoAte) {
        this.vaga = vaga;
        this.codigo = codigo;
        this.prefixo = prefixo;
        this.finalVisivel = finalVisivel;
        this.validoDe = validoDe;
        this.validoAte = validoAte;
    }

    public void revogar(OffsetDateTime quando) {
        this.ativo = false;
        this.revogadoEm = quando;
    }

    public void setValidoAte(OffsetDateTime validoAte) {
        this.validoAte = validoAte;
    }

    public boolean vigenteEm(OffsetDateTime instante) {
        return !instante.isBefore(validoDe) && instante.isBefore(validoAte);
    }

    public Long getId() { return id; }
    public Vaga getVaga() { return vaga; }
    public String getCodigo() { return codigo; }
    public String getPrefixo() { return prefixo; }
    public String getFinalVisivel() { return finalVisivel; }
    public boolean isAtivo() { return ativo; }
    public OffsetDateTime getValidoDe() { return validoDe; }
    public OffsetDateTime getValidoAte() { return validoAte; }
    public OffsetDateTime getRevogadoEm() { return revogadoEm; }
}
