// Utilitários compartilhados pelos testes E2E.
export const TOKENS = {
  sp: 'BRD-BR-SP-7K2M9Q4XH3TZ8NWD',
  rj: 'BRD-BR-RJ-P4V8X2KD9M3QR7TB',
  remoto: 'BRD-BR-RM-H6N2C8W4Z9K5D3JF',
  mg: 'BRD-BR-MG-T3B7R5Y9Q2X8M4VC',
  expirado: 'BRD-BR-RJ-E7X2P9D4K8M3Q6WA',
  revogado: 'BRD-BR-MG-R5V9K3T7B2N8D4XC',
  encerrada: 'BRD-BR-SP-C8M4W2Q9T6K3X7PD',
  legado: 'BRD-2026-SEC89',
  linkGolpe: 'http://bradesco-vagas-premio.example/inscricao',
};

/** Card de resultado (coluna direita do validador). */
export const RESULTADO = '#validador [data-testid="resultado"]';

export async function validar(page, valor) {
  await page.fill('#tokenOuLink', valor);
  await page.getByRole('button', { name: 'Validar oportunidade' }).click();
  await page.locator(`${RESULTADO} h3`).waitFor();
}

export async function ativarAltoContraste(page) {
  await page.getByRole('button', { name: 'Alto contraste' }).click();
}
