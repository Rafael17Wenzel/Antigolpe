import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TOKENS, ativarAltoContraste, validar } from './apoio.js';

const BLOCO = '#sugestoes';

test.describe('sugestões regionais', () => {
  test.beforeEach(async ({ page }) => {
    // Detecta qualquer tentativa de usar geolocalização
    await page.addInitScript(() => {
      window.__geoChamadas = 0;
      const falso = () => { window.__geoChamadas += 1; };
      Object.defineProperty(navigator, 'geolocation', {
        value: { getCurrentPosition: falso, watchPosition: falso, clearWatch: () => {} },
      });
    });
    await page.goto('/');
    await validar(page, TOKENS.revogado);
    await page.locator(BLOCO).waitFor();
  });

  test('sem região mostra só remotas e nunca pede localização', async ({ page }) => {
    await expect(page.locator(`${BLOCO} li`).first()).toBeVisible();
    await expect(page.locator(BLOCO)).toContainText('somente vagas remotas');
    const itens = page.locator(`${BLOCO} li`);
    for (const texto of await itens.allTextContents()) expect(texto).toContain('Remota');
    expect(await page.evaluate(() => window.__geoChamadas)).toBe(0);
  });

  test('região escolhida prioriza a UF, limita a 3 e marca vagas fictícias', async ({ page }) => {
    await page.selectOption('#regiao', 'SP');
    await expect(page.locator(BLOCO)).toContainText('Vagas em SP');
    const itens = page.locator(`${BLOCO} li`);
    await expect(itens).toHaveCount(3);
    await expect(itens.first()).toContainText('/ SP');
    await expect(itens.first()).toContainText('Vaga fictícia de demonstração');
    await expect(page.locator(BLOCO)).not.toContainText('Analista de Dados');
    await expect(page.locator(BLOCO)).not.toContainText('Estágio');
  });

  test('bloco não tem links e orienta usar o site oficial', async ({ page }) => {
    await expect(page.locator(`${BLOCO} a`)).toHaveCount(0);
    await expect(page.locator(BLOCO)).toContainText('site oficial');
  });

  test('pode ser ocultado e não bloqueia a denúncia', async ({ page }) => {
    await page.getByRole('button', { name: 'Ocultar sugestões' }).click();
    await expect(page.locator(BLOCO)).toHaveCount(0);
    await page.fill('#descricao', 'Teste com sugestões ocultas');
    await page.check('#aceiteAviso');
    await page.getByRole('button', { name: 'Enviar denúncia' }).click();
    await expect(page.locator('#denunciar')).toContainText(/AG-[0-9A-Z]{10}/);
    await page.getByRole('button', { name: 'Mostrar sugestões de vagas' }).click();
    await expect(page.locator(BLOCO)).toBeVisible();
  });

  for (const tema of ['padrão', 'alto contraste']) {
    test(`acessível (axe) — ${tema}`, async ({ page }) => {
      if (tema === 'alto contraste') await ativarAltoContraste(page);
      await page.selectOption('#regiao', 'RJ');
      await expect(page.locator(`${BLOCO} li`).first()).toBeVisible();
      const { violations } = await new AxeBuilder({ page })
        .include(BLOCO)
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(violations.map((v) => v.id)).toEqual([]);
    });
  }
});

test('sugestões não aparecem quando o token é confirmado', async ({ page }) => {
  await page.goto('/');
  await validar(page, TOKENS.sp);
  await expect(page.locator(BLOCO)).toHaveCount(0);
});
