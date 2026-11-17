import { defineConfig, devices } from '@playwright/test';

/**
 * Testes ponta a ponta contra a API real (sem mock).
 * Por padrão sobe o frontend (Vite) e o backend no perfil h2 (dados fictícios em memória).
 * Se os servidores já estiverem rodando, eles são reaproveitados.
 * Variáveis: E2E_BASE_URL, E2E_API_URL, E2E_BACKEND_CMD.
 * O backend sobe com limites de requisição altos: a suíte faz dezenas de consultas do
 * mesmo endereço. Se reaproveitar um backend já rodando, inicie-o com as mesmas variáveis.
 */
const MVNW = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';
const LIMITES_E2E = {
  LIMITE_VALIDACAO_POR_MINUTO: '10000',
  LIMITE_DENUNCIA_POR_HORA: '10000',
  LIMITE_SUGESTAO_POR_MINUTO: '10000',
};
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const API_URL = process.env.E2E_API_URL || 'http://localhost:8080';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: BASE_URL,
    locale: 'pt-BR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command:
        process.env.E2E_BACKEND_CMD ||
        `cd ../backend && ${MVNW} -q spring-boot:run -Dspring-boot.run.profiles=h2`,
      env: { ...process.env, ...LIMITES_E2E },
      url: `${API_URL}/actuator/health`,
      reuseExistingServer: true,
      timeout: 240_000,
    },
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      url: BASE_URL,
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
