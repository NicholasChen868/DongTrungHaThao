// ===================================
// FLOATING BUTTONS — Order button + Contact widget
// ===================================
import { supabase } from '../supabase.js';

export function initFloatingOrderBtn() {
    const btn = document.getElementById('floatingOrderBtn');
    const contactSection = document.getElementById('contact');
    if (!btn || !contactSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            btn.classList.toggle('hidden', entry.isIntersecting);
        });
    }, { threshold: 0.1 });

    observer.observe(contactSection);

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        contactSection.scrollIntoView({ behavior: 'smooth' });
    });
}

export function initContactWidget() {
    const widget = document.getElementById('contactWidget');
    const toggle = document.getElementById('cwToggle');
    if (!widget || !toggle) return;

    toggle.addEventListener('click', () => {
        widget.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!widget.contains(e.target) && widget.classList.contains('open')) {
            widget.classList.remove('open');
        }
    });

    loadContactLinks();

    const ctvFloat = document.getElementById('ctvFloatHome');
    if (ctvFloat) {
        window.addEventListener('scroll', () => {
            ctvFloat.classList.toggle('collapsed', window.scrollY > 300);
        }, { passive: true });
    }
}

async function loadContactLinks() {
    try {
        const { data, error } = await supabase.rpc('get_contact_info');
        if (error || !data) return;

        const cwCall = document.getElementById('cwCall');
        const cwZalo = document.getElementById('cwZalo');
        const cwMessenger = document.getElementById('cwMessenger');

        if (cwCall && data.phone) {
            cwCall.href = `tel:${data.phone.replace(/\s/g, '')}`;
        }

        if (cwZalo && data.zalo) {
            cwZalo.href = data.zalo.startsWith('http') ? data.zalo : `https://zalo.me/${data.zalo}`;
        }

        if (cwMessenger && data.messenger) {
            cwMessenger.href = data.messenger;
            cwMessenger.style.display = '';
        } else if (cwMessenger) {
            cwMessenger.style.display = 'none';
        }
    } catch (e) {
        console.warn('⚠️ Could not load contact info:', e.message);
    }
}
