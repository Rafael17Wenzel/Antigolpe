package com.backend.antigolpe.simulador;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

/** Simulador de chat: leitura do token de um print pela IA (Gemini), com consentimento explícito. */
@RestController
@RequestMapping("/api/simulador")
public class SimuladorController {

    private final LeituraImagemService leitura;

    public SimuladorController(LeituraImagemService leitura) {
        this.leitura = leitura;
    }

    @PostMapping(path = "/ler-imagem", consumes = "multipart/form-data")
    public LeituraImagemService.Resultado lerImagem(
        @RequestParam("imagem") MultipartFile imagem,
        @RequestParam(name = "consentimento", defaultValue = "false") boolean consentimento) throws IOException {
        if (!consentimento) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "É preciso concordar com o envio da imagem ao Google Gemini.");
        }
        if (imagem.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie uma imagem.");
        }
        if (imagem.getSize() > LeituraImagemService.TAMANHO_MAXIMO) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "A imagem passa de 5 MB.");
        }
        return leitura.ler(imagem.getBytes());
    }
}
