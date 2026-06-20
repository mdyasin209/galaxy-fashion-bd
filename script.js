/* =========================================================
   GALAXY FASHION BD - JAVASCRIPT
   Product prices, product codes, delivery price and slider settings
   are easy to update from this file.
========================================================= */

/* ================= PRODUCT DATA / PRICE SETTINGS START =================
   MAIN COMBO PRICE: 1199
   RELATED PRODUCT PRICE: 590 each
   Hidden product codes submit to Netlify Forms with order data.
======================================================================= */
let products = [];
let heroSlides = [];
let showcase = {};
let cart = { combo: 1 };
let delivery = 0;
let slide = 0;
let sliderTimer = null;
let lbGallery = [];
let lbIndex = 0;

const taka = n => '৳ ' + Number(n).toLocaleString('en-US') + '.00';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

async function loadSiteData() {
  try {
    const res = await fetch('/.netlify/functions/products');
    const data = await res.json();

    products = data.products || [];
    heroSlides = data.heroSlides || [];
    showcase = data.showcase || {};

    renderHeroSlider();
    renderShowcase();
    initSlider();
    renderAll();
  } catch (error) {
    console.error('Airtable data load error:', error);
  }
}

function renderHeroSlider() {
  const track = $('.hero-track');
  if (!track) return;

  track.innerHTML = heroSlides.map((item, index) => `
    <article class="hero-slide ${index === 0 ? 'active' : ''}">
      <picture>
        <source media="(max-width: 767px)" srcset="${item.mobileImage || item.desktopImage}" />
        <img src="${item.desktopImage}" alt="${item.name}">
      </picture>
    </article>
  `).join('');
}

function renderShowcase() {
  const cards = $$('.showcase-card');
  if (!cards.length) return;

  const items = [showcase.one, showcase.two];

  cards.forEach((card, index) => {
    const item = items[index];
    if (!item) return;

    const img = card.querySelector('img');
    const tag = card.querySelector('span');
    const title = card.querySelector('h3');
    const desc = card.querySelector('p');

    if (img) img.src = item.image || img.src;
    if (tag) tag.textContent = item.tag || '';
    if (title) title.textContent = item.title || '';
    if (desc) desc.textContent = item.desc || '';
  });
}

function initSlider() {
  const slides = $$('.hero-slide');
  const dots = $('.slider-dots');

  if (!slides.length || !dots) return;

  dots.innerHTML = '';

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.onclick = () => showSlide(i);
    dots.appendChild(dot);
  });

  $('.next').onclick = () => showSlide(slide + 1);
  $('.prev').onclick = () => showSlide(slide - 1);

  showSlide(0);

  if (sliderTimer) clearInterval(sliderTimer);
  sliderTimer = setInterval(() => showSlide(slide + 1), 4500);
}

function showSlide(i) {
  const slides = $$('.hero-slide');
  const dots = $$('.slider-dots button');

  if (!slides.length) return;

  slide = (i + slides.length) % slides.length;
  slides.forEach((item, index) => item.classList.toggle('active', index === slide));
  dots.forEach((dot, index) => dot.classList.toggle('active', index === slide));
}

function renderRelated() {
  const wrap = $('#relatedProducts');
  if (!wrap) return;

  wrap.innerHTML = products
    .filter(product => product.id !== 'combo')
    .map(product => `
      <article class="product-card">
        <img src="${product.img}" alt="${product.name}" data-lightbox="${product.id}">
        <h3>${product.name}</h3>
        <b>${taka(product.price).replace('.00', '')}</b>
        <button class="add-btn ${cart[product.id] ? 'added' : ''}" type="button" data-add="${product.id}">
          ${cart[product.id] ? '✓ Added' : '+ Add'}
        </button>
      </article>
    `).join('');

  wrap.querySelectorAll('[data-add]').forEach(btn => {
    btn.onclick = () => {
      cart[btn.dataset.add] = (cart[btn.dataset.add] || 0) + 1;
      renderAll();
    };
  });

  wrap.querySelectorAll('[data-lightbox]').forEach(img => {
    img.onclick = () => openLightbox(img.dataset.lightbox);
  });
}

function renderCart() {
  const wrap = $('#cartItems');
  if (!wrap) return;

  wrap.innerHTML = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(item => item.id === id);
    if (!product) return '';

    return `
      <div class="cart-item">
        <img src="${product.img}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <p>${product.desc}</p>
          <p>Product Code: ${product.code}</p>
          <div class="qty">
            <button type="button" data-dec="${id}">−</button>
            <span>${qty}</span>
            <button type="button" data-inc="${id}">+</button>
          </div>
        </div>
        <div class="item-price">${taka(product.price * qty)}</div>
      </div>
    `;
  }).join('');

  wrap.querySelectorAll('[data-inc]').forEach(btn => {
    btn.onclick = () => {
      cart[btn.dataset.inc]++;
      renderAll();
    };
  });

  wrap.querySelectorAll('[data-dec]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.dec;
      cart[id]--;

      if (cart[id] <= 0 && id !== 'combo') delete cart[id];
      if (id === 'combo' && cart[id] < 1) cart[id] = 1;

      renderAll();
    };
  });
}

function renderSummary() {
  const wrap = $('#summaryItems');
  if (!wrap) return;

  wrap.innerHTML = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(item => item.id === id);
    if (!product) return '';

    return `
      <div class="summary-item">
        <img src="${product.img}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <p>× ${qty}</p>
        </div>
        <b>${taka(product.price * qty)}</b>
      </div>
    `;
  }).join('');
}

function updateTotals() {
  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = products.find(item => item.id === id);
    return product ? sum + product.price * qty : sum;
  }, 0);

  const total = subtotal + delivery;

  $('#subtotalText').textContent = taka(subtotal);
  $('#totalText').textContent = taka(total);
  $('#buttonTotal').textContent = taka(total);

  $('#orderItemsInput').value = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(item => item.id === id);
    if (!product) return '';
    return `${product.name} (${product.code}) x ${qty} = ${product.price * qty}`;
  }).filter(Boolean).join(' | ');

  $('#productCodesInput').value = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(item => item.id === id);
    if (!product) return '';
    return `${product.code} x ${qty}`;
  }).filter(Boolean).join(', ');

  $('#subtotalInput').value = subtotal;
  $('#deliveryInput').value = delivery;
  $('#totalInput').value = total;
}

function openLightbox(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  lbGallery = product.gallery && product.gallery.length ? product.gallery : [product.img];
  lbIndex = 0;

  $('#lightbox').classList.add('open');
  $('#lightbox').setAttribute('aria-hidden', 'false');
  renderLightbox();
}

function closeLightbox() {
  $('#lightbox').classList.remove('open');
  $('#lightbox').setAttribute('aria-hidden', 'true');
}

function renderLightbox() {
  $('#lightboxImage').src = lbGallery[lbIndex];

  $('#lightboxThumbs').innerHTML = lbGallery.map((src, index) => `
    <img src="${src}" class="${index === lbIndex ? 'active' : ''}" alt="Preview ${index + 1}">
  `).join('');

  $$('#lightboxThumbs img').forEach((img, index) => {
    img.onclick = event => {
      event.stopPropagation();
      lbIndex = index;
      renderLightbox();
    };
  });
}

$$('input[name="shipment"]').forEach(radio => {
  radio.addEventListener('change', event => {
    delivery = Number(event.target.dataset.cost);
    updateTotals();
  });
});

$('.lightbox-close').onclick = closeLightbox;

$('.lb-prev').onclick = event => {
  event.stopPropagation();
  lbIndex = (lbIndex - 1 + lbGallery.length) % lbGallery.length;
  renderLightbox();
};

$('.lb-next').onclick = event => {
  event.stopPropagation();
  lbIndex = (lbIndex + 1) % lbGallery.length;
  renderLightbox();
};

$('#lightbox').addEventListener('click', event => {
  if (
    !event.target.closest('.lightbox-content') &&
    !event.target.closest('.lightbox-thumbs') &&
    !event.target.closest('.lightbox-close')
  ) {
    closeLightbox();
  }
});

$('.lightbox-content').addEventListener('click', event => event.stopPropagation());

$('#fab .fab-main').onclick = () => $('#fab').classList.toggle('collapsed');

$('#order').addEventListener('submit', event => {
  if (!document.querySelector('input[name="shipment"]:checked')) {
    event.preventDefault();
    alert('অনুগ্রহ করে Shipment নির্বাচন করুন: ঢাকার ভিতরে অথবা ঢাকার বাইরে।');
  }
});

function renderAll() {
  renderCart();
  renderSummary();
  renderRelated();
  updateTotals();
}

loadSiteData();