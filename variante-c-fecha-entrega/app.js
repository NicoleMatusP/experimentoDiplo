// ---------------------------------------------------------------------------
// Variante C — Solo Hipótesis 2 (fecha estimada de entrega en el carrito)
// ---------------------------------------------------------------------------
const VARIANT_ID = 'c';

// ---------------------------------------------------------------------------
// Datos de productos (precargados, sin backend) — iguales en todas las variantes
// ---------------------------------------------------------------------------
const PRODUCTS = [
  { id: 'p1', name: 'Auriculares inalámbricos', meta: 'Color negro', price: 45990, qty: 1, icon: 'headphones' },
  { id: 'p2', name: 'Mochila urbana 20L', meta: 'Talla única · Gris', price: 32500, qty: 1, icon: 'bag' },
  { id: 'p3', name: 'Botella térmica 750ml', meta: 'Acero inoxidable', price: 12990, qty: 2, icon: 'droplet' },
];

const SHIPPING_COST = 3990;

// ---------------------------------------------------------------------------
// Iconos SVG inline (sin dependencias externas)
// ---------------------------------------------------------------------------
const PRODUCT_ICONS = {
  headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>',
  droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>',
};

function productIconSvg(iconKey) {
  return `<svg class="icon icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${PRODUCT_ICONS[iconKey] || ''}</svg>`;
}

function formatCLP(value) {
  return '$' + value.toLocaleString('es-CL');
}

// ---------------------------------------------------------------------------
// Fecha estimada de entrega — calculada respecto a hoy, en días hábiles
// (se usa en la confirmación de todas las variantes; solo B/C/E la muestran
// también en el carrito, según la hipótesis que testean)
// ---------------------------------------------------------------------------
function addBusinessDays(startDate, days) {
  const date = new Date(startDate);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return date;
}

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatDayMonth(date) {
  return `${date.getDate()} de ${MONTHS_ES[date.getMonth()]}`;
}

function getDeliveryEstimateText() {
  const today = new Date();
  const from = addBusinessDays(today, 3);
  const to = addBusinessDays(today, 5);
  if (from.getMonth() === to.getMonth()) {
    return `Llega entre el ${from.getDate()} y el ${formatDayMonth(to)}`;
  }
  return `Llega entre el ${formatDayMonth(from)} y el ${formatDayMonth(to)}`;
}

// ---------------------------------------------------------------------------
// Cálculo de totales
// ---------------------------------------------------------------------------
function getSubtotal() {
  return PRODUCTS.reduce((sum, p) => sum + p.price * p.qty, 0);
}
function getTotal() {
  return getSubtotal() + SHIPPING_COST;
}

// ---------------------------------------------------------------------------
// Instrumentación (oculta para el usuario, visible solo en consola / panel debug)
// Cada variante usa su propia clave de localStorage para no pisar el log
// de las demás cuando se prueban en el mismo navegador.
// ---------------------------------------------------------------------------
const testLog = [];
let currentScreenName = null;
let currentScreenEnteredAt = null;

function logEvent(type, detail) {
  const entry = { ts: new Date().toISOString(), variant: VARIANT_ID, type, detail: detail || {} };
  testLog.push(entry);
  console.log('[ux-test][' + VARIANT_ID + ']', entry.type, entry.detail);
  try {
    localStorage.setItem('ux_test_log_' + VARIANT_ID, JSON.stringify(testLog));
  } catch (e) {}
  if (!document.getElementById('debugPanel').classList.contains('hidden')) {
    renderDebugPanel();
  }
}

function enterScreen(name) {
  if (currentScreenName) {
    const durationMs = Date.now() - currentScreenEnteredAt;
    logEvent('screen_time', { screen: currentScreenName, duration_ms: durationMs });
  }
  currentScreenName = name;
  currentScreenEnteredAt = Date.now();
  logEvent('screen_view', { screen: name });
}

// ---------------------------------------------------------------------------
// Navegación entre pantallas
// ---------------------------------------------------------------------------
function scrollScreenTop() {
  const page = document.querySelector('.screen:not(.hidden) .page');
  if (page) page.scrollTop = 0;
}

function showTopScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  scrollScreenTop();
}

function goToCart() {
  showTopScreen('screen-cart');
  enterScreen('cart');
}

function goToConfirmation() {
  showTopScreen('screen-confirmation');
  enterScreen('confirmation');
}

// ---------------------------------------------------------------------------
// Checkout por etapas
// ---------------------------------------------------------------------------
const CHECKOUT_STEPS = [
  { id: 'step-direccion', screenName: 'checkout_direccion' },
  { id: 'step-pago', screenName: 'checkout_pago' },
  { id: 'step-revision', screenName: 'checkout_revision' },
];

let currentCheckoutStep = 1;

function enterCheckout() {
  showTopScreen('screen-checkout');
  goToCheckoutStep(1);
}

function goToCheckoutStep(stepNumber) {
  currentCheckoutStep = stepNumber;
  document.querySelectorAll('.checkout-step').forEach(el => el.classList.add('hidden'));
  const step = CHECKOUT_STEPS[stepNumber - 1];
  document.getElementById(step.id).classList.remove('hidden');

  updateProgressBar(stepNumber);
  updateStepButtons(stepNumber);
  if (stepNumber === 3) fillReview();

  scrollScreenTop();
  enterScreen(step.screenName);
}

function updateProgressBar(stepNumber) {
  document.querySelectorAll('.progress-step').forEach(li => {
    const n = Number(li.dataset.step);
    li.classList.remove('is-active', 'is-done');
    if (n < stepNumber) li.classList.add('is-done');
    if (n === stepNumber) li.classList.add('is-active');
  });
}

function updateStepButtons(stepNumber) {
  document.getElementById('btnStepPrimary').textContent = stepNumber === 3 ? 'Confirmar compra' : 'Continuar';
  document.getElementById('btnStepBackLabel').textContent = stepNumber === 1 ? 'Volver al carrito' : 'Atrás';
}

function fillReview() {
  const fullName = document.getElementById('fullName').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const cardName = document.getElementById('cardName').value.trim();
  const cardNumber = document.getElementById('cardNumber').value.trim();

  document.getElementById('reviewName').textContent = fullName || '—';
  document.getElementById('reviewAddress').textContent = [address, city].filter(Boolean).join(', ') || '—';
  document.getElementById('reviewPhone').textContent = phone || '—';

  const last4 = cardNumber.replace(/\s/g, '').slice(-4);
  document.getElementById('reviewCard').textContent = cardNumber
    ? `${cardName || 'Tarjeta'} •••• ${last4.padStart(4, '•')}`
    : '—';

  const subtotal = getSubtotal();
  document.getElementById('subtotalValue2').textContent = formatCLP(subtotal);
  document.getElementById('shippingValue2').textContent = formatCLP(SHIPPING_COST);
  document.getElementById('totalValue2').textContent = formatCLP(subtotal + SHIPPING_COST);
}

// ---------------------------------------------------------------------------
// Render carrito
// ---------------------------------------------------------------------------
function renderProductList() {
  const list = document.getElementById('productList');
  list.innerHTML = '';
  PRODUCTS.forEach(p => {
    const li = document.createElement('li');
    li.className = 'product-item';
    li.innerHTML = `
      <div class="product-thumb">${productIconSvg(p.icon)}</div>
      <div class="product-info">
        <span class="product-name">${p.name}</span>
        <span class="product-meta">${p.meta}</span>
      </div>
      <div class="product-price-col">
        <span class="product-price">${formatCLP(p.price * p.qty)}</span>
        <div class="qty-control">
          <button data-action="dec" data-id="${p.id}">–</button>
          <span>${p.qty}</span>
          <button data-action="inc" data-id="${p.id}">+</button>
        </div>
      </div>
    `;
    list.appendChild(li);
  });

  list.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = PRODUCTS.find(p => p.id === btn.dataset.id);
      if (btn.dataset.action === 'inc') product.qty += 1;
      if (btn.dataset.action === 'dec') product.qty = Math.max(1, product.qty - 1);
      renderAll();
    });
  });
}

function renderSummary() {
  const subtotal = getSubtotal();
  document.getElementById('subtotalValue').textContent = formatCLP(subtotal);

  const itemCount = PRODUCTS.reduce((sum, p) => sum + p.qty, 0);
  document.getElementById('cartIndicator').textContent = `Carrito (${itemCount})`;
}

function renderDeliveryLine() {
  document.getElementById('deliveryLine').textContent = getDeliveryEstimateText();
}

function renderAll() {
  renderProductList();
  renderSummary();
  renderDeliveryLine();
}

// ---------------------------------------------------------------------------
// Navegación / eventos de botones
// ---------------------------------------------------------------------------
document.getElementById('btnGoCheckout').addEventListener('click', () => {
  logEvent('click', { button: 'continuar_al_pago', screen: 'cart' });
  enterCheckout();
});

document.getElementById('btnStepPrimary').addEventListener('click', () => {
  if (currentCheckoutStep < CHECKOUT_STEPS.length) {
    logEvent('click', { button: 'continuar', step: currentCheckoutStep });
    goToCheckoutStep(currentCheckoutStep + 1);
    return;
  }

  logEvent('click', { button: 'confirmar_compra', step: currentCheckoutStep });

  const orderNumber = 'N°' + Math.floor(100000 + Math.random() * 900000);
  document.getElementById('orderNumber').textContent = `Pedido ${orderNumber}`;
  document.getElementById('totalValue3').textContent = formatCLP(getTotal());
  document.getElementById('deliveryValue3').textContent = getDeliveryEstimateText().replace('Llega ', '');

  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  document.getElementById('addressValue3').textContent = [address, city].filter(Boolean).join(', ') || '—';

  const cardName = document.getElementById('cardName').value.trim();
  const cardNumber = document.getElementById('cardNumber').value.trim();
  const last4 = cardNumber.replace(/\s/g, '').slice(-4);
  document.getElementById('paymentValue3').textContent = cardNumber
    ? `${cardName || 'Tarjeta'} •••• ${last4.padStart(4, '•')}`
    : '—';

  document.getElementById('cartIndicator').textContent = 'Carrito (0)';

  goToConfirmation();
  logEvent('completed', { order: orderNumber });
});

document.getElementById('btnStepBack').addEventListener('click', () => {
  if (currentCheckoutStep === 1) {
    logEvent('click', { button: 'volver_al_carrito', step: 1 });
    goToCart();
    return;
  }
  logEvent('click', { button: 'atras', step: currentCheckoutStep });
  goToCheckoutStep(currentCheckoutStep - 1);
});

document.getElementById('btnRestart').addEventListener('click', () => {
  logEvent('click', { button: 'volver_al_inicio', screen: 'confirmation' });
  PRODUCTS.forEach(p => { p.qty = p.id === 'p3' ? 2 : 1; });
  ['fullName','address','city','zip','phone','cardName','cardNumber','cardExpiry','cardCvv'].forEach(id => {
    document.getElementById(id).value = '';
  });
  renderAll();
  goToCart();
});

// ---------------------------------------------------------------------------
// Panel de debug oculto — Alt+Shift+L
// ---------------------------------------------------------------------------
function renderDebugPanel() {
  const summary = {};
  testLog.filter(e => e.type === 'screen_time').forEach(e => {
    summary[e.detail.screen] = (summary[e.detail.screen] || 0) + e.detail.duration_ms;
  });
  const lines = [
    '--- variante: ' + VARIANT_ID + ' ---',
    '--- tiempo acumulado por pantalla (ms) ---',
    JSON.stringify(summary, null, 2),
    '',
    '--- eventos ---',
    JSON.stringify(testLog, null, 2),
  ];
  document.getElementById('debugContent').textContent = lines.join('\n');
}

document.addEventListener('keydown', (e) => {
  if (e.altKey && e.shiftKey && e.code === 'KeyL') {
    const panel = document.getElementById('debugPanel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) renderDebugPanel();
  }
});

document.getElementById('debugClose').addEventListener('click', () => {
  document.getElementById('debugPanel').classList.add('hidden');
});

document.getElementById('debugDownload').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(testLog, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ux-test-log-variante-${VARIANT_ID}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
renderAll();
enterScreen('cart');
