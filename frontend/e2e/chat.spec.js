import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { Buffer } from 'node:buffer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { TOKENS, ativarAltoContraste } from './apoio.js';

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const LOG = '[role="log"]';
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

async function abrirSimulador(page) {
  await page.goto('/#/simulador');
  await expect(page.getByRole('heading', { name: 'Simulador de chat' })).toBeFocused();
}

async function enviarTexto(page, texto) {
  await page.fill('#mensagem-chat', texto);
  await page.getByRole('button', { name: 'Enviar' }).click();
}

test.describe('Simulador de chat (Sprint 07)', () => {
  test('é rotulado como simulação e acessível pelo menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Simulador de chat' }).click();
    await expect(page.getByRole('heading', { name: 'Simulador de chat' })).toBeFocused();
    await expect(page.getByText('Simulação visual — não é o WhatsApp.')).toBeVisible();
    await expect(page.locator('#validador')).toHaveCount(0);

    await page.getByRole('link', { name: 'Voltar ao validador' }).click();
    await expect(page.locator('#validador')).toBeVisible();
  });

  test('texto colado com token: revisão e consulta confirmada', async ({ page }) => {
    await abrirSimulador(page);
    await enviarTexto(page, `Olá! Sua vaga foi aprovada. Código: ${TOKENS.mg} — responda até sexta.`);

    const revisao = page.getByLabel('Possível token encontrado no texto:');
    await expect(revisao).toHaveValue(TOKENS.mg);
    await expect(revisao).toBeFocused();

    // Nada é consultado antes da confirmação
    let consultas = 0;
    page.on('request', (r) => r.url().includes('/api/vagas/validar') && consultas++);
    await page.waitForTimeout(300);
    expect(consultas).toBe(0);

    await page.getByRole('button', { name: 'Consultar este token' }).click();
    const log = page.locator(LOG);
    await expect(log.getByText('Token encontrado no cadastro')).toBeVisible();
    await expect(log.getByText('Analista de Recursos Humanos')).toBeVisible();
    await expect(log.getByText(/não garante/i)).toBeVisible();
    expect(consultas).toBe(1);
    await expect(page.getByRole('button', { name: 'Consultar este token' })).toHaveCount(0);
  });

  test('pessoa corrige o token antes de consultar', async ({ page }) => {
    await abrirSimulador(page);
    await enviarTexto(page, `codigo BRD-BR-SP-7K2M9Q4XH3TZ8NWO`); // último caractere errado
    const revisao = page.getByLabel('Possível token encontrado no texto:');
    await revisao.fill(TOKENS.sp);

    const [req] = await Promise.all([
      page.waitForRequest('**/api/vagas/validar'),
      page.getByRole('button', { name: 'Consultar este token' }).click(),
    ]);
    expect(req.postDataJSON()).toEqual({ tokenOuLink: TOKENS.sp });
    await expect(page.locator(LOG).getByText('Analista de Segurança da Informação')).toBeVisible();
  });

  test('sem token: entrada manual e resultado não confirmado com denúncia opcional', async ({ page }) => {
    await abrirSimulador(page);
    await enviarTexto(page, 'Parabéns, você foi selecionado! Pague a taxa de cadastro pelo Pix.');

    const manual = page.getByLabel('Não identifiquei um token. Se você tiver o token, digite-o abaixo:');
    await expect(manual).toHaveValue('');
    await page.getByRole('button', { name: 'Consultar este token' }).click();
    await expect(page.getByText('Digite o token para consultar, ou cancele.')).toBeVisible();

    await manual.fill(TOKENS.revogado);
    await page.getByRole('button', { name: 'Consultar este token' }).click();
    const log = page.locator(LOG);
    await expect(log.getByText('Oferta não confirmada')).toBeVisible();
    await expect(log.getByText(/golpe confirmado/i)).toHaveCount(0);

    await log.getByRole('button', { name: 'Quero denunciar (opcional)' }).click();
    await expect(page.locator('#aceiteAviso')).toBeVisible();
  });

  test('cancelar não consulta nada', async ({ page }) => {
    await abrirSimulador(page);
    let consultas = 0;
    page.on('request', (r) => r.url().includes('/api/vagas/validar') && consultas++);
    await enviarTexto(page, TOKENS.rj);
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByText('Tudo bem, nada foi consultado.')).toBeVisible();
    expect(consultas).toBe(0);
  });

  test('falha técnica não vira resultado negativo', async ({ page }) => {
    await page.route('**/api/vagas/validar', (r) =>
      r.fulfill({ status: 503, contentType: 'application/json', body: '{"mensagem":"indisponível"}' }),
    );
    await abrirSimulador(page);
    await enviarTexto(page, TOKENS.sp);
    await page.getByRole('button', { name: 'Consultar este token' }).click();
    await expect(page.getByText(/não indica golpe nem confirma a vaga/)).toBeVisible();
    await expect(page.getByText('Oferta não confirmada')).toHaveCount(0);
  });

  test('mensagem vazia mostra erro acessível', async ({ page }) => {
    await abrirSimulador(page);
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByRole('alert')).toHaveText('Cole ou digite uma mensagem, ou anexe uma imagem.');
    await expect(page.locator('#mensagem-chat')).toHaveAttribute('aria-invalid', 'true');
  });

  test('arquivo que não é imagem é recusado', async ({ page }) => {
    await abrirSimulador(page);
    await page.setInputFiles('#anexo-chat', path.join(FIXTURES, 'falso.png'));
    await expect(page.getByRole('alert')).toContainText('Formato não aceito');
    await expect(page.getByRole('button', { name: 'Remover imagem' })).toHaveCount(0);
  });

  test('imagem acima de 5 MB é recusada', async ({ page }) => {
    await abrirSimulador(page);
    const grande = Buffer.alloc(5 * 1024 * 1024 + 1);
    PNG.forEach((b, i) => (grande[i] = b));
    await page.setInputFiles('#anexo-chat', { name: 'grande.png', mimeType: 'image/png', buffer: grande });
    await expect(page.getByRole('alert')).toContainText('passa de 5 MB');
  });

  test('anexo pode ser removido antes do envio', async ({ page }) => {
    await abrirSimulador(page);
    await page.setInputFiles('#anexo-chat', path.join(FIXTURES, 'print-token.png'));
    await expect(page.getByAltText('Prévia do anexo: print-token.png')).toBeVisible();
    await page.getByRole('button', { name: 'Remover imagem' }).click();
    await expect(page.getByAltText('Prévia do anexo: print-token.png')).toHaveCount(0);
  });

  test('OCR experimental lê o token do print, no navegador', async ({ page }) => {
    test.setTimeout(90_000);
    const externas = [];
    page.on('request', (r) => {
      const u = new URL(r.url());
      if (!['localhost', '127.0.0.1'].includes(u.hostname) && u.protocol.startsWith('http')) externas.push(r.url());
    });
    const uploads = [];
    page.on('request', (r) => r.method() === 'POST' && uploads.push(r.postData() || ''));

    await abrirSimulador(page);
    await page.setInputFiles('#anexo-chat', path.join(FIXTURES, 'print-token.png'));
    await page.getByRole('button', { name: 'Enviar' }).click();

    const revisao = page.getByLabel('Possível token lido na imagem (leitura experimental):');
    await expect(revisao).toBeVisible({ timeout: 60_000 });
    await expect(revisao).toHaveValue(TOKENS.mg);
    await expect(page.getByAltText('Imagem anexada por você: print-token.png')).toBeVisible();

    await page.getByRole('button', { name: 'Consultar este token' }).click();
    await expect(page.locator(LOG).getByText('Token encontrado no cadastro')).toBeVisible();

    expect(externas, 'OCR não deve buscar recursos externos').toEqual([]);
    // A imagem nunca sai do navegador: o único POST é a consulta com o token revisado
    expect(uploads).toEqual([JSON.stringify({ tokenOuLink: TOKENS.mg })]);
  });

  test('não pede geolocalização', async ({ page, context }) => {
    await context.grantPermissions([]);
    await page.addInitScript(() => {
      window.__geo = 0;
      const geo = navigator.geolocation;
      if (geo) {
        geo.getCurrentPosition = () => window.__geo++;
        geo.watchPosition = () => window.__geo++;
      }
    });
    await abrirSimulador(page);
    await enviarTexto(page, TOKENS.mg);
    await page.getByRole('button', { name: 'Consultar este token' }).click();
    await expect(page.locator(LOG).getByText('Token encontrado no cadastro')).toBeVisible();
    expect(await page.evaluate(() => window.__geo)).toBe(0);
  });

  test('fluxo completo pelo teclado', async ({ page }) => {
    await abrirSimulador(page);
    await page.locator('#mensagem-chat').focus();
    await page.keyboard.type(`token ${TOKENS.remoto}`);
    await page.keyboard.press('Tab'); // anexar (input oculto, rótulo clicável)
    await page.getByRole('button', { name: 'Enviar' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Possível token encontrado no texto:')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator(LOG).getByText('Desenvolvedor(a) de Software')).toBeVisible();
  });

  for (const tema of ['padrão', 'alto contraste']) {
    test(`axe sem violações WCAG A/AA — tema ${tema}`, async ({ page }) => {
      await abrirSimulador(page);
      if (tema === 'alto contraste') await ativarAltoContraste(page);
      await enviarTexto(page, TOKENS.revogado);
      await page.getByRole('button', { name: 'Consultar este token' }).click();
      await page.locator(LOG).getByRole('button', { name: 'Quero denunciar (opcional)' }).click();
      await page.setInputFiles('#anexo-chat', path.join(FIXTURES, 'print-sem-token.png'));
      await expect(page.getByRole('button', { name: 'Remover imagem' })).toBeVisible();

      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }
});
