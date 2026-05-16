// confirmacion.js — Tesla Colombia · Confirmation Page
const toastsEl = document.getElementById('toasts');

function toast(msg, type='') {
  const el = document.createElement('div');
  el.className = 'g-toast' + (type ? ' g-toast--'+type : '');
  el.textContent = msg; toastsEl.appendChild(el);
  setTimeout(() => { el.style.animation='gToastOut .3s ease forwards'; setTimeout(()=>el.remove(),300); }, 3000);
}

function init() {
  const user = Store.getCurrentUser();
  const res  = user ? Store.getUserReservation(user.email) : null;

  if (!res) {
    document.getElementById('no-reservation').hidden = false;
    document.getElementById('reservation-details').hidden = true;
    return;
  }

  document.getElementById('no-reservation').hidden = true;
  document.getElementById('reservation-details').hidden = false;

  const isM3 = res.modelId === 'model3';
  const modelName = isM3 ? 'Model 3' : 'Model Y';

  document.getElementById('model-badge').textContent = modelName;
  document.getElementById('res-id').textContent = res.id;
  document.getElementById('conf-subtitle').textContent = `Tu Tesla ${modelName} está reservado. Te contactaremos pronto.`;

  document.getElementById('conf-car-img').src = isM3
    ? 'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Homepage-Model-3-Desktop-LHD.jpg'
    : 'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Homepage-Model-Y-Desktop-Global.jpg';

  // Performance stats
  const stats = res.stats || {};
  if (stats.range) {
    document.getElementById('conf-stats').innerHTML = `
      <div class="conf-stat"><div class="conf-stat__val">${stats.range} km</div><div class="conf-stat__lbl">Autonomía</div></div>
      <div class="conf-stat"><div class="conf-stat__val">${stats.speed||'—'}</div><div class="conf-stat__lbl">Vel. Máx.</div></div>
      <div class="conf-stat"><div class="conf-stat__val">${stats.accel||'—'}</div><div class="conf-stat__lbl">0-100 km/h</div></div>
    `;
  }

  // Configuration specs
  document.getElementById('conf-spec-list').innerHTML = [
    ['Versión',   res.variantName],
    ['Color',     res.colorName],
    ['Rines',     res.wheelName],
    ['Interior',  res.interiorName],
    ['Autopilot', res.autopilot],
    ['Método de pago', res.payMethod === 'card' ? 'Tarjeta' : res.payMethod === 'pse' ? 'PSE' : 'Efecty'],
  ].map(([l,v]) => `<div class="conf-spec-item"><span>${l}</span><span>${v||'—'}</span></div>`).join('');

  // Buyer info
  document.getElementById('conf-user-list').innerHTML = [
    ['Nombre',   res.customerName],
    ['Correo',   user.email],
    ['Teléfono', res.phone],
    ['Ciudad',   res.city],
  ].map(([l,v]) => `<div class="conf-spec-item"><span>${l}</span><span>${v||'—'}</span></div>`).join('');

  // Prices
  document.getElementById('conf-total').textContent     = Store.formatPrice(res.totalPrice);
  document.getElementById('conf-remaining').textContent = Store.formatPrice(res.totalPrice - 1000000);
  document.getElementById('conf-date').textContent      = Store.formatDate(res.fecha);
  document.getElementById('conf-city').textContent      = res.city || '—';

  document.getElementById('conf-price-breakdown').innerHTML = `
    <div class="conf-price-row"><span>Precio del vehículo</span><span>${Store.formatPrice(res.totalPrice)}</span></div>
  `;
}

// Cancel flow
document.getElementById('cancel-btn').addEventListener('click', () => {
  document.getElementById('cancel-overlay').classList.add('open');
});
document.getElementById('cancel-no').addEventListener('click', () => {
  document.getElementById('cancel-overlay').classList.remove('open');
});
document.getElementById('cancel-yes').addEventListener('click', () => {
  const user = Store.getCurrentUser();
  if (user) Store.deleteReservation(user.email);
  document.getElementById('cancel-overlay').classList.remove('open');
  toast('Reserva cancelada. El reembolso se procesará en 5-10 días hábiles.', 'success');
  setTimeout(() => { window.location.href = '../../index.html'; }, 2500);
});
document.getElementById('cancel-overlay').addEventListener('click', function(e) {
  if (e.target === this) this.classList.remove('open');
});

init();
