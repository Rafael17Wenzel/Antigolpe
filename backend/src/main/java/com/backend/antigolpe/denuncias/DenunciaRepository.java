package com.backend.antigolpe.denuncias;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface DenunciaRepository extends JpaRepository<Denuncia, Long> {

    Optional<Denuncia> findByProtocolo(String protocolo);

    @Modifying
    @Transactional
    @Query("DELETE FROM Denuncia d WHERE d.registradaEm < :limite")
    int apagarAnterioresA(OffsetDateTime limite);
}
