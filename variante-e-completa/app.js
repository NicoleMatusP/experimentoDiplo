// ---------------------------------------------------------------------------
// Datos de productos (precargados, sin backend)
// ---------------------------------------------------------------------------
const PRODUCTS = [
  { id: 'p1', name: 'Auriculares inalámbricos', meta: 'Color negro', price: 45990, qty: 1, icon: 'headphones' },
  { id: 'p2', name: 'Mochila urbana 20L', meta: 'Talla única · Gris', price: 32500, qty: 1, icon: 'bag' },
  { id: 'p3', name: 'Botella térmica 750ml', meta: 'Acero inoxidable', price: 12990, qty: 2, icon: 'droplet' },
];

const SHIPPING_COST = 3990;

const PICKUP_POINTS = [
  { id: 'pp1', name: 'Punto Providencia', address: 'Av. Providencia 1234, Providencia', hours: 'Lun a sáb, 10:00–20:00' },
  { id: 'pp2', name: 'Punto Las Condes', address: 'Av. Apoquindo 4501, Las Condes', hours: 'Lun a sáb, 10:00–20:00' },
  { id: 'pp3', name: 'Punto Santiago Centro', address: 'Agustinas 1035, Santiago', hours: 'Lun a vie, 09:00–19:00' },
];

let deliveryMethod = 'envio';
let selectedPickupPointId = PICKUP_POINTS[0].id;

const PAYMENT_LABELS = {
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
};
let paymentMethod = 'tarjeta';

const SAVED_CARD = { brand: 'Visa', last4: '4242', holder: 'Nicole Matus', expiry: '08/29' };
let useSavedCard = true;

function getCardDisplayText() {
  if (useSavedCard) {
    return `${SAVED_CARD.brand} •••• ${SAVED_CARD.last4}`;
  }
  const cardName = document.getElementById('cardName').value.trim();
  const cardNumber = document.getElementById('cardNumber').value.trim();
  const last4 = cardNumber.replace(/\s/g, '').slice(-4);
  return cardNumber ? `${cardName || 'Tarjeta'} •••• ${last4.padStart(4, '•')}` : '—';
}

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

function getPickupEstimateText() {
  const today = new Date();
  const ready = addBusinessDays(today, 2);
  return `Disponible desde el ${formatDayMonth(ready)}`;
}

// ---------------------------------------------------------------------------
// Cálculo de totales
// ---------------------------------------------------------------------------
function getSubtotal() {
  return PRODUCTS.reduce((sum, p) => sum + p.price * p.qty, 0);
}
function getShippingCost() {
  return deliveryMethod === 'retiro' ? 0 : SHIPPING_COST;
}
function formatShipping(value) {
  return value === 0 ? 'Gratis' : formatCLP(value);
}
function getTotal() {
  return getSubtotal() + getShippingCost();
}

// ---------------------------------------------------------------------------
// Instrumentación (oculta para el usuario, visible solo en consola / panel debug)
// ---------------------------------------------------------------------------
const testLog = [];
let currentScreenName = null;
let currentScreenEnteredAt = null;

function logEvent(type, detail) {
  const entry = { ts: new Date().toISOString(), type, detail: detail || {} };
  testLog.push(entry);
  console.log('[ux-test]', entry.type, entry.detail);
  try {
    localStorage.setItem('ux_test_log', JSON.stringify(testLog));
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
function showTopScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo(0, 0);
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
  { id: 'step-entrega', screenName: 'checkout_entrega' },
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

  window.scrollTo(0, 0);
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
  const phone = document.getElementById('phone').value.trim();

  document.getElementById('reviewName').textContent = fullName || '—';
  document.getElementById('reviewPhone').textContent = phone || '—';

  if (deliveryMethod === 'retiro') {
    const point = PICKUP_POINTS.find(p => p.id === selectedPickupPointId);
    document.getElementById('reviewDeliveryHeading').textContent = 'Retiro en punto de despacho';
    document.getElementById('reviewAddressLabel').textContent = 'Punto de retiro';
    document.getElementById('reviewAddress').textContent = point ? `${point.name} — ${point.address}` : '—';
  } else {
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    document.getElementById('reviewDeliveryHeading').textContent = 'Dirección de envío';
    document.getElementById('reviewAddressLabel').textContent = 'Dirección';
    document.getElementById('reviewAddress').textContent = [address, city].filter(Boolean).join(', ') || '—';
  }

  if (paymentMethod === 'tarjeta') {
    document.getElementById('reviewCardLabel').textContent = 'Tarjeta';
    document.getElementById('reviewCard').textContent = getCardDisplayText();
  } else {
    document.getElementById('reviewCardLabel').textContent = 'Medio de pago';
    document.getElementById('reviewCard').textContent = PAYMENT_LABELS[paymentMethod];
  }
}

// ---------------------------------------------------------------------------
// Forma de entrega: envío a domicilio vs. retiro en punto de despacho
// ---------------------------------------------------------------------------
function renderPickupList() {
  const container = document.getElementById('pickupList');
  container.innerHTML = PICKUP_POINTS.map(pt => `
    <label class="option-card" data-pickup-id="${pt.id}">
      <input type="radio" name="pickupPoint" value="${pt.id}" ${pt.id === selectedPickupPointId ? 'checked' : ''}>
      <span class="option-radio-dot"></span>
      <span class="option-body">
        <span class="option-title">${pt.name}</span>
        <span class="option-meta">${pt.address} · ${pt.hours}</span>
      </span>
    </label>
  `).join('');

  container.querySelectorAll('input[name="pickupPoint"]').forEach(input => {
    input.addEventListener('change', () => {
      selectedPickupPointId = input.value;
      updateOptionCardSelection();
    });
  });
}

function updateOptionCardSelection() {
  document.querySelectorAll('.option-card').forEach(card => {
    const input = card.querySelector('input[type="radio"]');
    if (!input) return;
    card.classList.toggle('is-selected', input.checked);
  });
}

function renderDeliveryMethodMeta() {
  document.getElementById('metaEnvio').textContent = getDeliveryEstimateText();
  document.getElementById('priceEnvio').textContent = formatCLP(SHIPPING_COST);
  document.getElementById('metaRetiro').textContent = getPickupEstimateText();
}

function toggleDeliveryDetailBlocks() {
  document.getElementById('envioAddressBlock').classList.toggle('hidden', deliveryMethod !== 'envio');
  document.getElementById('retiroPointBlock').classList.toggle('hidden', deliveryMethod !== 'retiro');
}

document.querySelectorAll('input[name="deliveryMethod"]').forEach(input => {
  input.addEventListener('change', () => {
    deliveryMethod = input.value;
    logEvent('click', { button: 'forma_de_entrega', value: deliveryMethod });
    updateOptionCardSelection();
    toggleDeliveryDetailBlocks();
    renderSummary();
  });
});

// ---------------------------------------------------------------------------
// Medio de pago: tarjeta preseleccionada por defecto, modificable
// ---------------------------------------------------------------------------
function togglePaymentDetailBlocks() {
  document.getElementById('cardFieldsBlock').classList.toggle('hidden', paymentMethod !== 'tarjeta');
}

document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
  input.addEventListener('change', () => {
    paymentMethod = input.value;
    logEvent('click', { button: 'medio_de_pago', value: paymentMethod });
    updateOptionCardSelection();
    togglePaymentDetailBlocks();
  });
});

function toggleCardViews() {
  document.getElementById('savedCardView').classList.toggle('hidden', !useSavedCard);
  document.getElementById('cardFormView').classList.toggle('hidden', useSavedCard);
}

document.getElementById('btnChangeCard').addEventListener('click', () => {
  useSavedCard = false;
  logEvent('click', { button: 'usar_otra_tarjeta' });
  toggleCardViews();
});

document.getElementById('btnUseSavedCard').addEventListener('click', () => {
  useSavedCard = true;
  logEvent('click', { button: 'usar_tarjeta_guardada' });
  toggleCardViews();
});

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

  // El carrito siempre muestra la estimación base de envío a domicilio
  // (la forma de entrega recién se elige dentro del checkout).
  document.getElementById('subtotalValue').textContent = formatCLP(subtotal);
  document.getElementById('shippingValue').textContent = formatShipping(SHIPPING_COST);
  document.getElementById('totalValue').textContent = formatCLP(subtotal + SHIPPING_COST);

  const checkoutShipping = getShippingCost();
  document.getElementById('subtotalValue2').textContent = formatCLP(subtotal);
  document.getElementById('shippingValue2').textContent = formatShipping(checkoutShipping);
  document.getElementById('totalValue2').textContent = formatCLP(subtotal + checkoutShipping);

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

  if (deliveryMethod === 'retiro') {
    const point = PICKUP_POINTS.find(p => p.id === selectedPickupPointId);
    document.getElementById('deliveryValue3').textContent = getPickupEstimateText().replace('Disponible ', '');
    document.getElementById('addressLabel3').textContent = 'Punto de retiro';
    document.getElementById('addressValue3').textContent = point ? `${point.name} — ${point.address}` : '—';
  } else {
    document.getElementById('deliveryValue3').textContent = getDeliveryEstimateText().replace('Llega ', '');
    document.getElementById('addressLabel3').textContent = 'Dirección';
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    document.getElementById('addressValue3').textContent = [address, city].filter(Boolean).join(', ') || '—';
  }

  document.getElementById('paymentValue3').textContent = paymentMethod === 'tarjeta'
    ? getCardDisplayText()
    : PAYMENT_LABELS[paymentMethod];

  document.getElementById('cartIndicator').textContent = 'Carrito (0)';

  goToConfirmation();
  logEvent('completed', { order: orderNumber, delivery_method: deliveryMethod, payment_method: paymentMethod });
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

  deliveryMethod = 'envio';
  selectedPickupPointId = PICKUP_POINTS[0].id;
  document.getElementById('methodEnvio').checked = true;
  document.getElementById('methodRetiro').checked = false;
  toggleDeliveryDetailBlocks();
  renderPickupList();

  paymentMethod = 'tarjeta';
  document.getElementById('methodTarjeta').checked = true;
  document.getElementById('methodEfectivo').checked = false;
  togglePaymentDetailBlocks();

  useSavedCard = true;
  toggleCardViews();

  updateOptionCardSelection();
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
  a.download = `ux-test-log-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
renderAll();
renderPickupList();
renderDeliveryMethodMeta();
updateOptionCardSelection();
enterScreen('cart');
