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