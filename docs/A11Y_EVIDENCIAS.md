# Evidências de acessibilidade (Sprint 04)

Meta: WCAG 2.2 AA. **Ferramentas automáticas não garantem conformidade**; os itens manuais
pendentes estão listados no fim.

Data: 2026-11-17 · Navegador: Chromium (Playwright 1.63) · Backend: perfil `h2`.

## 1. Testes automatizados (`frontend/e2e/acessibilidade.spec.js`)

Comando: `cd frontend && npm run test:e2e` → **19/19 OK**.

| Verificação | Resultado |
|---|---|
| axe-core 4.14 (tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa): página inicial, confirmado com cursos, não confirmado com denúncia, erro de entrada, modal aberto — **tema padrão** | 0 violações |
| Mesmos 5 cenários — **alto contraste** | 0 violações |
| Fluxo só com teclado: Tab → "Ir ao conteúdo" → Enter foca `main` → Tab chega ao campo → digita token → Enter → foco no título do resultado | OK |
| Erro de entrada: `role="alert"`, `aria-invalid="true"`, `aria-describedby` ligado à mensagem e foco devolvido ao campo | OK |
| Resultado dentro de região `aria-live="polite"` | OK |
| Alto contraste: `aria-pressed`, fundo preto real, **sem `filter`**, persistido e aplicado antes do React (lido no primeiro `DOMContentLoaded`) | OK |
| Modal: foco inicial no "Fechar", Tab/Shift+Tab presos no diálogo, Esc fecha e devolve o foco ao botão que abriu | OK |
| FAQ: botões com `aria-expanded`/`aria-controls`, abre com Enter | OK |
| Reflow em 320 px de largura (equivale a 400% de zoom em 1280 px): sem rolagem horizontal, com resultado e denúncia abertos | OK |
| `prefers-reduced-motion: reduce`: rolagem suave desativada | OK |
| Aviso "Protótipo acadêmico — não é canal oficial do Bradesco" visível | OK |

Primeira rodada: 10 falhas pela mesma causa, `label-content-name-mismatch` no link do logotipo
(`aria-label` diferente do texto visível). Corrigido: o nome passa a vir do texto visível + complemento oculto.

## 2. Lighthouse 12.8.2 (página inicial, tema padrão)

| Categoria | Nota |
|---|---|
| Acessibilidade | **100** |
| Boas práticas | **100** |

A primeira medição deu 96 em boas práticas por dois erros de console: fonte do Google bloqueada e
falta de favicon. Correções: fonte Inter servida pelo próprio site (`@fontsource/inter`, sem requisição
a terceiros) e `<link rel="icon">`.

## 3. Contraste medido (`frontend/scripts/contraste.mjs`)

Comando: `cd frontend && npm run contraste` → **0 falhas em 60 pares** (30 por tema).
Mínimos: 4.5:1 para texto; 3:1 para componentes e indicadores (1.4.11) e ícones.
O primeiro cálculo reprovou a borda do resultado confirmado (1.92:1); o tom foi escurecido.

### Tema padrão

| Par | Razão | Mínimo | Situação |
|---|---|---|---|
| texto em fundo da página (`texto` / `fundo`) | 13.46:1 | 4.5:1 | OK |
| texto em cartão (`texto` / `superficie`) | 14.68:1 | 4.5:1 | OK |
| texto em painel (`texto` / `superficie-2`) | 14.05:1 | 4.5:1 | OK |
| texto secundário em cartão (`texto-suave` / `superficie`) | 7.56:1 | 4.5:1 | OK |
| texto secundário em painel (`texto-suave` / `superficie-2`) | 7.23:1 | 4.5:1 | OK |
| texto secundário em fundo (`texto-suave` / `fundo`) | 6.93:1 | 4.5:1 | OK |
| link/destaque em cartão (`primaria` / `superficie`) | 5.89:1 | 4.5:1 | OK |
| link em bloco de denúncia (`primaria` / `primaria-clara`) | 5.17:1 | 4.5:1 | OK |
| texto em bloco de denúncia (`texto` / `primaria-clara`) | 12.90:1 | 4.5:1 | OK |
| texto de botão primário (`sobre-primaria` / `primaria`) | 5.89:1 | 4.5:1 | OK |
| botão primário (hover) (`sobre-primaria` / `primaria-escura`) | 8.92:1 | 4.5:1 | OK |
| resultado confirmado (`sucesso-texto` / `sucesso-fundo`) | 7.29:1 | 4.5:1 | OK |
| resultado não confirmado (`alerta-texto` / `alerta-fundo`) | 8.75:1 | 4.5:1 | OK |
| mensagem de erro em caixa (`perigo-texto` / `perigo-fundo`) | 7.60:1 | 4.5:1 | OK |
| erro de campo no formulário (`perigo-texto` / `superficie-2`) | 7.95:1 | 4.5:1 | OK |
| ícone de categoria (`info-texto` / `info-fundo`) | 5.49:1 | 3:1 | OK |
| ícone em selo de sucesso (`sobre-forte` / `sucesso-forte`) | 5.48:1 | 3:1 | OK |
| barra superior / rodapé (`sobre-escuro` / `escuro`) | 16.98:1 | 4.5:1 | OK |
| texto secundário no rodapé (`sobre-escuro-suave` / `escuro`) | 12.04:1 | 4.5:1 | OK |
| texto do destaque (início) (`sobre-heroi` / `heroi`) | 5.89:1 | 4.5:1 | OK |
| texto do destaque (fim) (`sobre-heroi` / `heroi-fim`) | 10.02:1 | 4.5:1 | OK |
| texto secundário do destaque (`sobre-heroi-suave` / `heroi`) | 4.82:1 | 4.5:1 | OK |
| botão "simular" (texto) (`primaria` / `superficie`) | 5.89:1 | 4.5:1 | OK |
| contorno de campo (1.4.11) (`borda-forte` / `superficie`) | 4.83:1 | 3:1 | OK |
| contorno de campo em painel (1.4.11) (`borda-forte` / `superficie-2`) | 4.63:1 | 3:1 | OK |
| indicador de foco em cartão (`foco` / `superficie`) | 5.17:1 | 3:1 | OK |
| indicador de foco em fundo (`foco` / `fundo`) | 4.74:1 | 3:1 | OK |
| indicador de foco na barra escura (`foco` / `escuro`) | 3.43:1 | 3:1 | OK |
| borda do resultado confirmado (`sucesso-borda` / `superficie`) | 3.77:1 | 3:1 | OK |
| borda do resultado não confirmado (`alerta-borda` / `superficie`) | 3.19:1 | 3:1 | OK |

### Tema alto contraste

| Par | Razão | Mínimo | Situação |
|---|---|---|---|
| texto em fundo da página (`texto` / `fundo`) | 21.00:1 | 4.5:1 | OK |
| texto em cartão (`texto` / `superficie`) | 21.00:1 | 4.5:1 | OK |
| texto em painel (`texto` / `superficie-2`) | 18.73:1 | 4.5:1 | OK |
| texto secundário em cartão (`texto-suave` / `superficie`) | 17.62:1 | 4.5:1 | OK |
| texto secundário em painel (`texto-suave` / `superficie-2`) | 15.71:1 | 4.5:1 | OK |
| texto secundário em fundo (`texto-suave` / `fundo`) | 17.62:1 | 4.5:1 | OK |
| link/destaque em cartão (`primaria` / `superficie`) | 16.57:1 | 4.5:1 | OK |
| link em bloco de denúncia (`primaria` / `primaria-clara`) | 14.78:1 | 4.5:1 | OK |
| texto em bloco de denúncia (`texto` / `primaria-clara`) | 18.73:1 | 4.5:1 | OK |
| texto de botão primário (`sobre-primaria` / `primaria`) | 16.57:1 | 4.5:1 | OK |
| botão primário (hover) (`sobre-primaria` / `primaria-escura`) | 18.10:1 | 4.5:1 | OK |
| resultado confirmado (`sucesso-texto` / `sucesso-fundo`) | 16.80:1 | 4.5:1 | OK |
| resultado não confirmado (`alerta-texto` / `alerta-fundo`) | 16.57:1 | 4.5:1 | OK |
| mensagem de erro em caixa (`perigo-texto` / `perigo-fundo`) | 10.79:1 | 4.5:1 | OK |
| erro de campo no formulário (`perigo-texto` / `superficie-2`) | 9.62:1 | 4.5:1 | OK |
| ícone de categoria (`info-texto` / `info-fundo`) | 9.91:1 | 3:1 | OK |
| ícone em selo de sucesso (`sobre-forte` / `sucesso-forte`) | 16.80:1 | 3:1 | OK |
| barra superior / rodapé (`sobre-escuro` / `escuro`) | 21.00:1 | 4.5:1 | OK |
| texto secundário no rodapé (`sobre-escuro-suave` / `escuro`) | 17.62:1 | 4.5:1 | OK |
| texto do destaque (início) (`sobre-heroi` / `heroi`) | 21.00:1 | 4.5:1 | OK |
| texto do destaque (fim) (`sobre-heroi` / `heroi-fim`) | 21.00:1 | 4.5:1 | OK |
| texto secundário do destaque (`sobre-heroi-suave` / `heroi`) | 17.62:1 | 4.5:1 | OK |
| botão "simular" (texto) (`primaria` / `superficie`) | 16.57:1 | 4.5:1 | OK |
| contorno de campo (1.4.11) (`borda-forte` / `superficie`) | 21.00:1 | 3:1 | OK |
| contorno de campo em painel (1.4.11) (`borda-forte` / `superficie-2`) | 18.73:1 | 3:1 | OK |
| indicador de foco em cartão (`foco` / `superficie`) | 12.68:1 | 3:1 | OK |
| indicador de foco em fundo (`foco` / `fundo`) | 12.68:1 | 3:1 | OK |
| indicador de foco na barra escura (`foco` / `escuro`) | 12.68:1 | 3:1 | OK |
| borda do resultado confirmado (`sucesso-borda` / `superficie`) | 16.80:1 | 3:1 | OK |
| borda do resultado não confirmado (`alerta-borda` / `superficie`) | 16.57:1 | 3:1 | OK |

Total de falhas: 0

## 4. Checklist manual

| Item | Situação |
|---|---|
| Navegação completa por teclado na página (Tab/Shift+Tab, Enter, Esc) | Verificado nos testes automatizados acima |
| Foco visível em todos os controles (contorno de 3 px, azul no padrão, ciano no alto contraste) | Verificado visualmente nas capturas |
| Áreas de toque ≥ 24×24 px (2.5.8): botões e links de ação com altura mínima de 32 a 44 px | Ajustado; axe sem violação de `target-size` |
| Hierarquia de títulos: h1 (destaque) → h2 (seções) → h3 (resultado, cursos, FAQ) | Revisado |
| Ícones decorativos com `aria-hidden`; links externos avisam "(abre em nova aba)" | Revisado |
| Toast: pausa sob o mouse ou com foco; o conteúdo também aparece na página | Implementado |
| **Leitor de tela (NVDA ou VoiceOver)** | **PENDENTE**: não há leitor de tela no ambiente de desenvolvimento do assistente. Sugestão de roteiro: validar token confirmado, não confirmado, enviar denúncia e abrir o modal, conferindo os anúncios |
| **Zoom de 200% pelo navegador (Ctrl +)** | **PENDENTE de verificação manual** (o reflow a 320 px cobre o caso de 400%) |
| **Teste em dispositivo móvel real** | **PENDENTE** |
