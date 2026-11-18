package com.backend.antigolpe.vagas;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

/** Vaga cadastrada. Nas bases de demonstração, todas são fictícias (ficticia = true). */
@Entity
@Table(name = "vaga")
public class Vaga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String slug;

    @Column(nullable = false, length = 120)
    private String cargo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private Modalidade modalidade;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(length = 2)
    private String uf;

    @Column(length = 100)
    private String cidade;

    @Column(name = "fonte_cadastrada", nullable = false, length = 200)
    private String fonteCadastrada;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private SituacaoVaga situacao;

    @Column(nullable = false)
    private boolean ficticia = true;

    @Column(name = "criada_em", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime criadaEm;

    protected Vaga() {}

    public Vaga(String slug, String cargo, Modalidade modalidade, String uf, String cidade,
                String fonteCadastrada, SituacaoVaga situacao, boolean ficticia) {
        this.slug = slug;
        this.cargo = cargo;
        this.modalidade = modalidade;
        this.uf = uf;
        this.cidade = cidade;
        this.fonteCadastrada = fonteCadastrada;
        this.situacao = situacao;
        this.ficticia = ficticia;
    }

    /** Código regional usado no prefixo do token: a UF, ou "RM" para vaga remota sem UF. */
    public String codigoRegional() {
        return uf != null ? uf : "RM";
    }

    public boolean publicada() {
        return situacao == SituacaoVaga.PUBLICADA;
    }

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public String getCargo() { return cargo; }
    public Modalidade getModalidade() { return modalidade; }
    public String getUf() { return uf; }
    public String getCidade() { return cidade; }
    public String getFonteCadastrada() { return fonteCadastrada; }
    public SituacaoVaga getSituacao() { return situacao; }
    public boolean isFicticia() { return ficticia; }
    public void setSituacao(SituacaoVaga situacao) { this.situacao = situacao; }
    public OffsetDateTime getCriadaEm() { return criadaEm; }

    /** Atualização feita pelo RH na área administrativa. */
    public void atualizar(String cargo, Modalidade modalidade, String uf, String cidade,
                          String fonteCadastrada, SituacaoVaga situacao, boolean ficticia) {
        this.cargo = cargo;
        this.modalidade = modalidade;
        this.uf = uf;
        this.cidade = cidade;
        this.fonteCadastrada = fonteCadastrada;
        this.situacao = situacao;
        this.ficticia = ficticia;
    }
}
