package com.backend.antigolpe.vagas;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface VagaRepository extends JpaRepository<Vaga, Long> {

    Optional<Vaga> findBySlug(String slug);

    /** Vagas publicadas, com fonte cadastrada, na UF informada (mesma cidade primeiro). */
    @Query("""
        SELECT v FROM Vaga v
         WHERE v.situacao = com.backend.antigolpe.vagas.SituacaoVaga.PUBLICADA
           AND v.fonteCadastrada IS NOT NULL AND TRIM(v.fonteCadastrada) <> ''
           AND v.uf = :uf
         ORDER BY CASE WHEN LOWER(v.cidade) = LOWER(:cidade) THEN 0 ELSE 1 END, v.cargo
        """)
    List<Vaga> elegiveisNaUf(String uf, String cidade, Pageable pagina);

    /** Vagas remotas publicadas, com fonte cadastrada (fallback e opção sem região). */
    @Query("""
        SELECT v FROM Vaga v
         WHERE v.situacao = com.backend.antigolpe.vagas.SituacaoVaga.PUBLICADA
           AND v.fonteCadastrada IS NOT NULL AND TRIM(v.fonteCadastrada) <> ''
           AND v.modalidade = com.backend.antigolpe.vagas.Modalidade.REMOTA
         ORDER BY v.cargo
        """)
    List<Vaga> remotasElegiveis(Pageable pagina);
}
