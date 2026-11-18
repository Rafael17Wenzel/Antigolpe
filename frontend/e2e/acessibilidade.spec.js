import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { RESULTADO, TOKENS, ativarAltoContraste, validar } from './apoio.js';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function semViolacoes(page, contexto) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  const resumo = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} nó(s) — ${v.help}`);
  expect(resumo, `Violações axe em: ${contexto}`).toEqual([]);
}

for (const tema of ['padrão', 'alto contraste']) {
  test.describe(`axe — tema ${tema}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      if (tema === 'alto contraste') await ativarAltoContraste(page);
    });

    test('página inicial', async ({ page }) => {
      await semViolacoes(page, `inicial / ${tema}`);
    });

    test('resultado confirmado com cursos', async ({ page }) => {
      await validar(page, TOKENS.sp);
      await semViolacoes(page, `confirmado / ${tema}`);
    });

    test('não confirmado com denúncia e cursos', async ({ page }) => {
      await validar(page, TOKENS.revogado);
      await page.locator('#denunciar').waitFor();
      await semViolacoes(page, `não confirmado / ${tema}`);
    });

    test('erro de entrada', async ({ page }) => {
      await page.getByRole('button', { name: 'Validar oportunidade' }).click();
      await semViolacoes(page, `erro / ${tema}`);
    });

    test('tela de login do RH', async ({ page }) => {
      await page.goto('/#/login');
      await page.getByRole('heading', { name: 'Entrar na área do RH' }).waitFor();
      await semViolacoes(page, `login / ${tema}`);
    });
  });
}

test('fluxo principal só com teclado', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const pular = page.getByRole('link', { name: 'Ir ao conteúdo' });
  await expect(pular).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#conteudo-principal')).toBeFocused();

  // Do conteúdo principal até o campo de token
  await page.keyboard.press('Tab');
  await expect(page.locator('#tokenOuLink')).toBeFocused();
  await page.keyboard.type(TOKENS.mg);
  await page.keyboard.press('Enter');

  const titulo = page.locator(`${RESULTADO} h3`);
  await expect(titulo).toHaveText('Token encontrado no cadastro');
  await expect(titulo).toBeFocused();
});

test('erro é anunciado e ligado ao campo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Validar oportunidade' }).click();
  const campo = page.locator('#tokenOuLink');
  await expect(page.getByRole('alert')).toHaveText(/Informe o token ou link recebido/);
  await expect(campo).toHaveAttribute('aria-invalid', 'true');
  await expect(campo).toHaveAttribute('aria-describedby', /tokenOuLink-erro/);
  await expect(campo).toBeFocused();
});

test('resultado fica em região anunciada (aria-live)', async ({ page }) => {
  await page.goto('/');
  const regiao = page.locator('#validador [aria-live="polite"]').first();
  await expect(regiao).toBeAttached();
  await validar(page, TOKENS.rj);
  await expect(regiao).toContainText('Token encontrado no cadastro');
});

test('alto contraste usa paleta própria, persiste e é aplicado antes do React', async ({ page }) => {
  await page.goto('/');
  const botao = page.getByRole('button', { name: 'Alto contraste' });
  await expect(botao).toHaveAttribute('aria-pressed', 'false');
  await botao.click();
  await expect(botao).toHaveAttribute('aria-pressed', 'true');

  const fundo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(fundo).toBe('rgb(0, 0, 0)');
  const filtro = await page.evaluate(() => getComputedStyle(document.querySelector('#topo')).filter);
  expect(filtro).toBe('none');

  // Recarrega e lê o atributo no primeiro DOMContentLoaded, antes do React montar
  const temaInicial = new Promise((resolve) => {
    page.once('domcontentloaded', async () => {
      resolve(await page.evaluate(() => document.documentElement.getAttribute('data-tema')));
    });
  });
  await page.reload();
  expect(await temaInicial).toBe('alto-contraste');
  await expect(page.getByRole('button', { name: 'Alto contraste' })).toHaveAttribute('aria-pressed', 'true');
});

test('sem botões de simulação nem de arquitetura; Entrar leva ao login', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Simular/ })).toHaveCount(0);
  await expect(page.getByText('Arquitetura do projeto')).toHaveCount(0);
  await page.getByRole('link', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Entrar na área do RH' })).toBeFocused();
});

test('FAQ: acordeão com aria-expanded e conteúdo oculto', async ({ page }) => {
  await page.goto('/');
  const pergunta = page.getByRole('button', { name: /taxa para participação/ });
  await expect(pergunta).toHaveAttribute('aria-expanded', 'false');
  await pergunta.focus();
  await page.keyboard.press('Enter');
  await expect(pergunta).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#faq-resposta-0')).toBeVisible();
});

test('reflow em 320 px (equivalente a 400% de zoom) sem rolagem horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await validar(page, TOKENS.revogado);
  const largura = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(largura).toBeLessThanOrEqual(320);
});

test('respeita preferência de movimento reduzido', async ({ browser }) => {
  const contexto = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await contexto.newPage();
  await page.goto('/');
  const comportamento = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  expect(comportamento).toBe('auto');
  await contexto.close();
});

test('aviso de protótipo acadêmico sempre visível', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Protótipo acadêmico — não é canal oficial do Bradesco')).toBeVisible();
});
