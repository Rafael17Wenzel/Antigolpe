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
    const error = new Error(
      "Não foi possível conectar ao serviço agora. Isso não indica golpe; tente novamente em instantes."
    );
    error.status = 0;
    throw error;
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

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return result;
}

/**
 * GET /api/vagas/exemplos
 *
 * Retorno: { valido: { tokenOuLink }, golpe: { tokenOuLink } }
 */
export function obterExemplos() {
  return request("/api/vagas/exemplos");
}

/**
 * POST /api/vagas/validar
 *
 * Requisição: { tokenOuLink: string }  (a vaga é identificada pelo token no backend)
 * Resposta: { status: "CONFIRMADO" | "NAO_CONFIRMADO", mensagem, vaga | null,
 *             idValidacao, cursosRecomendados }
 * 503: consulta indisponível (não é resultado negativo).
 */
export function validarVaga(tokenOuLink) {
  return request("/api/vagas/validar", {
    method: "POST",
    data: { tokenOuLink }
  });
}

/**
 * POST /api/denuncias
 *
 * DenunciaRequest:
 * {
 *   urlSuspeita: string,
 *   emailContato?: string,
 *   descricao: string,
 *   idValidacao?: string,  // referência opcional à consulta
 *   aceiteAviso: boolean   // leitura do aviso de privacidade (obrigatória)
 * }
 *
 * 201: { recebida, protocolo, mensagem }. 503: não registrada (nunca mostrar como sucesso).
 */
export function registrarDenuncia({
  urlSuspeita,
  emailContato,
  descricao,
  idValidacao,
  aceiteAviso
}) {
  return request("/api/denuncias", {
    method: "POST",
    data: {
      urlSuspeita,
      emailContato: emailContato || null,
      descricao,
      idValidacao: idValidacao || null,
      aceiteAviso: Boolean(aceiteAviso)
    }
  });
}

/**
 * GET /api/regioes → [{ uf, nome }]  (seleção manual de região; sem geolocalização)
 */
export function listarRegioes() {
  return request("/api/regioes");
}

/**
 * GET /api/vagas/sugestoes?uf=XX
 * Até 3 vagas publicadas e com fonte cadastrada; sem UF, somente remotas.
 * Resposta: { uf, criterio, vagas: [{ id, cargo, modalidade, uf, cidade, fonteCadastrada, ficticia }], aviso }
 */
export function sugerirVagas(uf) {
  const query = uf ? `?uf=${encodeURIComponent(uf)}` : "";
  return request(`/api/vagas/sugestoes${query}`);
}
