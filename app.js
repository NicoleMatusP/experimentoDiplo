// ---------------------------------------------------------------------------
// Hub de inicio — navegación a variantes + acordeones de contexto,
// metodología, métricas y diseño estadístico.
// ---------------------------------------------------------------------------
document.querySelectorAll('.accordion-toggle').forEach(btn => {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  const label = btn.querySelector('.accordion-toggle-label');
  const showText = btn.dataset.showText;
  const hideText = btn.dataset.hideText;

  btn.addEventListener('click', () => {
    const willShow = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !willShow);
    btn.setAttribute('aria-expanded', String(willShow));
    if (label && hideText) {
      label.textContent = willShow ? hideText : showText;
    }
  });
});
