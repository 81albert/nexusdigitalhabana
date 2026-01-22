import { PRODUCTS, getProductBySlug } from "./products.js";
import { renderProductDetailView } from "./productDetailView.js";

const app = document.getElementById('app');

function renderView(templateId) {
    const template = document.getElementById(templateId);
    if (!template) return;

    app.innerHTML = '';
    app.appendChild(template.content.cloneNode(true));
}

function renderProductsView(products) {
    renderView('view-products');

    const grid = document.querySelector('.products-grid');
    const empty = document.querySelector('.products-empty');
    const template = document.getElementById('product-card-template');

    if (!grid || !template) return;

    grid.innerHTML = '';

    // ESTADO VACÍO
    if (products.length === 0) {
        if (empty) empty.hidden = false;
        const backBtn = document.getElementById('emptyBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                document.body.classList.add('sidebar-open');
                document.body.style.overflow = 'hidden';
            });
        }
        return;
    }

    if (empty) empty.hidden = true;

    products.forEach(product => {
        const card = template.content.cloneNode(true);

        const img = card.querySelector('img');
        const title = card.querySelector('.product-title');
        const category = card.querySelector('.product-category');
        const price = card.querySelector('.price');

        img.src = product.images[0];
        img.alt = product.name;
        img.loading = 'lazy';
        img.decoding = 'async';
        title.textContent = product.name;
        category.textContent = product.category;
        price.textContent = `$${product.price}`;
		const article = card.querySelector('.product-card');
		article.dataset.slug = product.slug;
		article.style.cursor = 'pointer';
			
		article.addEventListener('click', () => {
		window.location.hash = `/p/${product.slug}`;
	});

        grid.appendChild(card);
    });
}

function getProductsByCategory(categoryKey) {
    return PRODUCTS.filter(product => product.category === categoryKey);
}

function getProductsBySubcategory(categoryKey, subcategoryKey) {
    return PRODUCTS.filter(product =>
        product.category === categoryKey &&
        product.subcategory === subcategoryKey
    );
}

function updateProductsTitle(categoryKey, subcategoryKey) {
    const titleEl = document.querySelector('.view-title');
    if (!titleEl) return;

    const category = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
    const subcategory = subcategoryKey
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    titleEl.textContent = `${category} / ${subcategory}`;
}

function renderBreadcrumb(categoryKey, subcategoryKey, productName = null) {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;

    breadcrumb.innerHTML = '';

    // Inicio
    const home = document.createElement('span');
    home.textContent = 'Inicio';
    home.addEventListener('click', () => {
        window.location.hash = '/';
    });
    breadcrumb.appendChild(home);

    // Categoría
    if (categoryKey) {
    breadcrumb.appendChild(createSeparator());

    const cat = document.createElement('span');
    cat.textContent = capitalize(categoryKey);
    cat.addEventListener('click', () => {
        // Volver a la categoría principal (muestra TODO dentro de la categoría)
        window.location.hash = `/${categoryKey}`;
    });
    breadcrumb.appendChild(cat);
}


    // Subcategoría
    if (subcategoryKey) {
        breadcrumb.appendChild(createSeparator());

        const sub = document.createElement('span');
        sub.textContent = formatSlug(subcategoryKey);
        sub.addEventListener('click', () => {
            window.location.hash = `/${categoryKey}/${subcategoryKey}`;
        });
        breadcrumb.appendChild(sub);
    }

    // Producto (solo texto)
    if (productName) {
        breadcrumb.appendChild(createSeparator());

        const prod = document.createElement('span');
        prod.textContent = productName;
        prod.style.cursor = 'default';
        breadcrumb.appendChild(prod);
    }
}

function createSeparator() {
    const sep = document.createElement('span');
    sep.textContent = '/';
    sep.className = 'separator';
    return sep;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatSlug(str) {
    return str
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

function routeFromHash() {
    const hash = (window.location.hash || '').replace('#', '').trim();

    if (!hash || hash === '/') {
        renderView('view-home');
        return;
    }

    const parts = hash.split('/').filter(Boolean);

    // Detalle: #/p/<slug>
    if (parts[0] === 'p' && parts[1]) {
        renderProductDetailView(parts[1], { renderView, renderBreadcrumb });
        return;
    }

    // Subcategoría: #/<category>/<subcategory>
    if (parts.length >= 2) {
        const categoryKey = (parts[0] || '').toLowerCase().trim();
        const subcategoryKey = (parts[1] || '').toLowerCase().trim();

        if (subcategoryKey === 'todo') {
            window.location.hash = `/${categoryKey}`;
            return;
        }

        renderProductsView(getProductsBySubcategory(categoryKey, subcategoryKey));
        renderBreadcrumb(categoryKey, subcategoryKey);
        updateProductsTitle(categoryKey, subcategoryKey);
        return;
    }

    // Categoría: #/<category>  (mostrar TODO en esa categoría)
    if (parts.length === 1) {
        const categoryKey = (parts[0] || '').toLowerCase().trim();

        renderProductsView(getProductsByCategory(categoryKey));
        renderBreadcrumb(categoryKey, null);
        updateProductsTitle(categoryKey, null);
        return;
    }

    // Fallback
    renderView('view-home');
}

document.addEventListener('DOMContentLoaded', () => {

    const whatsappBtn = document.getElementById('whatsappBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            const phone = '5350801563';
            const message = 'Hola, estoy interesado en uno de sus productos';
            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank', 'noopener');
        });
    }

    const btnCategories = document.getElementById('btnCategories');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebar = document.getElementById('closeSidebar');
    const backSub = document.getElementById('backSub');
    const subcategoryList = document.getElementById('subcategoryList');

    btnCategories.addEventListener('click', () => {
        document.body.classList.add('sidebar-open');
        document.body.style.overflow = 'hidden';
    });

    function closeAll() {
        document.body.classList.remove('sidebar-open', 'sub-open');
        document.body.style.overflow = '';
    }

    sidebarOverlay.addEventListener('click', closeAll);
    closeSidebar.addEventListener('click', closeAll);
    backSub.addEventListener('click', () => document.body.classList.remove('sub-open'));

    // Load menu data
    fetch('data/menu.json')
        .then(res => res.json())
        .then(MENU_DATA => renderCategories(MENU_DATA))
        .catch(err => console.error('Error loading menu.json:', err));

    // Render categories dynamically
    function renderCategories(MENU_DATA) {
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = '';
    
        Object.entries(MENU_DATA).forEach(([key, catData]) => {
            const tpl = document.getElementById('category-item-template').content.cloneNode(true);
            const li = tpl.querySelector('li');
            const img = li.querySelector('img');
            const a = li.querySelector('a');
            const btnExpand = li.querySelector('.cat-expand');
    
            img.src = catData.icon || '';
            img.alt = catData.label;
            a.textContent = catData.label;
            a.href = catData.url || '#';
    
            // Hide arrow if no submenu items
            if (!catData.items || catData.items.length === 0) {
                btnExpand.style.display = 'none';
            } else {
                btnExpand.dataset.category = key;
            }
    
            attachCategoryClick(li, MENU_DATA);
            categoryList.appendChild(li);
        });
    }
    

    function attachCategoryClick(categoryItem, MENU_DATA) {
        const expandBtn = categoryItem.querySelector('.cat-expand');

        categoryItem.addEventListener('click', (e) => {
            if (!expandBtn) return; // no submenu → normal navigation
            e.preventDefault();

            const categoryKey = expandBtn.dataset.category;
            const categoryData = MENU_DATA[categoryKey];
            if (!categoryData) return;

            const isMobile = window.innerWidth <= 768;

            /* ===== MOBILE ACCORDION ===== */
            if (isMobile) {
                const alreadyOpen = categoryItem.classList.contains('open');

                // Close all other categories
                document.querySelectorAll('.category-item.open')
                    .forEach(item => item.classList.remove('open'));

                if (!alreadyOpen) {
                    // Create submenu if not exist
                    let subList = categoryItem.querySelector('.subcategory-inline');
                    if (!subList) {
                        const listTpl = document.getElementById('subcategory-inline-template').content.cloneNode(true);
                        subList = listTpl.querySelector('.subcategory-inline');

                        categoryData.items.forEach(sub => {
                            const subTpl = document.getElementById('subcategory-item-template').content.cloneNode(true);
                            const link = subTpl.querySelector('a');
                            link.textContent = sub.label;
                            let u = sub.url || '#';
                            u = u.replace(/^\/+/, '');          // quita slash inicial
                            u = u.replace(/\/todo$/, '');       // quita /todo al final si existe
                            link.href = `#/${u}`;
                            subList.appendChild(subTpl);
                        });

                        categoryItem.appendChild(subList);
                    }

                    categoryItem.classList.add('open');
                }

                return;
            }

            /* ===== DESKTOP SIDEBAR ===== */
            subcategoryList.innerHTML = '';
            categoryData.items.forEach(sub => {
                const subTpl = document.getElementById('subcategory-item-template').content.cloneNode(true);
                const link = subTpl.querySelector('a');
                link.textContent = sub.label;
                let u = sub.url || '#';
                u = u.replace(/^\/+/, '');          // quita slash inicial
                u = u.replace(/\/todo$/, '');       // quita /todo al final si existe
                link.href = `#/${u}`;
                subcategoryList.appendChild(subTpl);
            });

            document.body.classList.add('sub-open');
        });
    }
			subcategoryList.addEventListener('click', (e) => {
				const link = e.target.closest('a');
				if (!link) return;

				e.preventDefault();

				let url = link.getAttribute('href');
                if (!url) return;

                // Soporta "#/componentes" o "#/componentes/almacenamiento" o "/componentes/..."
                url = url.replace(/^#/, '').replace(/^\/+/, '');

                const parts = url.split('/').filter(Boolean);
                if (parts.length < 1) return;

                const categoryKey = parts[0];
                const subcategoryKey = parts[1] || null;

                // Cerrar sidebar
                document.body.classList.remove('sidebar-open', 'sub-open');
                document.body.style.overflow = '';

                // Navegar por hash (deja que routeFromHash() renderice)
                window.location.hash = subcategoryKey
                ? `/${categoryKey}/${subcategoryKey}`
                : `/${categoryKey}`;
			});
			
			document.body.addEventListener('click', (e) => {
				const link = e.target.closest('.subcategory-inline a');
				if (!link) return;

				e.preventDefault();

				let url = link.getAttribute('href');
                if (!url) return;

                url = url.replace(/^#/, '').replace(/^\/+/, '');

                const parts = url.split('/').filter(Boolean);
                if (parts.length < 1) return;

                const categoryKey = parts[0];
                const subcategoryKey = parts[1] || null;

                // Cerrar sidebar (móvil)
                document.body.classList.remove('sidebar-open', 'sub-open');
                document.body.style.overflow = '';

                // Navegar por hash (deja que routeFromHash() renderice)
                window.location.hash = subcategoryKey
                ? `/${categoryKey}/${subcategoryKey}`
                : `/${categoryKey}`;
			});

routeFromHash();
window.addEventListener('hashchange', routeFromHash);
});




