// This script changes the URL in the browser's address bar without reloading the page
// It uses the DOMContentLoaded event to ensure the DOM is fully loaded
// It checks if the current URL ends with 'index.html', 'contact.html', 'about.html', or 'work.html'
// If so, it uses history.pushState to change the URL to '/index', '/contact', '/about', or '/work' respectively

document.addEventListener('DOMContentLoaded', function() {
    // Change the URL without reloading the page
    if (window.location.pathname.endsWith('index.html')) {
        history.pushState({}, '', '/home');
    } else if (window.location.pathname.endsWith('contact.html')) {
        history.pushState({}, '', '/contact');
    } else if (window.location.pathname.endsWith('about.html')) {
        history.pushState({}, '', '/about');
    } else if (window.location.pathname.endsWith('work.html')) {
        history.pushState({}, '', '/work');
    } else if (window.location.pathname.endsWith('news.html')) {
        history.pushState({}, '', '/news');
    }
});