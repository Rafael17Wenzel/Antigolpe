// Mede o contraste (WCAG 2.x) entre pares de tokens de cor, nos dois temas.
// Uso: node scripts/contraste.mjs   (sai com código 1 se algum par não atingir o mínimo)
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

function lerTema(seletor) {
  const bloco = css.slice(css.indexOf(seletor)).split('}')[0];
  return Object.fromEntries(
    [...bloco.matchAll(/--cor-([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+);/g)].map((m) => [m[1], [+m[2], +m[3], +m[4]]]),
  );
}

const padrao = lerTema(':root {');
const temas = { padrao, 'alto-contraste': { ...padrao, ...lerTema(":root[data-tema='alto-contraste']") } };

const lum = ([r, g, b]) => {
  const c = [r, g, b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const razao = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

// [texto/elemento, fundo, mínimo, descrição]
const pares = [
  ['texto', 'fundo', 4.5, 'texto em fundo da página'],
  ['texto', 'superficie', 4.5, 'texto em cartão'],
  ['texto', 'superficie-2', 4.5, 'texto em painel'],
  ['texto-suave', 'superficie', 4.5, 'texto secundário em cartão'],
  ['texto-suave', 'superficie-2', 4.5, 'texto secundário em painel'],
  ['texto-suave', 'fundo', 4.5, 'texto secundário em fundo'],
  ['primaria', 'superficie', 4.5, 'link/destaque em cartão'],
  ['primaria', 'primaria-clara', 4.5, 'link em bloco de denúncia'],
  ['texto', 'primaria-clara', 4.5, 'texto em bloco de denúncia'],
  ['sobre-primaria', 'primaria', 4.5, 'texto de botão primário'],
  ['sobre-primaria', 'primaria-escura', 4.5, 'botão primário (hover)'],
  ['sucesso-texto', 'sucesso-fundo', 4.5, 'resultado confirmado'],
  ['alerta-texto', 'alerta-fundo', 4.5, 'resultado não confirmado'],
  ['perigo-texto', 'perigo-fundo', 4.5, 'mensagem de erro em caixa'],
  ['perigo-texto', 'superficie-2', 4.5, 'erro de campo no formulário'],
  ['info-texto', 'info-fundo', 3, 'ícone de categoria'],
  ['sobre-forte', 'sucesso-forte', 3, 'ícone em selo de sucesso'],
  ['sobre-escuro', 'escuro', 4.5, 'barra superior / rodapé'],
  ['sobre-escuro-suave', 'escuro', 4.5, 'texto secundário no rodapé'],
  ['sobre-heroi', 'heroi', 4.5, 'texto do destaque (início)'],
  ['sobre-heroi', 'heroi-fim', 4.5, 'texto do destaque (fim)'],
  ['sobre-heroi-suave', 'heroi', 4.5, 'texto secundário do destaque'],
  ['primaria', 'superficie', 4.5, 'botão "simular" (texto)'],
  ['borda-forte', 'superficie', 3, 'contorno de campo (1.4.11)'],
  ['borda-forte', 'superficie-2', 3, 'contorno de campo em painel (1.4.11)'],
  ['foco', 'superficie', 3, 'indicador de foco em cartão'],
  ['foco', 'fundo', 3, 'indicador de foco em fundo'],
  ['foco', 'escuro', 3, 'indicador de foco na barra escura'],
  ['sucesso-borda', 'superficie', 3, 'borda do resultado confirmado'],
  ['alerta-borda', 'superficie', 3, 'borda do resultado não confirmado'],
  ['chat-sobre-topo', 'chat-topo', 4.5, 'cabeçalho do chat'],
  ['texto', 'chat-enviada', 4.5, 'mensagem enviada no chat'],
  ['texto', 'chat-recebida', 4.5, 'mensagem recebida no chat'],
  ['texto-suave', 'chat-recebida', 4.5, 'hora/legenda na mensagem'],
  ['texto', 'chat-fundo', 4.5, 'texto sobre o fundo do chat'],
  ['primaria', 'chat-recebida', 4.5, 'link/ação em mensagem recebida'],
  ['alerta-texto', 'chat-recebida', 4.5, 'aviso de IA com problemas no chat'],
  ['superficie', 'perigo-texto', 4.5, 'botão Confirmar exclusão (área do RH)'],
];

let falhas = 0;
for (const [nome, cores] of Object.entries(temas)) {
  console.log(`\n## Tema: ${nome}\n`);
  console.log('| Par | Razão | Mínimo | Situação |');
  console.log('|---|---|---|---|');
  for (const [a, b, min, desc] of pares) {
    const r = razao(cores[a], cores[b]);
    const ok = r >= min;
    if (!ok) falhas++;
    console.log(`| ${desc} (\`${a}\` / \`${b}\`) | ${r.toFixed(2)}:1 | ${min}:1 | ${ok ? 'OK' : 'FALHA'} |`);
  }
}
console.log(`\nTotal de falhas: ${falhas}`);
process.exit(falhas ? 1 : 0);
