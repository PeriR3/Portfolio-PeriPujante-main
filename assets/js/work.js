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