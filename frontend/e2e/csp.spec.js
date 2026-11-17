import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOKENS, validar } from './apoio.js';

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

/**
 * Sprint 09: a política de segurança de conteúdo do site estático (render.yaml) não pode
 * quebrar o app. Com o Vite (sem CSP) passa trivialmente; o teste vale quando o build é
 * servido com os cabeçalhos de produção:
 *   npm run build && node scripts/servir-com-headers.mjs 4173
 *   E2E_BASE_URL=http://localhost:4173 npx playwright test e2e/csp.spec.js
 */
test('nenhuma violação de CSP no validador e no OCR', async ({ page }) => {
  test.setTimeout(90_000);
  const violacoes = [];
  page.on('console', (m) => /Content Security Policy|Refused to/i.test(m.text()) && violacoes.push(m.text()));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error(`Refused to load (CSP): ${e.violatedDirective} ${e.blockedURI}`);
    });
  });

  await page.goto('/');
  await validar(page, TOKENS.mg);
  await page.getByRole('button', { name: 'Alto contraste' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'alto-contraste'); // tema.js externo

  await page.goto('/#/simulador');
  await page.setInputFiles('#anexo-chat', path.join(FIXTURES, 'print-token.png'));
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.getByLabel('Possível token lido na imagem (leitura experimental):')).toHaveValue(TOKENS.mg, {
    timeout: 60_000,
  });

  expect(violacoes).toEqual([]);
});
