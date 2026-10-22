// Developed by SK
// Date: 2026.10.22
// Website: https://www.skrript.es
// Github: https://github.com/JuanSKr

/** DOCUMENTATION
 * Language handling. Loaded synchronously in <head> so it can act before the page is painted.
 *
 * - Detection: if the visitor has not chosen a language yet, Spanish browsers get the Spanish
 *   version and every other language gets the English one. The counterpart of each page comes
 *   from its <link rel="alternate" hreflang="..."> tags.
 * - Preference: using the EN | ES switch stores the choice, so detection never overrides it.
 * - Smooth switch: a curtain covers the page, the other version loads and the curtain opens
 *   again. Scroll position and form values are carried over to the new page.
 *   Pages can carry extra state by listening to "peri:lang-save" / "peri:lang-restore".
 */

(function() {
    const PREF_KEY = 'peri-lang';
    const SWITCH_KEY = 'peri-lang-switch';
    const html = document.documentElement;
    const current = html.lang === 'es' ? 'es' : 'en';

    html.classList.add('js');

    function read(storage, key) {
        try { return storage.getItem(key); } catch (e) { return null; }
    }

    function write(storage, key, value) {
        try { storage.setItem(key, value); } catch (e) {}
    }

    function alternate(lang) {
        const link = document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]');
        return link ? link.href : null;
    }

    function browserLang() {
        const lang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
        return /^es\b/i.test(lang) ? 'es' : 'en';
    }

    // Automatic redirect to the visitor's language
    const wanted = read(localStorage, PREF_KEY) || browserLang();
    const target = wanted !== current && alternate(wanted);
    if (target && target.split('#')[0] !== location.href.split('#')[0]) {
        location.replace(target + location.hash);
        return;
    }

    // Coming from a language switch: keep the curtain closed until the page is ready
    let pending = null;
    try { pending = JSON.parse(read(sessionStorage, SWITCH_KEY)); } catch (e) {}
    if (pending) {
        html.classList.add('lang-enter');
        try { sessionStorage.removeItem(SWITCH_KEY); } catch (e) {}
    }

    function collectState() {
        const fields = {};
        document.querySelectorAll('main input[id], main select[id], main textarea[id]').forEach(el => {
            if (el.type !== 'file' && el.type !== 'password') fields[el.id] = el.value;
        });
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const state = { fields: fields, scroll: max > 0 ? window.scrollY / max : 0, extra: {} };
        document.dispatchEvent(new CustomEvent('peri:lang-save', { detail: state.extra }));
        return state;
    }

    function restoreState(state) {
        Object.keys(state.fields || {}).forEach(id => {
            const el = document.getElementById(id);
            if (!el || el.value === state.fields[id]) return;
            el.value = state.fields[id];
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        });
        document.dispatchEvent(new CustomEvent('peri:lang-restore', { detail: state.extra || {} }));

        const scrollTo = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            html.style.scrollBehavior = 'auto';
            window.scrollTo(0, Math.round((state.scroll || 0) * max));
            html.style.scrollBehavior = '';
        };
        scrollTo();
        window.addEventListener('load', scrollTo, { once: true });
    }

    document.addEventListener('DOMContentLoaded', function() {
        if (pending) {
            restoreState(pending);
            setTimeout(() => html.classList.remove('lang-enter'), 900);
        }

        document.querySelectorAll('.lang-switch').forEach(link => {
            link.addEventListener('click', function(event) {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                event.preventDefault();

                const lang = link.dataset.lang;
                write(localStorage, PREF_KEY, lang);
                write(sessionStorage, SWITCH_KEY, JSON.stringify(collectState()));

                const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                link.classList.add('is-switching');
                html.classList.add('lang-leave');
                setTimeout(() => { location.href = link.href; }, reduceMotion ? 0 : 480);
            });
        });
    });

    // Back/forward cache: never come back to a covered page
    window.addEventListener('pageshow', function(event) {
        if (!event.persisted) return;
        html.classList.remove('lang-leave', 'lang-enter');
        document.querySelectorAll('.lang-switch.is-switching').forEach(el => el.classList.remove('is-switching'));
    });
})();
