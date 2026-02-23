// ===================================
// D10: STICKY CTA — Mobile Bottom Bar
// Hiện khi cuộn qua hero, ẩn khi tới #contact
// Chỉ hiện trên mobile (≤768px)
// ===================================

export function initStickyCTA() {
    // Chỉ khởi tạo trên mobile
    if (window.innerWidth > 768) return;

    const hero = document.querySelector('.hero');
    const contact = document.getElementById('contact');
    if (!hero || !contact) return;

    // Tạo sticky bar dynamically
    const bar = document.createElement('div');
    bar.className = 'sticky-cta-bar';
    bar.id = 'stickyCta';
    bar.innerHTML = `
        <div class="sticky-cta-text">
            <strong>48.000₫/ngày</strong>
            Rẻ hơn 1 ly cà phê
        </div>
        <button class="sticky-cta-btn" id="stickyCtaBtn">Đặt Thử Ngay</button>
    `;
    document.body.appendChild(bar);

    // Click → scroll to #contact
    const btn = document.getElementById('stickyCtaBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            contact.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // IntersectionObserver: show/hide based on scroll position
    let heroVisible = true;
    let contactVisible = false;

    const heroObs = new IntersectionObserver(
        ([entry]) => {
            heroVisible = entry.isIntersecting;
            updateVisibility();
        },
        { threshold: 0.1 }
    );

    const contactObs = new IntersectionObserver(
        ([entry]) => {
            contactVisible = entry.isIntersecting;
            updateVisibility();
        },
        { threshold: 0.05 }
    );

    heroObs.observe(hero);
    contactObs.observe(contact);

    function updateVisibility() {
        const shouldShow = !heroVisible && !contactVisible;
        bar.classList.toggle('visible', shouldShow);
        document.body.classList.toggle('sticky-cta-active', shouldShow);
    }
}
