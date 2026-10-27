package com.backend.antigolpe.mock;

import com.backend.antigolpe.dto.CursoResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Cursos fictícios em memória (nomes do catálogo da Escola Virtual).
 */
@Component
public class CursoMockRepository {

    private static final String TI = "Tecnologia da Informação";
    private static final String PROGRAMACAO = "Programação";
    private static final String NEGOCIOS = "Negócios e Inovação";
    private static final String DESENVOLVIMENTO = "Desenvolvimento Pessoal e Profissional";

    /** Trilha de segurança: reforço exibido quando a vaga não é confirmada. */
    public static final List<String> TRILHA_SEGURANCA = List.of(
        "seguranca-ti",
        "lgpd",
        "letramento-digital"
    );

    private final Map<String, CursoResponse> cursos = Stream.of(
        new CursoResponse("seguranca-ti", "Segurança em Tecnologia da Informação",
            "Conceitos de proteção da informação, ameaças digitais e boas práticas de segurança.", TI),
        new CursoResponse("lgpd", "Lei Geral de Proteção de Dados (LGPD)",
            "Princípios da LGPD e cuidados no tratamento de dados pessoais.", NEGOCIOS),
        new CursoResponse("letramento-digital", "Letramento Digital",
            "Uso seguro e consciente de ferramentas e serviços digitais no dia a dia.", TI),
        new CursoResponse("redes", "Introdução a Redes de Computadores",
            "Fundamentos de redes, protocolos e comunicação entre sistemas.", TI),
        new CursoResponse("atendimento-publico", "Atendimento ao público",
            "Técnicas para um atendimento cordial, claro e eficiente.", DESENVOLVIMENTO),
        new CursoResponse("educacao-financeira", "Educação financeira",
            "Organização do orçamento e decisões financeiras conscientes.", DESENVOLVIMENTO),
        new CursoResponse("postura-imagem", "Postura e imagem profissional",
            "Comportamento, comunicação e imagem no ambiente de trabalho.", DESENVOLVIMENTO),
        new CursoResponse("logica-programacao", "Fundamentos de Lógica de Programação",
            "Raciocínio lógico e algoritmos, a base para aprender a programar.", PROGRAMACAO),
        new CursoResponse("java-basico", "Linguagem de Programação Java – Básico",
            "Primeiros passos em Java: sintaxe, variáveis e estruturas de controle.", PROGRAMACAO),
        new CursoResponse("etica-sistemas", "Ética no Desenvolvimento de Sistemas",
            "Responsabilidade e ética na criação de sistemas e no uso de dados.", PROGRAMACAO),
        new CursoResponse("comunicacao-empresarial", "Comunicação Empresarial",
            "Comunicação clara e eficaz no contexto corporativo.", DESENVOLVIMENTO),
        new CursoResponse("qualidade-vida", "Qualidade de vida e trabalho",
            "Bem-estar, equilíbrio e saúde no ambiente de trabalho.", DESENVOLVIMENTO)
    ).collect(Collectors.toMap(CursoResponse::id, Function.identity()));

    public List<CursoResponse> buscar(List<String> ids) {
        return ids.stream()
            .map(cursos::get)
            .toList();
    }
}
