package com.backend.antigolpe.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;

/**
 * Login da área administrativa (RH). Usuário fixo root/root por decisão do projeto
 * (D057, exceção registrada à regra "nenhuma credencial no código").
 */
@RestController
@RequestMapping("/api/admin")
public class AuthController {

    static final String USUARIO = "root";
    static final String SENHA = "root";
    static final String MSG_INVALIDO = "Usuário ou senha inválidos.";

    private final JwtService jwt;

    public AuthController(JwtService jwt) {
        this.jwt = jwt;
    }

    public record LoginRequest(
        @NotBlank(message = "Informe o usuário.") @Size(max = 100) String usuario,
        @NotBlank(message = "Informe a senha.") @Size(max = 200) String senha) {}

    public record LoginResponse(String token, Instant expiraEm, String usuario) {}

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest r) {
        // Compara usuário e senha sem atalho, para não revelar qual dos dois errou
        boolean usuarioOk = igual(r.usuario(), USUARIO);
        boolean senhaOk = igual(r.senha(), SENHA);
        if (!(usuarioOk & senhaOk)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, MSG_INVALIDO);
        }
        JwtService.Emitido e = jwt.emitir(USUARIO);
        return new LoginResponse(e.token(), e.expiraEm(), USUARIO);
    }

    private static boolean igual(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
