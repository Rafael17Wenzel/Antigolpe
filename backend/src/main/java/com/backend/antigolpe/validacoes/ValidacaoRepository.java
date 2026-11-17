package com.backend.antigolpe.validacoes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

public interface ValidacaoRepository extends JpaRepository<Validacao, UUID> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Validacao v WHERE v.criadaEm < :limite")
    int apagarAnterioresA(OffsetDateTime limite);
}
