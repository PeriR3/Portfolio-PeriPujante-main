// Developed by SK
// Date: 2024.10.14
// Website: https://www.skrript.es
// Github: https://github.com/JuanSKr

/** DOCUMENTATION
 * Handles the submission of the contact form using AJAX.
 * Prevents the default form submission behavior, collects form data,
 * and sends it to Formspree for email processing. Displays success or error
 * messages (in the page language) based on the response from Formspree.
 *
 * @param {Event} event - The form submission event.
DOCUMENTATION */

const CONTACT_TEXT = document.documentElement.lang === 'es'
    ? { sending: 'Enviando…', ok: 'Mensaje enviado correctamente.', error: 'Ha ocurrido un error al intentar enviar el mensaje.' }
    : { sending: 'Sending…', ok: 'Message sent successfully.', error: 'An error has occurred while trying to send the message.' };

document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const formMessages = document.getElementById('form-messages');
    const button = form.querySelector('button[type="submit"]');
    const buttonText = button.textContent;

    function showMessage(type, text) {
        formMessages.innerHTML = '';
        const alert = document.createElement('div');
        alert.className = 'alert alert-' + type;
        alert.textContent = text;
        formMessages.appendChild(alert);
    }

    button.disabled = true;
    button.textContent = CONTACT_TEXT.sending;

    fetch('https://formspree.io/f/xnnqqoqa', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            showMessage('success', CONTACT_TEXT.ok);
            form.reset();
        } else {
            return response.json().then(data => {
                if (data.errors) {
                    showMessage('danger', data.errors.map(error => error.message).join(', '));
                } else {
                    showMessage('danger', CONTACT_TEXT.error);
                }
            });
        }
    })
    .catch(() => {
        showMessage('danger', CONTACT_TEXT.error);
    })
    .finally(() => {
        button.disabled = false;
        button.textContent = buttonText;
    });
});
