// ===================================
// TESTIMONIALS — Render + Swiper init
// ===================================
import { escapeHTML } from '../utils/sanitize.js';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';

export function renderTestimonials(testimonials) {
    const track = document.getElementById('testimonialsTrack');
    if (!track || !testimonials) return;

    track.innerHTML = testimonials.map(t => {
        const avatarHtml = t.avatar && t.avatar.startsWith('/')
            ? `<img src="${escapeHTML(t.avatar)}" alt="${escapeHTML(t.name)}" loading="lazy">`
            : escapeHTML(t.avatar || '👤');
        return `
    <div class="swiper-slide">
      <div class="testimonial-card">
        <div class="testimonial-inner">
          <div class="testimonial-stars">${'★'.repeat(parseInt(t.rating) || 0)}${'☆'.repeat(5 - (parseInt(t.rating) || 0))}</div>
          <p class="testimonial-quote">${escapeHTML(t.quote)}</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">${avatarHtml}</div>
            <div class="testimonial-info">
              <div class="testimonial-name">${escapeHTML(t.name)}, ${parseInt(t.age) || ''} tuổi</div>
              <div class="testimonial-location">${escapeHTML(t.location)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
    }).join('');
}

export function initTestimonialsSwiper() {
    const el = document.getElementById('testimonialsSwiper');
    if (!el) return;

    new Swiper(el, {
        modules: [Navigation, Pagination, Autoplay],
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        speed: 800,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        pagination: {
            el: '.testimonials-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        navigation: {
            prevEl: '.testimonials-prev',
            nextEl: '.testimonials-next',
        },
        breakpoints: {
            768: {
                slidesPerView: 1,
                spaceBetween: 32,
            }
        }
    });
}

export function initGallerySwiper() {
    const el = document.getElementById('gallerySwiper');
    if (!el) return;

    new Swiper(el, {
        modules: [Pagination, Autoplay, EffectCoverflow],
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        loop: true,
        speed: 700,
        coverflowEffect: {
            rotate: 0,
            stretch: 0,
            depth: 120,
            modifier: 2,
            slideShadows: false,
        },
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        pagination: {
            el: '.gallery-pagination',
            clickable: true,
            dynamicBullets: true,
        },
    });
}
