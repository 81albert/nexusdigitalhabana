document.addEventListener('DOMContentLoaded', function () {
    const whatsappBtn = document.getElementById('whatsappBtn');

    if (!whatsappBtn) return;

    whatsappBtn.addEventListener('click', function () {
        const phone = '5350801563';
        const message = 'Hola, estoy interesado en uno de sus productos';

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener');
    });
});

document.addEventListener('DOMContentLoaded', () => {

    const btnCategories = document.getElementById('btnCategories');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebar = document.getElementById('closeSidebar');
    const backSub = document.getElementById('backSub');

    const expandButtons = document.querySelectorAll('.cat-expand');
    const subcategoryList = document.getElementById('subcategoryList');

    /* ABRIR sidebar principal */
    btnCategories.addEventListener('click', () => {
        document.body.classList.add('sidebar-open');
        document.body.style.overflow = 'hidden';
    });

    /* CERRAR TODO */
    function closeAll() {
        document.body.classList.remove('sidebar-open', 'sub-open');
        document.body.style.overflow = '';
    }

    sidebarOverlay.addEventListener('click', closeAll);
    closeSidebar.addEventListener('click', closeAll);

    /* VOLVER DESDE SUBCATEGORÍAS */
    backSub.addEventListener('click', () => {
        document.body.classList.remove('sub-open');
    });

    /* ABRIR SUBCATEGORÍAS */
    expandButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            const category = btn.dataset.category;

            subcategoryList.innerHTML = '';

            if (category === 'componentes') {
                subcategoryList.innerHTML = `
                    <li><a href="#">Todo en Componentes</a></li>
                    <li><a href="#">Placa base</a></li>
                    <li><a href="#">Almacenamiento</a></li>
                    <li><a href="#">Sistema de enfriamiento</a></li>
                    <li><a href="#">Fuente de alimentación</a></li>
                    <li><a href="#">Chasis</a></li>
                `;
            }

            if (category === 'perifericos') {
                subcategoryList.innerHTML = `
                    <li><a href="#">Todo en Periféricos</a></li>
                    <li><a href="#">Monitores</a></li>
                    <li><a href="#">Teclado / Mouse</a></li>
                `;
            }

            document.body.classList.add('sub-open');
        });
    });

});
