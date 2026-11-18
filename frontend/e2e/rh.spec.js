import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import { TOKENS, RESULTADO, ativarAltoContraste, validar } from './apoio.js';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function entrar(page, usuario = 'root', senha = 'root') {
  await page.goto('/#/login');
  await page.fill('#rh-usuario', usuario);
  await page.fill('#rh-senha', senha);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
}

async function semViolacoes(page, contexto) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.length}`), contexto).toEqual([]);
}

test.describe('Área do RH (Sprint 11)', () => {
  test('Sair do cabeçalho também volta para a página principal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await entrar(page);
    await expect(page.getByRole('heading', { name: 'Gestão de vagas — RH' })).toBeVisible();
    await page.getByRole('banner').getByRole('button', { name: 'Sair' }).click();
    await expect(page.locator('#validador')).toBeVisible();
    await expect(page).not.toHaveURL(/#\/(login|admin)/);
  });

  test('rota protegida: sem login vai para a tela de login', async ({ page }) => {
    await page.goto('/#/admin');
    await expect(page).toHaveURL(/#\/login$/);
    await expect(page.getByRole('heading', { name: 'Entrar na área do RH' })).toBeVisible();
  });

  test('senha errada mostra erro e não entra', async ({ page }) => {
    await entrar(page, 'root', 'errada');
    await expect(page.getByRole('alert')).toHaveText('Usuário ou senha inválidos.');
    await expect(page.locator('#rh-senha')).toHaveValue('');
    await expect(page).toHaveURL(/#\/login$/);
  });

  test('root/root entra, vê tokens em texto e sai', async ({ page }) => {
    await entrar(page);
    await expect(page).toHaveURL(/#\/admin$/);
    await expect(page.getByRole('heading', { name: 'Gestão de vagas — RH' })).toBeFocused();
    const linha = page.getByRole('row', { name: /Analista de Segurança da Informação/ });
    await expect(linha.getByTestId('token-em-uso')).toHaveText(TOKENS.sp);

    // Sessão sobrevive a recarregar a aba
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Gestão de vagas — RH' })).toBeVisible();

    await page.getByRole('main').getByRole('button', { name: 'Sair' }).click();
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
    // Sair vai para a página principal, não para o login
    await expect(page).not.toHaveURL(/#\/login/);
    await expect(page.locator('#validador')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Entrar na área do RH' })).toHaveCount(0);
    await page.goto('/#/admin');
    await expect(page).toHaveURL(/#\/login$/);
  });

  test('criar vaga gera token que o validador confirma; editar, encerrar e excluir', async ({ page }) => {
    const cargo = `Analista E2E ${Date.now()}`;
    await entrar(page);
    await page.getByRole('button', { name: 'Nova vaga' }).click();
    await expect(page.getByRole('heading', { name: 'Nova vaga' })).toBeFocused();

    await page.fill('#vaga-cargo', cargo);
    await page.selectOption('#vaga-modalidade', 'PRESENCIAL');
    await page.selectOption('#vaga-uf', 'TO');
    await page.fill('#vaga-cidade', 'Palmas');
    await page.fill('#vaga-fonte', 'Cadastro de teste automatizado');
    await page.getByLabel('Educação financeira').check();
    await page.getByRole('button', { name: 'Criar vaga e gerar token' }).click();

    await expect(page.getByText(new RegExp(`Vaga "${cargo}" criada\\. Token gerado: BRD-BR-TO-`))).toBeVisible();
    const linha = page.getByRole('row', { name: new RegExp(cargo) });
    const token = (await linha.getByTestId('token-em-uso').textContent()).trim();
    expect(token).toMatch(/^BRD-BR-TO-[0-9A-Z]{16}$/);

    // O token criado pelo RH confirma no validador público
    await page.goto('/');
    await validar(page, token);
    await expect(page.locator(RESULTADO)).toContainText(cargo);
    await expect(page.locator(RESULTADO)).toContainText('não garante');

    // Editar (mesma região mantém o token)
    await page.goto('/#/admin');
    await page.getByRole('button', { name: `Editar ${cargo}` }).click();
    await page.fill('#vaga-cargo', `${cargo} Sênior`);
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByText(`Vaga "${cargo} Sênior" atualizada. Token em uso: ${token}`)).toBeVisible();

    // Encerrar: o token deixa de confirmar
    await page.getByRole('button', { name: `Encerrar ${cargo} Sênior` }).click();
    await expect(page.getByText(`Vaga "${cargo} Sênior" encerrada.`)).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(cargo) })).toContainText('Encerrada');

    // Excluir exige confirmação
    await page.getByRole('button', { name: `Excluir ${cargo} Sênior` }).click();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('row', { name: new RegExp(cargo) })).toBeVisible();
    await page.getByRole('button', { name: `Excluir ${cargo} Sênior` }).click();
    await page.getByRole('button', { name: 'Confirmar exclusão' }).click();
    await expect(page.getByText(`Vaga "${cargo} Sênior" excluída.`)).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(cargo) })).toHaveCount(0);

    await page.goto('/');
    await validar(page, token);
    await expect(page.getByText('Oferta não confirmada').first()).toBeVisible();
  });

  test('formulário exige campos e valida no servidor', async ({ page }) => {
    await entrar(page);
    await page.getByRole('button', { name: 'Nova vaga' }).click();
    await page.getByRole('button', { name: 'Criar vaga e gerar token' }).click();
    await expect(page.getByRole('alert')).toContainText('Preencha: cargo, UF, fonte');
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('heading', { name: 'Vagas cadastradas' })).toBeVisible();
  });

  test('lista de denúncias (somente leitura)', async ({ page, request }) => {
    const descricao = `Pediram pagamento antecipado ${Date.now()}`;
    const r = await request.post('http://localhost:8080/api/denuncias', {
      data: { urlSuspeita: 'http://golpe-e2e.example', descricao, aceiteAviso: true },
    });
    expect(r.status()).toBe(201);

    await entrar(page);
    await page.getByRole('tab', { name: 'Denúncias' }).click();
    await expect(page.getByRole('tabpanel')).toContainText(descricao);
    await expect(page.getByRole('tabpanel').getByRole('button', { name: /Excluir|Editar/ })).toHaveCount(0);

    // Abas pelo teclado
    await page.getByRole('tab', { name: 'Denúncias' }).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('tab', { name: 'Vagas' })).toBeFocused();
    await expect(page.getByRole('tab', { name: 'Vagas' })).toHaveAttribute('aria-selected', 'true');
  });

  test('API devolve 401 com JWT inválido e o site volta ao login', async ({ page }) => {
    await entrar(page);
    await expect(page.getByRole('heading', { name: 'Gestão de vagas — RH' })).toBeVisible();
    await page.evaluate(() => {
      const s = JSON.parse(sessionStorage.getItem('antigolpe:sessao-rh'));
      sessionStorage.setItem('antigolpe:sessao-rh', JSON.stringify({ ...s, token: 'a.b.c' }));
    });
    await page.reload();
    await expect(page).toHaveURL(/#\/login$/);
    await expect(page.getByText('Sua sessão expirou. Entre novamente.')).toBeVisible();
  });

  for (const tema of ['padrão', 'alto contraste']) {
    test(`axe sem violações na área do RH — tema ${tema}`, async ({ page }) => {
      await page.goto('/');
      if (tema === 'alto contraste') await ativarAltoContraste(page);
      await entrar(page);
      await expect(page.getByRole('heading', { name: 'Gestão de vagas — RH' })).toBeVisible();
      await page.getByTestId('token-em-uso').first().waitFor();
      await semViolacoes(page, `vagas / ${tema}`);
      await page.getByRole('button', { name: 'Nova vaga' }).click();
      await semViolacoes(page, `formulário / ${tema}`);
      await page.getByRole('button', { name: 'Cancelar' }).click();
      await page.getByRole('tab', { name: 'Denúncias' }).click();
      await semViolacoes(page, `denúncias / ${tema}`);
    });
  }
});
