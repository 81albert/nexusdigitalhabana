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
                            link.href = sub.url;
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
                link.href = sub.url;
                subcategoryList.appendChild(subTpl);
            });

            document.body.classList.add('sub-open');
        });
    }

});
