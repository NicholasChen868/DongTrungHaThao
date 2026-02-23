// Scroll reveal animations for cau-chuyen.html

// Mark body as JS-ready so animations are only applied when JS loads
document.body.classList.add('js-ready');

// Reading progress bar
window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min((window.scrollY / docH) * 100, 100);
    const bar = document.getElementById('readingProgress');
    if (bar) bar.style.width = pct + '%';
});

// Chapter inner stagger animation
const chapterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('animate');
            chapterObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.chapter-inner').forEach(el => chapterObserver.observe(el));

// Generic reveal (pull-quotes, testimonials, etc.)
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Pull stat reveal (legacy support)
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            statObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.pull-stat').forEach(el => statObserver.observe(el));
