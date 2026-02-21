// Income calculator for tuyen-ctv.html
const slider = document.getElementById('calcSlider');
const ordersEl = document.getElementById('calcOrders');
const amountEl = document.getElementById('calcAmount');
const unitPrice = 1450000;

if (slider) {
    slider.addEventListener('input', () => {
        const orders = parseInt(slider.value);
        ordersEl.textContent = orders;

        let pct = 0.10;
        if (orders >= 30) pct = 0.25;
        else if (orders >= 10) pct = 0.15;

        const income = Math.round(orders * unitPrice * pct);
        amountEl.textContent = income.toLocaleString('vi-VN') + '₫';
    });
}

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Floating Widget Logic
const ctvWidget = document.getElementById('ctvFloatingWidget');
if (ctvWidget) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            ctvWidget.classList.add('collapsed');
        } else {
            ctvWidget.classList.remove('collapsed');
        }
    }, { passive: true });
}
