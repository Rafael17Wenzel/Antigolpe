import { test, expect } from '@playwright/test';

import { TOKENS, RESULTADO, validar } from './apoio.js';

const MSG_429 = 'Muitas consultas em pouco tempo. Aguarde um instante e tente novamente.';
const resposta429 = (r) =>
  r.fulfill({
    status: 429,
    headers: { 'Retry-After': '30', 'Access-Control-Allow-Origin': '*' },
    contentType: 'application/json',
    body: JSON.stringify({ mensagem: MSG_429 }),
  });

test.describe('Hardening (Sprint 08)', () => {
  test('429 no validador mostra aviso de espera, nunca resultado negativo', async ({ page }) => {
    await page.route('**/api/vagas/validar', resposta429);
    await page.goto('/');
    await page.fill('#tokenOuLink', TOKENS.sp);
    await page.getByRole('button', { name: 'Validar oportunidade' }).click();
    await expect(page.getByRole('alert').filter({ hasText: MSG_429 })).toBeVisible();
    await expect(page.locator(`${RESULTADO} h3`)).toHaveCount(0);
    await expect(page.getByText('Oferta não confirmada')).toHaveCount(0);
  });

  test('429 no simulador mostra a mesma orientação', async ({ page }) => {
    await page.route('**/api/vagas/validar', resposta429);
    await page.goto('/#/simulador');
    await page.fill('#mensagem-chat', TOKENS.sp);
    await page.getByRole('button', { name: 'Enviar' }).click();
    await page.getByRole('button', { name: 'Consultar este token' }).click();
    await expect(page.locator('[role="log"]').getByText(MSG_429)).toBeVisible();
  });

  test('429 na denúncia não finge registro', async ({ page }) => {
    await page.route('**/api/denuncias', resposta429);
    await page.goto('/');
    await validar(page, TOKENS.revogado);
    await page.fill('#descricao', 'Pediram pagamento antecipado.');
    await page.check('#aceiteAviso');
    await page.getByRole('button', { name: /Enviar denúncia/ }).click();
    await expect(page.getByText(MSG_429)).toBeVisible();
    await expect(page.getByText(/protocolo/i)).toHaveCount(0);
  });

  test('conteúdo malicioso é exibido como texto, nunca executado', async ({ page }) => {
    const ataque = '<img src=x onerror="window.__xss=1"><script>window.__xss=1</script>';
    let alertas = 0;
    page.on('dialog', (d) => {
      alertas++;
      d.dismiss();
    });
    await page.goto('/#/simulador');
    await page.fill('#mensagem-chat', ataque);
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.locator('[role="log"]').getByText(ataque)).toBeVisible();
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    expect(alertas).toBe(0);
  });

  test('API real responde com cabeçalhos de segurança e sem token no erro', async ({ request }) => {
    const r = await request.post('http://localhost:8080/api/vagas/validar', {
      data: `{"tokenOuLink":"${TOKENS.sp}"`,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(r.status()).toBe(400);
    expect(await r.text()).not.toContain(TOKENS.sp);
    const h = r.headers();
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['content-security-policy']).toContain("default-src 'none'");
    expect(h['cache-control']).toBe('no-store');
  });
});
