/** @type {import('tailwindcss').Config} */

// Cores semânticas: valores definidos em src/index.css (tema padrão e alto contraste).
// Nunca usar hex diretamente nos componentes.
const v = (nome) => `rgb(var(--cor-${nome}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fundo: v('fundo'),
        superficie: { DEFAULT: v('superficie'), 2: v('superficie-2') },
        borda: { DEFAULT: v('borda'), forte: v('borda-forte') },
        texto: { DEFAULT: v('texto'), suave: v('texto-suave') },
        primaria: {
          DEFAULT: v('primaria'),
          escura: v('primaria-escura'),
          clara: v('primaria-clara'),
          sobre: v('sobre-primaria'),
        },
        sucesso: { fundo: v('sucesso-fundo'), borda: v('sucesso-borda'), texto: v('sucesso-texto'), forte: v('sucesso-forte') },
        alerta: { fundo: v('alerta-fundo'), borda: v('alerta-borda'), texto: v('alerta-texto') },
        perigo: { fundo: v('perigo-fundo'), borda: v('perigo-borda'), texto: v('perigo-texto') },
        info: { fundo: v('info-fundo'), texto: v('info-texto') },
        escuro: { DEFAULT: v('escuro'), sobre: v('sobre-escuro'), 'sobre-suave': v('sobre-escuro-suave') },
        heroi: { DEFAULT: v('heroi'), fim: v('heroi-fim'), sobre: v('sobre-heroi'), 'sobre-suave': v('sobre-heroi-suave') },
        'sobre-forte': v('sobre-forte'),
        chat: {
          topo: v('chat-topo'),
          'sobre-topo': v('chat-sobre-topo'),
          fundo: v('chat-fundo'),
          enviada: v('chat-enviada'),
          recebida: v('chat-recebida'),
        },
        foco: v('foco'),
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      minHeight: { alvo: '44px' },
    },
  },
  plugins: [],
};
