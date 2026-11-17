import { expect, test } from '@playwright/test';
import { TOKENS, validar } from './apoio.js';

test.describe('denúncia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await validar(page, TOKENS.revogado);
    await page.locator('#denunciar').waitFor();
  });

  test('registra com protocolo após aceitar o aviso de privacidade', async ({ page }) => {
    await expect(page.locator('#urlSuspeita')).toHaveValue(TOKENS.revogado);
    await page.fill('#descricao', 'Pediram pagamento de taxa pelo WhatsApp.');
    await page.check('#aceiteAviso');
    await page.getByRole('button', { name: 'Enviar denúncia' }).click();
    await expect(page.locator('#denunciar')).toContainText(/Protocolo:\s*AG-[0-9A-Z]{10}/);
    await expect(page.locator('#denunciar')).toContainText('não é encaminhada ao Bradesco');
  });

  test('exige confirmação do aviso de privacidade', async ({ page }) => {
    await page.fill('#descricao', 'Detalhes');
    await page.getByRole('button', { name: 'Enviar denúncia' }).click();
    await expect(page.locator('#denunciar [role="alert"]')).toHaveText(/aviso de privacidade/);
    await expect(page.locator('#aceiteAviso')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#denunciar')).not.toContainText('Protocolo');
  });

  test('erro do backend é mostrado e nunca vira denúncia registrada', async ({ page }) => {
    await page.route('**/api/denuncias', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ mensagem: 'Não foi possível consultar agora. Isso não indica golpe nem confirma a vaga; tente novamente mais tarde.' }),
      }),
    );
    await page.fill('#descricao', 'Detalhes');
    await page.check('#aceiteAviso');
    await page.getByRole('button', { name: 'Enviar denúncia' }).click();
    await expect(page.locator('#denunciar [role="alert"]')).toContainText('tente novamente');
    await expect(page.locator('#denunciar')).not.toContainText('Protocolo');
  });

  test('e-mail inválido é recusado pelo backend com mensagem', async ({ page }) => {
    await page.fill('#emailContato', 'nao-e-email');
    await page.fill('#descricao', 'Detalhes');
    await page.check('#aceiteAviso');
    await page.getByRole('button', { name: 'Enviar denúncia' }).click();
    await expect(page.locator('#denunciar [role="alert"]')).toContainText('e-mail válido');
  });
});

test('validação indisponível não vira resultado negativo', async ({ page }) => {
  await page.route('**/api/vagas/validar', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ mensagem: 'Não foi possível consultar agora. Isso não indica golpe nem confirma a vaga; tente novamente mais tarde.' }) }),
  );
  await page.goto('/');
  await page.fill('#tokenOuLink', TOKENS.sp);
  await page.getByRole('button', { name: 'Validar oportunidade' }).click();
  await expect(page.getByRole('alert')).toContainText('não indica golpe');
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
  await expect(page.locator('#validador')).not.toContainText('Oferta não confirmada');
  await expect(page.locator('#denunciar')).toHaveCount(0);
});
