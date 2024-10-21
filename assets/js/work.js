// Developed by SK
// Date: 2024.10.14
// Website: https://www.skrript.es
// Github: https://github.com/JuanSKr

/* DOCUMENTATION
This script adds a hover effect to a set of images on a webpage. 
When the user hovers over an image, the image changes to a blurred version. 
When the mouse moves away from the image, it reverts to its original state.
DOCUMENTATION */

document.addEventListener('DOMContentLoaded', function() {
    const images = [
        { class: 'pic1', hoverSrc: 'assets/imgs/prueabimg-desenfoque.png' },
        { class: 'pic2', hoverSrc: 'assets/imgs/Work-img-ashenjuan-desenfoque.png' },
        { class: 'pic3', hoverSrc: 'assets/imgs/Work-img-barrio-desenfoque.png' },
        { class: 'pic4', hoverSrc: 'assets/imgs/Work-img-cani-desenfoque.png' },
        { class: 'pic5', hoverSrc: 'assets/imgs/Work-img-ganga-desenfoque.png' },
        { class: 'pic6', hoverSrc: 'assets/imgs/Work-img-godos-desenfoque.png' },
        { class: 'pic7', hoverSrc: 'assets/imgs/Work-img-hidrata-desenfoque.png' },
        { class: 'pic8', hoverSrc: 'assets/imgs/Work-img-iv-desenfoque.png' },
        { class: 'pic9', hoverSrc: 'assets/imgs/Work-img-montania-desenfoque.png' }
    ];

    function addHoverEffect(imageClass, hoverSrc) {
        const image = document.querySelector(`.${imageClass}`);

        image.addEventListener('mouseover', function() {
            this.dataset.originalSrc = this.src;
            this.src = hoverSrc;
        });

        image.addEventListener('mouseout', function() {
            this.src = this.dataset.originalSrc;
        });
    }

    images.forEach(image => addHoverEffect(image.class, image.hoverSrc));
});

/*  DOCUMENTATION
This script adds a modal to a webpage that displays a full-size version of an image when the user clicks on it.
The modal includes a close button that allows the user to close the modal.
The modal can also be closed by clicking outside of the modal or by pressing the escape key.
DOCUMENTATION */

document.addEventListener('DOMContentLoaded', function() {
    const images = [
        { class: 'pic1', hoverSrc: 'assets/imgs/prueabimg-desenfoque.png', fullSrc: 'assets/imgs/prueabimg.png' },
        { class: 'pic2', hoverSrc: 'assets/imgs/Work-img-ashenjuan-desenfoque.png', fullSrc: 'assets/imgs/Work-img-ashenjuan.png' },
        { class: 'pic3', hoverSrc: 'assets/imgs/Work-img-barrio-desenfoque.png', fullSrc: 'assets/imgs/Work-img-barrio.png' },
        { class: 'pic4', hoverSrc: 'assets/imgs/Work-img-cani-desenfoque.png', fullSrc: 'assets/imgs/Work-img-cani.png' },
        { class: 'pic5', hoverSrc: 'assets/imgs/Work-img-ganga-desenfoque.png', fullSrc: 'assets/imgs/Work-img-ganga.png' },
        { class: 'pic6', hoverSrc: 'assets/imgs/Work-img-godos-desenfoque.png', fullSrc: 'assets/imgs/Work-img-godos.png' },
        { class: 'pic7', hoverSrc: 'assets/imgs/Work-img-hidrata-desenfoque.png', fullSrc: 'assets/imgs/Work-img-hidrata.png' },
        { class: 'pic8', hoverSrc: 'assets/imgs/Work-img-iv-desenfoque.png', fullSrc: 'assets/imgs/Work-img-iv.png' },
        { class: 'pic9', hoverSrc: 'assets/imgs/Work-img-montania-desenfoque.png', fullSrc: 'assets/imgs/Work-img-montania.png' }
    ];

    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeModal = document.getElementById('closeModal');

    function closeModalFunction() {
        modal.style.display = 'none';
    }

    function addClickEffect(imageClass, fullSrc) {
        const image = document.querySelector(`.${imageClass}`);

        image.addEventListener('click', function() {
            modal.style.display = 'flex';
            modalImage.src = fullSrc;
        });
    }

    closeModal.addEventListener('click', closeModalFunction);

    modal.addEventListener('click', function(event) {
        if (event.target !== modalImage && !modalImage.contains(event.target)) {
            closeModalFunction();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModalFunction();
        }
    });

    images.forEach(image => addClickEffect(image.class, image.fullSrc));
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
// It checks if the current URL ends with 'home.html', 'contact.html', 'about.html', or 'work.html'
// If so, it uses history.pushState to change the URL to '/index', '/contact', '/about', or '/work' respectively

document.addEventListener('DOMContentLoaded', function() {
    // Change the URL without reloading the page
    if (window.location.pathname.endsWith('home.html')) {
        history.pushState({}, '', '/home');
    } else if (window.location.pathname.endsWith('contact.html')) {
        history.pushState({}, '', '/contact');
    } else if (window.location.pathname.endsWith('about.html')) {
        history.pushState({}, '', '/about');
    } else if (window.location.pathname.endsWith('work.html')) {
        history.pushState({}, '', '/work');
    }
});