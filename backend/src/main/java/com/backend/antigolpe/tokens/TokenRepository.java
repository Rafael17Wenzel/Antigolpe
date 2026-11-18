package com.backend.antigolpe.tokens;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {

    @EntityGraph(attributePaths = "vaga")
    Optional<Token> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    List<Token> findByVagaIdOrderByCriadoEmAscIdAsc(Long vagaId);
}
