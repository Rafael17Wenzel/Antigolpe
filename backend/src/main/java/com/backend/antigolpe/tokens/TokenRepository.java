package com.backend.antigolpe.tokens;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {

    @EntityGraph(attributePaths = "vaga")
    Optional<Token> findByHash(String hash);
}
