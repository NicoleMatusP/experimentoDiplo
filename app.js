// ---------------------------------------------------------------------------
// Hub de inicio — navegación a variantes, acordeones de contenido y menú
// de secciones (con auto-expansión y resaltado de la sección activa).
// ---------------------------------------------------------------------------

// Acordeones: contexto, metodología, métricas, diseño estadístico.
const accordionToggles = Array.from(document.querySelectorAll('.accordion-toggle'));

function expandAccordion(toggle) {
  const panel = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!panel) return;
  panel.classList.remove('hidden');
  toggle.setAttribute('aria-expanded', 'true');
}

accordionToggles.forEach(btn => {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  btn.addEventListener('click', () => {
    const willShow = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !willShow);
    btn.setAttribute('aria-expanded', String(willShow));
  });
});

// Menú de secciones: al saltar a una sección colapsada, se abre sola.
const sectionNavLinks = Array.from(document.querySelectorAll('.section-nav-link'));

sectionNavLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;
    e.preventDefault();

    const toggle = target.matches('.accordion-toggle')
      ? target
      : target.querySelector(':scope > .accordion-toggle');
    if (toggle) expandAccordion(toggle);

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + targetId);
  });
});

// Resalta en el menú la sección que está en pantalla.
if (sectionNavLinks.length) {
  const sections = sectionNavLinks
    .map(link => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  const setActive = (id) => {
    sectionNavLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}
