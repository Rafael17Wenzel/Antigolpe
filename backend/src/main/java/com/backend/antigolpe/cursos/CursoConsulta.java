package com.backend.antigolpe.cursos;

import com.backend.antigolpe.dto.CursoResponse;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/** Leitura de cursos recomendados (por vaga ou por trilha), na ordem cadastrada. */
@Repository
public class CursoConsulta {

    public static final String TRILHA_SEGURANCA = "seguranca";

    private static final RowMapper<CursoResponse> MAPPER = (rs, i) -> new CursoResponse(
        rs.getString("slug"), rs.getString("titulo"), rs.getString("descricao"), rs.getString("categoria"));

    private final NamedParameterJdbcTemplate jdbc;

    public CursoConsulta(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<CursoResponse> daVaga(long vagaId) {
        return jdbc.query("""
            SELECT c.slug, c.titulo, c.descricao, cat.nome AS categoria
              FROM vaga_curso vc
              JOIN curso c ON c.id = vc.curso_id
              JOIN categoria cat ON cat.id = c.categoria_id
             WHERE vc.vaga_id = :vagaId
             ORDER BY vc.ordem
            """, Map.of("vagaId", vagaId), MAPPER);
    }

    /** Catálogo completo, para o RH escolher os cursos de uma vaga. */
    public List<CursoResponse> catalogo() {
        return jdbc.query("""
            SELECT c.slug, c.titulo, c.descricao, cat.nome AS categoria
              FROM curso c
              JOIN categoria cat ON cat.id = c.categoria_id
             ORDER BY c.titulo
            """, MAPPER);
    }

    public List<CursoResponse> daTrilha(String trilhaSlug) {
        return jdbc.query("""
            SELECT c.slug, c.titulo, c.descricao, cat.nome AS categoria
              FROM trilha_curso tc
              JOIN trilha t ON t.id = tc.trilha_id
              JOIN curso c ON c.id = tc.curso_id
              JOIN categoria cat ON cat.id = c.categoria_id
             WHERE t.slug = :slug
             ORDER BY tc.ordem
            """, Map.of("slug", trilhaSlug), MAPPER);
    }
}
