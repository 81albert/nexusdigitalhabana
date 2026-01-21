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
  
      const images = Array.isArray(product.images) ? product.images : [];
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
                <img src="${src}" alt="${product.name} miniatura ${i + 1}">
              </span>
            </button>
          `).join('')}
        </div>
      `
          : '';
  
      container.innerHTML = `
    <div class="product-detail-content">
      <div class="product-detail-image">
          <div class="product-main-frame frame-box">
              <img class="product-main-img" src="${mainImage}" alt="${product.name}">
          </div>
  ${thumbsHtml}
  
      </div>
  
      <div class="product-detail-info frame-box">
        <h2 class="view-title">${product.name}</h2>
  
        <p class="product-detail-description">
          ${product.description || ''}
        </p>
  
        <p class="product-detail-price">
          <span class="price-label">Precio:</span>
          <span class="price-amount">$${product.price}</span>
        </p>
  
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
              const nextSrc = images[idx];
  
              if (!nextSrc) return;
              if (mainImg.getAttribute('src') === nextSrc) return; // evita animar si es la misma
  
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
            <img src="${block.image || ''}" alt="${block.title || product.name}">
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
