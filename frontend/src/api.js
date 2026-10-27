const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

async function request(endpoint, { method = "GET", data } = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        ...(data !== undefined && { "Content-Type": "application/json" }),
        Accept: "application/json"
      },
      body: data !== undefined ? JSON.stringify(data) : undefined
    });
  } catch {
    throw new Error(
      "Não foi possível conectar à API. Verifique se o backend Spring Boot está executando."
    );
  }

  const text = await response.text();
  let result = {};

  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      result = { mensagem: text };
    }
  }

  if (!response.ok) {
    const message =
      result.mensagem ||
      result.detail ||
      result.message ||
      `Erro na requisição (HTTP ${response.status}).`;

    throw new Error(message);
  }

  return result;
}

/**
 * GET /api/vagas
 *
 * Retorno: [{ id: string, cargo: string }]
 */
export function listarVagas() {
  return request("/api/vagas");
}

/**
 * GET /api/vagas/exemplos
 *
 * Retorno:
 * {
 *   valido: { vaga: string, tokenOuLink: string },
 *   golpe:  { vaga: string, tokenOuLink: string }
 * }
 */
export function obterExemplos() {
  return request("/api/vagas/exemplos");
}

/**
 * POST /api/vagas/validar
 *
 * ValidacaoRequest:
 * {
 *   vaga: string,        // id da vaga (GET /api/vagas)
 *   tokenOuLink: string
 * }
 */
export function validarVaga(vaga, tokenOuLink) {
  return request("/api/vagas/validar", {
    method: "POST",
    data: { vaga, tokenOuLink }
  });
}

/**
 * POST /api/denuncias
 *
 * DenunciaRequest:
 * {
 *   urlSuspeita: string,
 *   emailContato: string,
 *   descricao: string
 * }
 */
export function registrarDenuncia({
  urlSuspeita,
  emailContato,
  descricao
}) {
  return request("/api/denuncias", {
    method: "POST",
    data: {
      urlSuspeita,
      emailContato: emailContato || null,
      descricao
    }
  });
}
