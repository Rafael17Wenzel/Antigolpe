package com.backend.antigolpe.regioes;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Lista de UFs para seleção manual de região (dado público de referência). */
@RestController
public class RegiaoController {

    public record Regiao(String uf, String nome) {}

    private final JdbcTemplate jdbc;

    public RegiaoController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/api/regioes")
    public List<Regiao> listar() {
        return jdbc.query("SELECT uf, nome FROM regiao ORDER BY nome",
            (rs, i) -> new Regiao(rs.getString("uf"), rs.getString("nome")));
    }
}
