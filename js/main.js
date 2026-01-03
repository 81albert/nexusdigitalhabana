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

