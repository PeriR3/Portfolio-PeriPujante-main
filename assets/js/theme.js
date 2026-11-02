/** DOCUMENTATION
 * Light / dark mode. Loaded synchronously in <head> so the right colours are painted from the start.
 *
 * - Dark (plum) is the main version of the brand and the default.
 * - Light uses the lime background with the brand in plum.
 * - The button .theme-toggle switches between them and the choice is remembered.
 */

(function() {
    const KEY = 'peri-theme';
    const html = document.documentElement;
    const COLORS = { dark: '#2D0B4E', light: '#D7F36B' };

    function read() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }

    function save(theme) {
        try { localStorage.setItem(KEY, theme); } catch (e) {}
    }

    function apply(theme) {
        html.dataset.theme = theme;
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', COLORS[theme]);
        document.querySelectorAll('.theme-toggle').forEach(button => {
            const toLight = theme === 'dark';
            button.setAttribute('aria-pressed', String(theme === 'light'));
            button.setAttribute('aria-label', button.dataset[toLight ? 'labelLight' : 'labelDark']);
            button.title = button.getAttribute('aria-label');
        });
    }

    apply(read() === 'light' ? 'light' : 'dark');

    document.addEventListener('DOMContentLoaded', function() {
        apply(html.dataset.theme);
        document.querySelectorAll('.theme-toggle').forEach(button => {
            button.addEventListener('click', function() {
                const next = html.dataset.theme === 'light' ? 'dark' : 'light';
                save(next);
                apply(next);
            });
        });
    });
})();
