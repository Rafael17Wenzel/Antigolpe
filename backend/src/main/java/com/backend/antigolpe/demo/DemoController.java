package com.backend.antigolpe.demo;

import com.backend.antigolpe.dto.ExemplosResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Exemplos dos botões de teste rápido. Só existe quando os dados de demonstração estão ativos. */
@RestController
@ConditionalOnProperty(name = "app.demo.seed", havingValue = "true")
public class DemoController {

    @GetMapping("/api/vagas/exemplos")
    public ExemplosResponse exemplos() {
        return new ExemplosResponse(
            new ExemplosResponse.Exemplo(DemoSeeder.TOKEN_SP),
            new ExemplosResponse.Exemplo(DemoSeeder.LINK_GOLPE)
        );
    }
}
