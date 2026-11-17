package com.backend.antigolpe.denuncias;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Denúncia registrada no protótipo. Não é encaminhada a nenhum sistema externo. */
@Entity
@Table(name = "denuncia")
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 16)
    private String protocolo;

    @Column(name = "url_suspeita", nullable = false, length = 2048)
    private String urlSuspeita;

    @Column(name = "email_contato", length = 254)
    private String emailContato;

    @Column(nullable = false, length = 2000)
    private String descricao;

    @Column(name = "validacao_id")
    private UUID validacaoId;

    @Column(name = "aceite_aviso", nullable = false)
    private boolean aceiteAviso;

    @Column(name = "registrada_em", nullable = false)
    private OffsetDateTime registradaEm;

    protected Denuncia() {}

    public Denuncia(String protocolo, String urlSuspeita, String emailContato, String descricao,
                    UUID validacaoId, OffsetDateTime registradaEm) {
        this.protocolo = protocolo;
        this.urlSuspeita = urlSuspeita;
        this.emailContato = emailContato;
        this.descricao = descricao;
        this.validacaoId = validacaoId;
        this.aceiteAviso = true;
        this.registradaEm = registradaEm;
    }

    public Long getId() { return id; }
    public String getProtocolo() { return protocolo; }
    public String getUrlSuspeita() { return urlSuspeita; }
    public String getEmailContato() { return emailContato; }
    public String getDescricao() { return descricao; }
    public UUID getValidacaoId() { return validacaoId; }
    public OffsetDateTime getRegistradaEm() { return registradaEm; }
}
