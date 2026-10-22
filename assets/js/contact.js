// Developed by SK
// Date: 2024.10.14
// Website: https://www.skrript.es
// Github: https://github.com/JuanSKr

/** DOCUMENTATION
 * Handles the submission of the contact form using AJAX.
 * Prevents the default form submission behavior, collects form data,
 * and sends it to Formspree for email processing. Displays success or error
 * messages (in the page language) based on the response from Formspree.
 * The send button shows "sending" and "sent" states.
 *
 * Also copies the e-mail address to the clipboard from the "Copy" button.
 *
 * @param {Event} event - The form submission event.
DOCUMENTATION */

const CONTACT_TEXT = document.documentElement.lang === 'es'
    ? { sending: 'Enviando…', sent: '¡Enviado!', ok: 'Mensaje enviado correctamente. Te responderé lo antes posible.', error: 'Ha ocurrido un error al intentar enviar el mensaje.' }
    : { sending: 'Sending…', sent: 'Sent!', ok: 'Message sent successfully. I will get back to you as soon as possible.', error: 'An error has occurred while trying to send the message.' };

document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const formMessages = document.getElementById('form-messages');
    const button = form.querySelector('button[type="submit"]');
    const label = button.querySelector('span');
    const buttonText = label.textContent;

    function showMessage(type, text) {
        formMessages.innerHTML = '';
        const alert = document.createElement('div');
        alert.className = 'alert alert-' + type;
        alert.textContent = text;
        formMessages.appendChild(alert);
    }

    function setState(state, text) {
        button.classList.remove('is-sending', 'is-sent');
        if (state) button.classList.add(state);
        button.disabled = state === 'is-sending';
        label.textContent = text;
    }

    setState('is-sending', CONTACT_TEXT.sending);

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
            setState('is-sent', CONTACT_TEXT.sent);
            setTimeout(() => setState(null, buttonText), 3000);
        } else {
            setState(null, buttonText);
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
        setState(null, buttonText);
        showMessage('danger', CONTACT_TEXT.error);
    });
});

// Copy the e-mail address
document.querySelectorAll('[data-copy]').forEach(button => {
    const text = button.textContent;
    button.addEventListener('click', function() {
        if (!navigator.clipboard) {
            window.location.href = 'mailto:' + button.dataset.copy;
            return;
        }
        navigator.clipboard.writeText(button.dataset.copy).then(() => {
            button.textContent = button.dataset.copied;
            button.classList.add('is-copied');
            setTimeout(() => {
                button.textContent = text;
                button.classList.remove('is-copied');
            }, 1800);
        });
    });
});
