// Aplica a preferência de contraste antes do primeiro desenho (evita piscar o tema errado).
// Arquivo separado (não inline) para permitir CSP sem 'unsafe-inline'.
(function () {
  var tema = null;
  try { tema = window.localStorage.getItem('antigolpe:tema'); } catch (e) { /* armazenamento indisponível */ }
  if (!tema && window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches) {
    tema = 'alto-contraste';
  }
  if (tema === 'alto-contraste') {
    document.documentElement.setAttribute('data-tema', 'alto-contraste');
  }
})();
