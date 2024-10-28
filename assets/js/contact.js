// Developed by SK
// Date: 2024.10.14
// Website: https://www.skrript.es
// Github: https://github.com/JuanSKr

/** DOCUMENTATION
 * Handles the submission of the contact form using AJAX.
 * Prevents the default form submission behavior, collects form data,
 * and sends it to Formspree for email processing. Displays success or error
 * messages based on the response from Formspree.
 *
 * @param {Event} event - The form submission event.
DOCUMENTATION */

document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const formMessages = document.getElementById('form-messages');

    fetch('https://formspree.io/f/xnnqqoqa', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            formMessages.innerHTML = "<div class='alert alert-success'>Message sent successfully.</div>";
            form.reset();
        } else {
            return response.json().then(data => {
                if (data.errors) {
                    formMessages.innerHTML = "<div class='alert alert-danger'>" + data.errors.map(error => error.message).join(", ") + "</div>";
                } else {
                    formMessages.innerHTML = "<div class='alert alert-danger'>An error has ocurred while trying to send the message.</div>";
                }
            });
        }
    })
    .catch(error => {
        formMessages.innerHTML = "<div class='alert alert-danger'>An error has ocurred while trying to send the message.</div>";
    });
});


/** DOCUMENTATION
 * This script is used to load the navbar template on every page of the website.
 */
    document.addEventListener("DOMContentLoaded", function() {
        fetch('./assets/templates/navbar.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('navbar-placeholder').innerHTML = data;
            })
            .catch(error => console.error('Error loading navbar:', error));
        });

/** DOCUMENTATION
 * This function checks if the current device is a mobile device.
 * It uses the user agent string to determine if the device is mobile.
 * If the current device is a mobile device, an alert is shown to the user
 * indicating that the website is not available for mobile devices.
 * The user is then redirected to an error page.
 */

function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

if (isMobileDevice()) {
    alert("La web aún no está disponible para móviles");
    window.location.href = "error.html";
}

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