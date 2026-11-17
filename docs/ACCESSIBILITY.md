# Acessibilidade — meta WCAG 2.2 AA

- Botão de alto contraste inspirado no wireframe: tokens semânticos de cores para modo padrão e alto contraste, não somente `filter: contrast(...)`.
- Contraste mínimo 4.5:1 texto comum, 3:1 texto grande e componentes gráficos relevantes; testar combinações reais.
- Navegação integral por teclado, foco visível, ordem lógica, skip link, landmarks, headings hierárquicos, labels reais.
- Formulários: label persistente, instruções, erros vinculados via `aria-describedby`, estado de carregamento e mensagens de resultado em live region adequada; foco após resultado quando necessário.
- Abas: se forem tabs, implementar roles/teclado corretamente; senão usar navegação comum.
- Modais: foco inicial, contenção, Escape, retorno de foco; não criar bloqueios.
- Accordions: `aria-expanded`, `aria-controls`, botões semânticos.
- Chat: mensagens anunciadas sem repetição excessiva, anexos com descrição textual, OCR corrigível, opção de não usar imagem.
- Preferência de movimento reduzido, zoom 200–400%, reflow móvel, targets de toque adequados.
- Persistir preferência de contraste localmente somente quando apropriado; evitar flashes de tema.
- Testar axe, Lighthouse, teclado manual e pelo menos um leitor de tela; testes automáticos não garantem conformidade.
