// Developed by SK
// Date: 2026.10.22
// Website: https://www.skrript.es
// Github: https://github.com/JuanSKr

/** DOCUMENTATION
 * Shared behaviour for every page:
 * - Mobile menu (hamburger) open / close.
 * - Age in "About", calculated from the birth date.
 * - Navbar shadow once the page is scrolled.
 * - Reveal-on-scroll animation for elements with the .reveal class.
 * - Fade-out transition when navigating to another page of the site.
 */

document.addEventListener('DOMContentLoaded', function() {
    const html = document.documentElement;
    const navbar = document.querySelector('.navbar');
    const toggle = document.querySelector('.nav-toggle');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Mobile menu
    function setMenu(open) {
        if (!navbar || !toggle) return;
        navbar.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        html.classList.toggle('no-scroll', open);
    }

    if (navbar && toggle) {
        toggle.addEventListener('click', () => setMenu(!navbar.classList.contains('is-open')));

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navbar.classList.contains('is-open')) {
                setMenu(false);
                toggle.focus();
            }
        });

        window.matchMedia('(min-width: 992px)').addEventListener('change', function(event) {
            if (event.matches) setMenu(false);
        });
    }

    // Age from the birth date (data-birth="YYYY-MM-DD"): it goes up by one every birthday
    document.querySelectorAll('[data-birth]').forEach(el => {
        const [year, month, day] = el.dataset.birth.split('-').map(Number);
        const today = new Date();
        const beforeBirthday = today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day);
        el.textContent = today.getFullYear() - year - (beforeBirthday ? 1 : 0);
    });

    // Navbar shadow
    function onScroll() {
        if (navbar) navbar.classList.toggle('is-scrolled', window.scrollY > 10);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Reveal on scroll
    const revealItems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        revealItems.forEach(el => observer.observe(el));
    } else {
        revealItems.forEach(el => el.classList.add('is-visible'));
    }

    // Page leave transition (language switch has its own, see lang.js)
    document.addEventListener('click', function(event) {
        const link = event.target.closest('a');
        if (!link || event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.target === '_blank' || link.hasAttribute('download') || link.classList.contains('lang-switch')) return;

        const url = new URL(link.href, location.href);
        if (url.origin !== location.origin || /\.(pdf|png|jpe?g|mp3)$/i.test(url.pathname)) return;
        if (url.pathname === location.pathname) return;

        event.preventDefault();
        setMenu(false);
        document.body.classList.add('is-leaving');
        setTimeout(() => { location.href = url.href; }, reduceMotion.matches ? 0 : 260);
    });

    window.addEventListener('pageshow', function(event) {
        if (event.persisted) document.body.classList.remove('is-leaving');
    });
});
