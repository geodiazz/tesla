// modely.js — Tesla Model Y Configurator
'use strict';
const MODEL_ID = 'modely';

const VARIANTS = [
  { id:'rwd', name:'Premium Propulsión Trasera', range:'466', accel:'5.9', speed:'201', price:119990000,
    img:'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Homepage-Model-Y-Desktop-Global.jpg' },
  { id:'awd', name:'Premium Tracción Total', range:'600', accel:'4.8', speed:'201', price:144990000,
    img:'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Homepage-Model-Y-Desktop-Global.jpg' },
];
const COLORS = [
  { id:'grey',   name:'Gris Stealth',     price:0,       hex:'#54575b' },
  { id:'black',  name:'Negro Sólido',     price:4000000, hex:'#1a1a1a' },
  { id:'white',  name:'Blanco Perla',     price:4000000, hex:'#f0f0f0', ring:'#bbb' },
  { id:'blue',   name:'Azul Profundo',    price:4000000, hex:'#1e3a5f' },
  { id:'red',    name:'Rojo Ultra',       price:8000000, hex:'#b71c1c' },
];
const WHEELS = [
  { id:'gemini',    name:'Rines Gemini de 19"',
    desc:'Llantas para todas las estaciones<br>Autonomía WLTP: 466 km',
    price:0, dark:true },
  { id:'induction', name:'Rines Induction de 20"',
    desc:'Llantas para todas las estaciones<br>Autonomía certificada (WLTP): 450 km',
    price:8000000, dark:false },
];
const INTERIORS = [
  { id:'black', name:'Negro Premium',   price:0,       bg:'#1a1a1a' },
  { id:'white', name:'Blanco Premium',  price:4000000, bg:'#e8ddd0' },
];
const AUTOPILOTS = [
  { id:'ap',  name:'Piloto Automático',                desc:'Incluido. Dirección, aceleración y frenado asistidos en autopistas.', price:0 },
  { id:'fsd', name:'Capacidad de Conducción Autónoma', desc:'Navegación autónoma, cambio de carril automático, estacionamiento automático, reconocimiento de semáforos y señales de stop.', price:32000000 },
];

const S = { v:0, c:0, w:0, i:0, a:0 };
let contactData = {};
let payMethod = 'card';

const carImg    = document.getElementById('car-img');
const priceEl   = document.getElementById('current-price');
const priceRows = document.getElementById('price-rows');
const toastsEl  = document.getElementById('toasts');
const resBanner = document.getElementById('res-banner');
const bannerTxt = document.getElementById('res-banner-text');
const modalEl   = document.getElementById('modal-overlay');

function toast(msg, type='') {
  const el = document.createElement('div');
  el.className = 'g-toast' + (type ? ' g-toast--'+type : '');
  el.textContent = msg; toastsEl.appendChild(el);
  setTimeout(()=>{ el.style.animation='gToastOut .3s ease forwards'; setTimeout(()=>el.remove(),300); }, 3000);
}

function getTotal() {
  return VARIANTS[S.v].price + COLORS[S.c].price + WHEELS[S.w].price +
         INTERIORS[S.i].price + AUTOPILOTS[S.a].price;
}

function buildVariants() {
  const g = document.getElementById('variant-grid');
  g.innerHTML = VARIANTS.map((v,i) => `
    <div class="variant-card${i===S.v?' selected':''}" data-vi="${i}" tabindex="0">
      <div class="variant-card__name">${v.name}</div>
      <div class="variant-card__range">${v.range} km&nbsp;·&nbsp;${v.accel}s 0-100</div>
      <div class="variant-card__price">${Store.formatPrice(v.price)}</div>
    </div>`).join('');
  g.querySelectorAll('.variant-card').forEach(c => {
    c.addEventListener('click', () => { S.v=+c.dataset.vi; update(); buildVariants(); });
    c.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); c.click(); } });
  });
}

function buildColors() {
  const sw = document.getElementById('color-swatches');
  sw.innerHTML = COLORS.map((c,i) => `
    <button class="swatch${i===S.c?' selected':''}" data-ci="${i}" title="${c.name}"
      style="background:${c.hex};${c.ring?'box-shadow:inset 0 0 0 1px '+c.ring+';':''}"
      aria-label="${c.name}"></button>`).join('');
  sw.querySelectorAll('.swatch').forEach(s =>
    s.addEventListener('click', () => { S.c=+s.dataset.ci; update(); buildColors(); }));
}

function buildWheels() {
  function rimSvg(dark) {
    const bg  = dark ? '#1e1e1e' : '#d0d0d0';
    const rim = dark ? '#333'    : '#bbb';
    const spk = dark ? '#4a4a4a' : '#999';
    const hub = dark ? '#111'    : '#aaa';
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="42" height="42" style="border-radius:50%;">
      <circle cx="50" cy="50" r="49" fill="${bg}" stroke="${rim}" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="38" fill="${rim}"/>
      <rect x="47" y="12" width="6" height="38" rx="3" fill="${spk}" transform="rotate(0,50,50)"/>
      <rect x="47" y="12" width="6" height="38" rx="3" fill="${spk}" transform="rotate(72,50,50)"/>
      <rect x="47" y="12" width="6" height="38" rx="3" fill="${spk}" transform="rotate(144,50,50)"/>
      <rect x="47" y="12" width="6" height="38" rx="3" fill="${spk}" transform="rotate(216,50,50)"/>
      <rect x="47" y="12" width="6" height="38" rx="3" fill="${spk}" transform="rotate(288,50,50)"/>
      <circle cx="50" cy="50" r="10" fill="${hub}" stroke="${rim}" stroke-width="1"/>
      <circle cx="50" cy="50" r="4"  fill="${rim}"/>
    </svg>`;
  }

  const g = document.getElementById('wheel-grid');
  const w = WHEELS[S.w];
  g.innerHTML = `
    <div class="wheel-display">
      <div class="wheel-display__price">${w.price > 0 ? Store.formatPrice(w.price) : 'Incluidos'}</div>
      <div class="wheel-display__name">${w.name}</div>
      <div class="wheel-swatches">
        ${WHEELS.map((wheel, i) => `
          <button class="wheel-swatch${i === S.w ? ' selected' : ''}" data-wi="${i}" aria-label="${wheel.name}">
            ${rimSvg(wheel.dark)}
          </button>
        `).join('')}
      </div>
      <div class="wheel-display__desc">${w.desc}</div>
    </div>
  `;
  g.querySelectorAll('.wheel-swatch').forEach(btn => 
    btn.addEventListener('click', () => { S.w = +btn.dataset.wi; update(); buildWheels(); })
  );
}

function buildInteriors() {
  const g = document.getElementById('interior-grid');
  g.innerHTML = INTERIORS.map((t,i) => `
    <div class="interior-opt${i===S.i?' selected':''}" data-ii="${i}" tabindex="0">
      <div class="interior-opt__swatch" style="background:${t.bg};"></div>
      <div class="interior-opt__label">${t.name}${t.price>0?'<br><small>+'+Store.formatPrice(t.price)+'</small>':'<br><small>Incluido</small>'}</div>
    </div>`).join('');
  g.querySelectorAll('.interior-opt').forEach(o =>
    o.addEventListener('click', () => { S.i=+o.dataset.ii; update(); buildInteriors(); }));
}

function buildAutopilot() {
  const g = document.getElementById('autopilot-grid');
  g.innerHTML = AUTOPILOTS.map((a,i) => `
    <div class="auto-opt${i===S.a?' selected':''}" data-ai="${i}" tabindex="0">
      <div class="auto-opt__body">
        <div class="auto-opt__name">${a.name}</div>
        <div class="auto-opt__desc">${a.desc}</div>
      </div>
      <div class="auto-opt__price">${a.price>0?'+'+Store.formatPrice(a.price):'Incluido'}</div>
    </div>`).join('');
  g.querySelectorAll('.auto-opt').forEach(o =>
    o.addEventListener('click', () => { S.a=+o.dataset.ai; update(); buildAutopilot(); }));
}

function update() {
  const v=VARIANTS[S.v], col=COLORS[S.c], wh=WHEELS[S.w], inn=INTERIORS[S.i], ap=AUTOPILOTS[S.a];
  const total = getTotal();

  document.getElementById('stat-range').textContent = v.range;
  document.getElementById('stat-accel').textContent = v.accel;
  document.getElementById('stat-speed').textContent = v.speed;

  if (carImg.src !== v.img) {
    carImg.style.opacity = '0';
    carImg.src = v.img;
    carImg.onload = () => { carImg.style.opacity = '1'; };
  }

  document.getElementById('color-label').textContent    = col.name + (col.price>0 ? ' · +'+Store.formatPrice(col.price) : ' · Incluida');
  document.getElementById('wheel-label').textContent    = wh.name  + (wh.price >0 ? ' · +'+Store.formatPrice(wh.price)  : ' · Incluidos');
  document.getElementById('interior-label').textContent = inn.name + (inn.price>0 ? ' · +'+Store.formatPrice(inn.price) : ' · Incluido');

  priceEl.textContent = Store.formatPrice(total);

  let rows = `<div class="price-row"><span>${v.name}</span><span>${Store.formatPrice(v.price)}</span></div>`;
  if (col.price>0) rows += `<div class="price-row"><span>Pintura ${col.name}</span><span>+${Store.formatPrice(col.price)}</span></div>`;
  if (wh.price >0) rows += `<div class="price-row"><span>${wh.name}</span><span>+${Store.formatPrice(wh.price)}</span></div>`;
  if (inn.price>0) rows += `<div class="price-row"><span>Interior ${inn.name}</span><span>+${Store.formatPrice(inn.price)}</span></div>`;
  if (ap.price >0) rows += `<div class="price-row"><span>Conducción Autónoma</span><span>+${Store.formatPrice(ap.price)}</span></div>`;
  rows += `<div class="price-row price-row--total"><span>Total estimado</span><span>${Store.formatPrice(total)}</span></div>`;
  priceRows.innerHTML = rows;
}

function checkExistingReservation() {
  const user = Store.getCurrentUser(); if (!user) return;
  const res  = Store.getUserReservation(user.email);
  if (res && res.modelId !== MODEL_ID) {
    resBanner.classList.add('visible');
    bannerTxt.textContent = `Ya tienes una reserva: ${res.modelId==='model3'?'Model 3':'Model Y'} — ${res.variantName}`;
  }
}

function initDrawer() {
  const btn   = document.getElementById('user-btn');
  const drw   = document.getElementById('user-drawer');
  const bk    = document.getElementById('drawer-backdrop');
  const ct    = document.getElementById('drawer-content');
  const close = () => { drw.classList.remove('open'); drw.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };

  function render() {
    const user = Store.getCurrentUser();
    if (!user) {
      ct.innerHTML = `
        <h2 style="font-size:20px;font-weight:600;margin-bottom:6px;">Iniciar sesión</h2>
        <p style="font-size:13px;color:#636363;margin-bottom:20px;">Accede para gestionar tu reserva Tesla.</p>
        <form id="ml" style="display:flex;flex-direction:column;gap:14px;" novalidate>
          <div class="g-field"><label for="ml-n">Nombre</label><input id="ml-n" placeholder="Juan Pérez" required/></div>
          <div class="g-field"><label for="ml-e">Correo</label><input type="email" id="ml-e" placeholder="juan@email.com" required/></div>
          <p class="form__error" id="ml-err"></p>
          <button type="submit" class="btn btn--primary btn--full">Continuar</button>
        </form>`;
      document.getElementById('ml').addEventListener('submit', ev => {
        ev.preventDefault();
        const n=document.getElementById('ml-n').value.trim(), em=document.getElementById('ml-e').value.trim().toLowerCase();
        if (!n || !em.includes('@')) { document.getElementById('ml-err').textContent='Datos inválidos.'; return; }
        Store.setCurrentUser({name:n,email:em}); toast(`¡Bienvenido, ${n.split(' ')[0]}!`,'success'); render();
      });
    } else {
      const res = Store.getUserReservation(user.email);
      ct.innerHTML = `
        <div style="width:44px;height:44px;border-radius:50%;background:#171a20;color:#fff;font-size:18px;font-weight:600;display:flex;align-items:center;justify-content:center;margin-bottom:10px;">${user.name[0].toUpperCase()}</div>
        <p style="font-size:16px;font-weight:600;">${user.name}</p>
        <p style="font-size:13px;color:#636363;margin-bottom:16px;">${user.email}</p>
        ${res ? `<div style="background:#f7f7f7;border-radius:8px;padding:12px;border-left:3px solid #3e6ae1;margin-bottom:14px;">
          <p style="font-size:14px;font-weight:600;">Tesla ${res.modelId==='model3'?'Model 3':'Model Y'}</p>
          <p style="font-size:13px;color:#555;margin-top:3px;">${res.variantName}</p>
          <p style="font-size:14px;font-weight:700;margin-top:6px;">${Store.formatPrice(res.totalPrice)}</p></div>
          <a href="../confirmacion/confirmacion.html" class="btn btn--primary btn--full" style="margin-bottom:10px;text-align:center;">Administrar reserva</a>`
        : `<p style="color:#aaa;font-size:13px;margin-bottom:14px;">Sin reservas activas.</p>`}
        <button class="btn btn--outline btn--full" id="ml-out">Cerrar sesión</button>`;
      document.getElementById('ml-out').addEventListener('click', () => { Store.logout(); toast('Sesión cerrada.'); render(); });
    }
  }

  btn.addEventListener('click', () => { drw.classList.add('open'); drw.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; render(); });
  bk.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key==='Escape') close(); });
}

document.querySelectorAll('.pay-method').forEach(btn => {
  btn.addEventListener('click', () => {
    payMethod = btn.dataset.method;
    document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('card-fields').hidden   = payMethod !== 'card';
    document.getElementById('pse-fields').hidden    = payMethod !== 'pse';
    document.getElementById('efecty-fields').hidden = payMethod !== 'efecty';
  });
});

document.getElementById('reserve-btn').addEventListener('click', () => {
  const user = Store.getCurrentUser();
  const res  = user ? Store.getUserReservation(user.email) : null;
  if (res) { toast('Ya tienes una reserva activa.','error'); return; }
  if (user) { document.getElementById('res-name').value=user.name; document.getElementById('res-email').value=user.email; }
  const v = VARIANTS[S.v];
  document.getElementById('order-summary').innerHTML =
    `<strong>Model Y — ${v.name}</strong><br>${COLORS[S.c].name} · ${WHEELS[S.w].name}<br><strong style="font-size:15px;">${Store.formatPrice(getTotal())}</strong>`;
  showStep(1); modalEl.classList.add('open');
});

document.getElementById('modal-close').addEventListener('click', closeModal);
modalEl.addEventListener('click', e => { if (e.target===modalEl) closeModal(); });

function closeModal() { modalEl.classList.remove('open'); }
function showStep(n) { document.getElementById('step-1').hidden=n!==1; document.getElementById('step-2').hidden=n!==2; }

document.getElementById('form-contact').addEventListener('submit', e => {
  e.preventDefault();
  const err=document.getElementById('contact-error');
  const name=document.getElementById('res-name').value.trim();
  const email=document.getElementById('res-email').value.trim().toLowerCase();
  const phone=document.getElementById('res-phone').value.trim();
  const city=document.getElementById('res-city').value;
  err.textContent='';
  if (!name)               { err.textContent='Ingresa tu nombre.'; return; }
  if (!email.includes('@')){ err.textContent='Correo inválido.'; return; }
  if (phone.replace(/\D/g,'').length<7) { err.textContent='Teléfono inválido.'; return; }
  if (!city)               { err.textContent='Selecciona tu ciudad.'; return; }
  contactData = { name, email, phone, city };
  if (!Store.getCurrentUser()) Store.setCurrentUser({ name, email });
  showStep(2);
});

document.getElementById('card-num').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
});
document.getElementById('card-exp').addEventListener('input', e => {
  let v=e.target.value.replace(/\D/g,'').slice(0,4);
  if (v.length>2) v=v.slice(0,2)+'/'+v.slice(2);
  e.target.value=v;
});
document.getElementById('back-btn').addEventListener('click', () => showStep(1));

document.getElementById('form-payment').addEventListener('submit', async e => {
  e.preventDefault();
  const err=document.getElementById('payment-error'); err.textContent='';
  if (payMethod==='card') {
    if (document.getElementById('card-num').value.replace(/\s/g,'').length<16) { err.textContent='Número inválido.'; return; }
    if (document.getElementById('card-exp').value.length<5) { err.textContent='Fecha inválida.'; return; }
    if (document.getElementById('card-cvc').value.length<3) { err.textContent='CVC inválido.'; return; }
    if (!document.getElementById('card-name').value.trim()) { err.textContent='Ingresa el nombre.'; return; }
  } else if (payMethod==='pse') {
    if (!document.getElementById('pse-bank').value) { err.textContent='Selecciona tu banco.'; return; }
    if (!document.getElementById('pse-doc').value.trim()) { err.textContent='Ingresa tu cédula.'; return; }
  }
  const btn=document.getElementById('pay-btn');
  btn.textContent='Procesando…'; btn.disabled=true;
  await new Promise(r=>setTimeout(r,1800));
  const v=VARIANTS[S.v];
  Store.saveReservation(contactData.email, {
    modelId:MODEL_ID, variantName:v.name, colorName:COLORS[S.c].name,
    colorHex:COLORS[S.c].hex, wheelName:WHEELS[S.w].name,
    interiorName:INTERIORS[S.i].name, autopilot:AUTOPILOTS[S.a].name,
    totalPrice:getTotal(), city:contactData.city, phone:contactData.phone,
    customerName:contactData.name, payMethod,
    stats:{range:v.range, speed:v.speed, accel:v.accel},
  });
  Store.setCurrentUser({name:contactData.name, email:contactData.email});
  closeModal();
  window.location.href='../confirmacion/confirmacion.html';
});

function build() {
  buildVariants(); buildColors(); buildWheels(); buildInteriors(); buildAutopilot();
  update(); checkExistingReservation(); initDrawer();
}
build();
