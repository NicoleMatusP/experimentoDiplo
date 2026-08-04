// ---------------------------------------------------------------------------
// Hub de inicio — solo navegación a variantes + acordeón de la ficha técnica
// ---------------------------------------------------------------------------
const btnToggle = document.getElementById('btnToggleFactsheet');
const factsheet = document.getElementById('factsheet');
const toggleLabel = document.getElementById('factsheetToggleLabel');

btnToggle.addEventListener('click', () => {
  const isHidden = factsheet.classList.contains('hidden');
  factsheet.classList.toggle('hidden', !isHidden);
  btnToggle.setAttribute('aria-expanded', String(isHidden));
  toggleLabel.textContent = isHidden ? 'Ocultar ficha del experimento' : 'Ver ficha del experimento';
});
