// Developed by SK
// Date: 2024.10.14
// Website: https://www.skrript.es
// Github: https://github.com/JuanSKr

/*  DOCUMENTATION
This script adds modal functionality to display full-size images when clicked.
All hover effects (blur + magnifying glass) are handled by CSS.
DOCUMENTATION */

document.addEventListener('DOMContentLoaded', function() {
    const images = [
        { class: 'pic1', fullSrc: '../assets/imgs/prueabimg.png' },
        { class: 'pic2', fullSrc: '../assets/imgs/Work-img-ashenjuan.png' },
        { class: 'pic3', fullSrc: '../assets/imgs/Work-img-barrio.png' },
        { class: 'pic4', fullSrc: '../assets/imgs/Work-img-cani.png' },
        { class: 'pic5', fullSrc: '../assets/imgs/Work-img-ganga.png' },
        { class: 'pic6', fullSrc: '../assets/imgs/Work-img-godos.png' },
        { class: 'pic7', fullSrc: '../assets/imgs/Work-img-hidrata.png' },
        { class: 'pic8', fullSrc: '../assets/imgs/Work-img-iv.png' },
        { class: 'pic9', fullSrc: '../assets/imgs/Work-img-montania.png' },
        { class: 'pic10', fullSrc: '../assets/imgs/ATERRIZANDO.jpg' },
        { class: 'pic11', fullSrc: '../assets/imgs/BLOGIM BANNER.jpg' },
        { class: 'pic12', fullSrc: '../assets/imgs/COMANDANDOPORTADA.jpg' },
        { class: 'pic13', fullSrc: '../assets/imgs/CUANTOPORTADA.jpg' },
        { class: 'pic14', fullSrc: '../assets/imgs/DEMIPARAMIv2.jpg' },
        { class: 'pic15', fullSrc: '../assets/imgs/DOB BANNER.jpg' },
        { class: 'pic16', fullSrc: '../assets/imgs/logojxseda.jpg' },
        { class: 'pic17', fullSrc: '../assets/imgs/noeresespecial.jpg' },
        { class: 'pic18', fullSrc: '../assets/imgs/nohesi.jpg' },
        { class: 'pic19', fullSrc: '../assets/imgs/Nosequedarme2.jpg' },
        { class: 'pic20', fullSrc: '../assets/imgs/Portada MRory.jpg' },
        { class: 'pic21', fullSrc: '../assets/imgs/Portada2.jpg' },
        { class: 'pic22', fullSrc: '../assets/imgs/PORTADABLACKLIST2.jpg' },
        { class: 'pic23', fullSrc: '../assets/imgs/smash.jpg' },
        { class: 'pic24', fullSrc: '../assets/imgs/Unsimplejuego2.jpg' },
        { class: 'pic25', fullSrc: '../assets/imgs/valkyrie.jpg' },
        { class: 'pic26', fullSrc: '../assets/imgs/zeskatneko.jpg' },
        { class: 'pic27', fullSrc: '../assets/imgs/Ç.jpg' },
        { class: 'pic28', fullSrc: '../assets/imgs/prueabimg.png' }
    ];

    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeModal = document.getElementById('closeModal');

    function closeModalFunction() {
        modal.style.display = 'none';
    }

    function addClickEffect(imageClass, fullSrc) {
        const image = document.querySelector(`.${imageClass}`);
        if (image) {
            const container = image.closest('.work-img-container');
            if (container) {
                container.addEventListener('click', function() {
                    modal.style.display = 'flex';
                    modalImage.src = fullSrc;
                });
            }
        }
    }

    // Close modal events
    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunction);
    }

    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target !== modalImage && !modalImage.contains(event.target)) {
                closeModalFunction();
            }
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModalFunction();
        }
    });

    // Add click functionality to all images
    images.forEach(image => addClickEffect(image.class, image.fullSrc));
});

/** DOCUMENTATION
 * Mobile device detection and redirect
 */
function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

if (isMobileDevice()) {
    alert("La web aún no está disponible para móviles");
    window.location.href = "../error.html";
}
