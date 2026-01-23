// js/productDetailView.js
import { getProductBySlug } from "./products.js";

/**
 * Renderiza la vista detalle del producto.
 * Dependencias inyectadas para evitar importar desde main.js (sin ciclos).
 */
export function renderProductDetailView(slug, deps) {
  const { renderView, renderBreadcrumb } = deps;

  const product = getProductBySlug(slug);
  if (!product) return;

  renderView("view-product-detail");
  renderBreadcrumb(product.category, product.subcategory);

  const container = document.getElementById('productDetail');
      if (!container) return;
  
        // =========================
        // Product variation state
        // =========================
        let activeVariation = null;

        let images = [];
        let price = product.price;

        // Producto VARIABLE
        if (product.type === "variable" && Array.isArray(product.variations) && product.variations.length) {
        activeVariation =
            product.variations.find(v => v.id === product.defaultVariationId) ||
            product.variations[0];

        if (activeVariation) {
            images = Array.isArray(activeVariation.images) ? activeVariation.images : [];
            price = (activeVariation.price ?? product.price);
        }
        } else {
        // Producto SIMPLE
        images = Array.isArray(product.images) ? product.images : [];
        }

        const mainImage = images[0] || '';

  
      const thumbsHtml = (images.length > 1)
          ? `
        <div class="product-thumbs" aria-label="Miniaturas del producto">
          ${images.map((src, i) => `
            <button type="button"
                    class="thumb-btn ${i === 0 ? 'is-active' : ''}"
                    data-index="${i}"
                    aria-label="Ver imagen ${i + 1}">
              <span class="thumb-frame frame-box">
                <img src="${src}" alt="${product.name} miniatura ${i + 1}" loading="lazy" decoding="async">
              </span>
            </button>
          `).join('')}
        </div>
      `
          : '';
    const variationsHtml = (
        product.type === "variable" &&
        Array.isArray(product.variations) &&
        product.variations.length > 0
        ) ? `
        <div class="product-variations" aria-label="Variaciones del producto">
            <p class="variations-label">Variación:</p>
            <div class="variation-options" id="variationOptions">
            ${product.variations.map(v => `
                <button type="button"
                        class="variation-btn frame-box ${activeVariation && v.id === activeVariation.id ? 'is-active' : ''}"
                        data-variation-id="${v.id}">
                ${v.label}
                </button>
            `).join('')}
            </div>
        </div>
        ` : '';

      container.innerHTML = `
    <div class="product-detail-content">
      <div class="product-detail-image">
          <div class="product-main-frame">
              <img class="product-main-img"
                src="${mainImage}"
                alt="${product.name}"
                loading="eager"
                decoding="async"
                fetchpriority="high">
          </div>
  ${thumbsHtml}
  
      </div>
  
      <div class="product-detail-info">
        <h2 class="view-title">${product.name}</h2>
  
        <p class="product-detail-description">
          ${product.description || ''}
        </p>
  
        <p class="product-detail-price">
          <span class="price-label">Precio:</span>
          <span class="price-amount">$${price}</span>
        </p>

        ${variationsHtml}
  
        <button class="product-detail-whatsapp product-btn" type="button">
          Consultar por WhatsApp
        </button>
      </div>
    </div>
  
    <div class="product-tabs frame-box">
      <div class="tabs-header" role="tablist">
        <button class="tab-btn is-active" data-tab="overview" type="button">Vista general</button>
        <button class="tab-btn" data-tab="specs" type="button">Especificaciones</button>
        <button class="tab-btn" data-tab="reviews" type="button">Valoraciones</button>
      </div>
  
      <div class="tabs-body">
        <section class="tab-panel is-active" data-panel="overview"></section>
        <section class="tab-panel" data-panel="specs"></section>
        <section class="tab-panel" data-panel="reviews"></section>
      </div>
    </div>
  `;
  
      // Galería: miniaturas -> cambia imagen principal
      setupProductGallery(images);
      warmProductImages(images);
      setupImageZoomOverlay(() => images, product.name);
      setupVariationSelector(product, () => activeVariation, (v) => { activeVariation = v; }, () => images, (imgs) => { images = imgs; });
  
      // Pintar contenido de tabs
      renderOverviewBlocks(product);
      renderSpecs(product);
      renderReviewsPlaceholder(product);
      setupTabs();
  
      // WhatsApp contextual (si ya lo tenías, mantenlo)
      const detailWhatsappBtn = document.querySelector('.product-detail-whatsapp');
      if (detailWhatsappBtn) {
          detailWhatsappBtn.addEventListener('click', () => {
              const phone = '5350801563';
              const message = `Hola, estoy interesado en: ${product.name} (de $${product.price})`;
              const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
              window.open(url, '_blank', 'noopener');
          });
      }
  }
  
  /**
   * Galería del detalle: cambia la imagen principal al hacer click en miniaturas
   * - No requiere librerías
   * - No toca el modelo, solo usa product.images[]
   */
  function setupProductGallery(images) {
      const mainImg = document.querySelector('.product-main-img');
      const buttons = Array.from(document.querySelectorAll('.thumb-btn'));
  
      // Si no hay miniaturas (0 o 1 imagen), no hacemos nada
      if (!mainImg || buttons.length === 0) return;
  
      buttons.forEach(btn => {
          btn.addEventListener('click', () => {
              const idx = Number(btn.dataset.index);
              if (!Number.isInteger(idx)) return;
              const nextSrc = images[idx];
  
              if (!nextSrc) return;
              if (mainImg.getAttribute('src') === nextSrc) return; // evita animar si es la misma
              
              prefetchAdjacent(images, idx);

              // Fade out
              mainImg.classList.add('is-fading');
  
              // Cambiar src después de un pequeño delay para que se vea el fade
              window.setTimeout(() => {
                  mainImg.src = nextSrc;
  
                  // Cuando cargue la nueva, fade in
                  const onLoaded = () => {
                      mainImg.classList.remove('is-fading');
                      mainImg.removeEventListener('load', onLoaded);
                  };
  
                  mainImg.addEventListener('load', onLoaded);
  
                  // Por si la imagen viene cacheada y no dispara load de forma fiable
                  window.setTimeout(() => {
                      mainImg.classList.remove('is-fading');
                      mainImg.removeEventListener('load', onLoaded);
                  }, 300);
  
              }, 120);
  
              // Estado activo
              buttons.forEach(b => b.classList.toggle('is-active', b === btn));
          });
      });
  }

function setupTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      buttons.forEach(b => b.classList.toggle('is-active', b === btn));
      panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === tab));
    });
  });
}

function renderOverviewBlocks(product) {
  const panel = document.querySelector('.tab-panel[data-panel="overview"]');
  if (!panel) return;

  const blocks = Array.isArray(product.overviewBlocks) ? product.overviewBlocks : [];

  if (blocks.length === 0) {
    panel.innerHTML = `<p class="muted">Sin contenido adicional.</p>`;
    return;
  }

  panel.innerHTML = blocks.map(block => {
    if (block.type === 'banner') {
      const title = block.title ? `<h3 class="banner-title">${block.title}</h3>` : '';
      const text = block.text ? `<p class="banner-text">${block.text}</p>` : '';
      return `
        <article class="overview-banner">
          <div class="banner-media">
            <img src="${block.image || ''}" alt="${block.title || product.name}" loading="lazy" decoding="async">
          </div>
          ${(title || text) ? `<div class="banner-copy">${title}${text}</div>` : ''}
        </article>
      `;
    }

    if (block.type === 'html') {
      // En backend deberás sanitizar HTML (XSS). Aquí asumimos contenido confiable.
      return `<div class="overview-html">${block.html || ''}</div>`;
    }

    return '';
  }).join('');
}

function renderSpecs(product) {
  const panel = document.querySelector('[data-panel="specs"]');
  if (!panel) return;

  if (!product.specs) {
    panel.innerHTML = '<p class="muted">No hay especificaciones disponibles.</p>';
    return;
  }

  if (Array.isArray(product.specs)) {
    panel.innerHTML = product.specs
      .map(line => `<p class="spec-text">${line}</p>`)
      .join('');
  } else {
    panel.innerHTML = `<div class="spec-text">${product.specs}</div>`;
  }
}

function renderReviewsPlaceholder(product) {
  const panel = document.querySelector('.tab-panel[data-panel="reviews"]');
  if (!panel) return;

  panel.innerHTML = `
    <p class="muted">Próximamente: reseñas verificadas por WhatsApp.</p>
  `;
}

/* =========================
   Zoom overlay (click en imagen)
========================= */

let zoomState = {
  isReady: false,
  images: [],
  index: 0,
  productName: '',
  els: null,
};

zoomState.activeLayer = 'A';

function setupImageZoomOverlay(imagesOrFn, productName) {
  const mainImg = document.querySelector('.product-main-img');
  if (!mainImg) return;

  // Evita duplicar listeners si se refresca la galería (variaciones)
  if (mainImg.dataset.zoomBound === '1') return;
  mainImg.dataset.zoomBound = '1';

  ensureZoomModalExists();

  mainImg.addEventListener('click', () => {
    const imgs = (typeof imagesOrFn === 'function') ? imagesOrFn() : imagesOrFn;
    if (!Array.isArray(imgs) || imgs.length === 0) return;

    const activeThumb = document.querySelector('.thumb-btn.is-active');
    const idx = activeThumb ? Number(activeThumb.dataset.index) : 0;
    openZoom(idx, imgs, productName);
  });
}


function ensureZoomModalExists() {
  if (zoomState.isReady) return;

  const modal = document.createElement('div');
  modal.className = 'img-zoom-modal';
  modal.id = 'imgZoomModal';
  modal.hidden = true;

  modal.innerHTML = `
    <div class="img-zoom-topbar">
      <div class="img-zoom-counter" id="imgZoomCounter">1/1</div>
      <button type="button" class="img-zoom-close" id="imgZoomClose" aria-label="Cerrar">✕</button>
    </div>

    <div class="img-zoom-stage">
        <div class="img-zoom-viewport">
            <div class="img-zoom-layer" id="imgZoomLayerA"><img id="imgZoomImgA" alt=""></div>
            <div class="img-zoom-layer" id="imgZoomLayerB"><img id="imgZoomImgB" alt=""></div>
        </div>
    </div>


    <div class="img-zoom-bottombar">
      <div class="img-zoom-strip">
        <button type="button" class="img-zoom-nav" id="imgZoomPrev" aria-label="Anterior">‹</button>
        <div class="img-zoom-thumbs" id="imgZoomThumbs" aria-label="Miniaturas ampliadas"></div>
        <button type="button" class="img-zoom-nav" id="imgZoomNext" aria-label="Siguiente">›</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const els = {
    modal,
    close: modal.querySelector('#imgZoomClose'),
    counter: modal.querySelector('#imgZoomCounter'),
    layerA: modal.querySelector('#imgZoomLayerA'),
    layerB: modal.querySelector('#imgZoomLayerB'),
    imgA: modal.querySelector('#imgZoomImgA'),
    imgB: modal.querySelector('#imgZoomImgB'),
    thumbs: modal.querySelector('#imgZoomThumbs'),
    prev: modal.querySelector('#imgZoomPrev'),
    next: modal.querySelector('#imgZoomNext'),
    stage: modal.querySelector('.img-zoom-stage'),
  };

    if (!els.stage) {
    console.error('Zoom modal: stage no encontrado (.img-zoom-stage).');
    return;
    }

    if (!els.close || !els.counter || !els.thumbs || !els.prev || !els.next || !els.imgA || !els.imgB || !els.layerA || !els.layerB) {
    console.error('Zoom modal: faltan elementos. Revisa IDs dentro de modal.innerHTML');
    return;
    }

  // Cerrar (solo X o ESC)
  els.close.addEventListener('click', closeZoom);

  // Navegación click
  els.prev.addEventListener('click', () => stepZoom(-1));
  els.next.addEventListener('click', () => stepZoom(1));

  bindZoomSwipe(els.stage);

  // Teclado: SOLO si el modal está abierto
  document.addEventListener('keydown', (e) => {
    if (els.modal.hidden) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeZoom();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepZoom(-1);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepZoom(1);
      return;
    }
  });

  zoomState.isReady = true;
  zoomState.els = els;
}

function openZoom(startIndex, images, productName) {
  zoomState.images = images.slice();
  zoomState.productName = productName || '';
  zoomState.index = clampIndex(startIndex, zoomState.images.length);

  renderZoomUI();
  prefetchAdjacent(zoomState.images, zoomState.index);
  warmProductImages(zoomState.images);

  zoomState.els.modal.hidden = false;
  document.body.style.overflow = 'hidden';
  zoomState.els.close.focus();
}

function closeZoom() {
  if (!zoomState.isReady) return;
  zoomState.els.modal.hidden = true;
  document.body.style.overflow = '';
}

function stepZoom(delta) {
  const total = zoomState.images.length;
  if (total <= 1) return;

  zoomState.index = (zoomState.index + delta) % total;
  if (zoomState.index < 0) zoomState.index = total - 1;

  renderZoomUI(delta > 0 ? 'next' : 'prev');
}

function renderZoomUI(direction = null) {
  const { els } = zoomState;
  const total = zoomState.images.length;
  const idx = zoomState.index;

  const src = zoomState.images[idx] || '';
  const alt = zoomState.productName
    ? `${zoomState.productName} — imagen ${idx + 1}`
    : `Imagen ${idx + 1}`;

  els.counter.textContent = `${idx + 1}/${total}`;

  // Miniaturas (igual que ya lo tienes)
  els.thumbs.innerHTML = zoomState.images.map((tSrc, i) => {
    const active = i === idx ? 'is-active' : '';
    return `
      <button type="button" class="img-zoom-thumbbtn ${active}" data-zoom-index="${i}" aria-label="Ver imagen ${i + 1}">
        <span class="img-zoom-thumbframe frame-box">
          <img src="${tSrc}" alt="">
        </span>
      </button>
    `;
  }).join('');

  els.thumbs.querySelectorAll('.img-zoom-thumbbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.zoomIndex);
      const prevIndex = zoomState.index;
      zoomState.index = clampIndex(i, total);

      if (zoomState.index === prevIndex) return;
      renderZoomUI(zoomState.index > prevIndex ? 'next' : 'prev');

      btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
  });

  // Si es primer render (sin dirección), set directo en capa activa
    if (!direction) {
    if (zoomState.activeLayer === 'A') {
        els.imgA.src = src;
        els.imgA.alt = '';
        if (els.imgA.hasAttribute('title')) els.imgA.removeAttribute('title');
        els.imgB.removeAttribute('src');
    } else {
        els.imgB.src = src;
        els.imgB.alt = '';
        if (els.imgB.hasAttribute('title')) els.imgB.removeAttribute('title'); // <- aquí era imgA
        els.imgA.removeAttribute('src');
    }
    return;
    }

  // Swap animado con 2 capas
  const leavingLayer = zoomState.activeLayer === 'A' ? els.layerA : els.layerB;
  const enteringLayer = zoomState.activeLayer === 'A' ? els.layerB : els.layerA;
  const leavingImg = zoomState.activeLayer === 'A' ? els.imgA : els.imgB;
  const enteringImg = zoomState.activeLayer === 'A' ? els.imgB : els.imgA;


enteringImg.src = src;
enteringImg.alt = '';
if (enteringImg.hasAttribute('title')) {
  enteringImg.removeAttribute('title');
}

// Limpia clases anteriores
leavingLayer.classList.remove('img-leave-left', 'img-leave-right');
enteringLayer.classList.remove('img-enter-left', 'img-enter-right');

// Asegura orden de capas DURANTE el swap (saliente arriba)
leavingLayer.style.zIndex = '2';
enteringLayer.style.zIndex = '1';

// Fuerza reflow para reiniciar animación
void enteringLayer.offsetWidth;

if (direction === 'prev') {
  // Navegar IZQUIERDA: actual sale a la izquierda, nueva entra desde derecha
  leavingLayer.classList.add('img-leave-left');
  enteringLayer.classList.add('img-enter-right');
} else {
  // direction === 'next'
  leavingLayer.classList.add('img-leave-right');
  enteringLayer.classList.add('img-enter-left');
}

// Al terminar, fija la capa entrante como activa
const onDone = () => {
  leavingLayer.classList.remove('img-leave-left', 'img-leave-right');
  enteringLayer.classList.remove('img-enter-left', 'img-enter-right');

  // limpia la imagen que “salió” para evitar overlap invisible
  leavingImg.removeAttribute('src');

  zoomState.activeLayer = (zoomState.activeLayer === 'A') ? 'B' : 'A';

  // reset z-index
  leavingLayer.style.zIndex = '';
  enteringLayer.style.zIndex = '';

  enteringLayer.removeEventListener('animationend', onDone);
};

enteringLayer.addEventListener('animationend', onDone);
}

function clampIndex(i, total) {
  if (!Number.isFinite(i) || total <= 0) return 0;
  return Math.max(0, Math.min(total - 1, i));
}

function bindZoomSwipe(targetEl) {
  if (!targetEl) return;
  if (targetEl.dataset.swipeBound === '1') return;
  targetEl.dataset.swipeBound = '1';

  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dy = 0;
  let active = false;

  const THRESHOLD = 50;

  targetEl.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    if (zoomState.els.modal.hidden) return;

    active = true;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    dy = 0;
  }, { passive: true });

  targetEl.addEventListener('pointermove', (e) => {
    if (!active) return;
    if (e.pointerType !== 'touch') return;

    dx = e.clientX - startX;
    dy = e.clientY - startY;

    if (Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > 10) {
      e.preventDefault();
    }
  }, { passive: false });

  const end = () => {
    if (!active) return;
    active = false;

    if (Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) >= THRESHOLD) {
      if (dx < 0) stepZoom(1);
      else stepZoom(-1);
    }

    dx = 0;
    dy = 0;
  };

  targetEl.addEventListener('pointerup', end, { passive: true });
  targetEl.addEventListener('pointercancel', end, { passive: true });
}


/* =========================
   Performance: preload helpers
========================= */

const __preloadCache = new Set();

function preloadImage(src) {
  if (!src || __preloadCache.has(src)) return;
  __preloadCache.add(src);

  const img = new Image();
  img.decoding = 'async';
  img.src = src;
}

function runIdle(fn) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(fn, { timeout: 1200 });
  } else {
    window.setTimeout(fn, 250);
  }
}

// Precarga suave de todas (menos la primera) cuando el navegador esté libre
function warmProductImages(images) {
  if (!Array.isArray(images) || images.length <= 1) return;

  // precarga inmediata: la 2da (suele ser la próxima que miran)
  preloadImage(images[1]);

  // el resto en idle
  runIdle(() => {
    for (let i = 2; i < images.length; i++) preloadImage(images[i]);
  });
}

// Precarga “vecinos” para navegación instantánea
function prefetchAdjacent(images, idx) {
  if (!Array.isArray(images) || images.length <= 1) return;

  const next = images[(idx + 1) % images.length];
  const prev = images[(idx - 1 + images.length) % images.length];

  preloadImage(next);
  preloadImage(prev);
}

function setupVariationSelector(product, getActiveVar, setActiveVar, getImages, setImages) {
  const wrap = document.getElementById('variationOptions');
  if (!wrap) return;

  const priceEl = document.querySelector('.price-amount');
  const thumbsWrap = document.querySelector('.product-thumbs');
  const mainImg = document.querySelector('.product-main-img');

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.variation-btn');
    if (!btn) return;

    const id = btn.dataset.variationId;
    const nextVar = product.variations.find(v => v.id === id);
    if (!nextVar) return;

    const currentVar = getActiveVar();
    if (currentVar && currentVar.id === nextVar.id) return;

    // 1) estado
    setActiveVar(nextVar);

    // 2) imágenes efectivas
    const nextImages = Array.isArray(nextVar.images) ? nextVar.images : [];
    setImages(nextImages);

    // 3) precio
    if (priceEl) {
      const nextPrice = (nextVar.price ?? product.price);
      priceEl.textContent = `$${nextPrice}`;
    }

    // 4) UI active
    wrap.querySelectorAll('.variation-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.variationId === id);
    });

    // 5) refrescar galería (main + thumbs)
    refreshDetailGallery(nextImages, product.name, mainImg, thumbsWrap);

    // 6) performance
    warmProductImages(nextImages);
  });
}

function refreshDetailGallery(images, productName, mainImg, thumbsWrap) {
  if (!mainImg) return;

  const main = images[0] || '';
  mainImg.classList.remove('is-fading');
  mainImg.src = main;
  mainImg.alt = productName;

  // thumbs
  if (!thumbsWrap) return;

  if (!Array.isArray(images) || images.length <= 1) {
    thumbsWrap.innerHTML = '';
    thumbsWrap.style.display = 'none';
    return;
  }

  thumbsWrap.style.display = '';
  thumbsWrap.innerHTML = images.map((src, i) => `
    <button type="button"
            class="thumb-btn ${i === 0 ? 'is-active' : ''}"
            data-index="${i}"
            aria-label="Ver imagen ${i + 1}">
      <span class="thumb-frame frame-box">
        <img src="${src}" alt="${productName} miniatura ${i + 1}" loading="lazy" decoding="async">
      </span>
    </button>
  `).join('');

  // reengancha handlers de miniaturas a este nuevo set
  setupProductGallery(images);
}