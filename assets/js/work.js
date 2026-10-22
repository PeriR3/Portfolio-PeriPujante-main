// Developed by SK
// Date: 2024.10.14
// Website: https://www.skrript.es
// Github: https://github.com/JuanSKr

/*  DOCUMENTATION
Lightbox for the work gallery (used by work.html and es/work_es.html).
The clicked image zooms out of its thumbnail, you can move between images with the
arrows, the keyboard (← →) or swiping, and closing shrinks it back into its thumbnail.
All hover effects (blur + magnifying glass) are handled by CSS.
DOCUMENTATION */

document.addEventListener('DOMContentLoaded', function() {
    const items = Array.from(document.querySelectorAll('.work-img-container'));
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeModal = document.getElementById('closeModal');
    const prevButton = document.getElementById('prevImage');
    const nextButton = document.getElementById('nextImage');
    const counter = document.getElementById('modalCounter');
    const main = document.querySelector('main');
    if (!modal || !modalImage || !items.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const EASE = 'cubic-bezier(.2, .8, .2, 1)';
    let current = -1;
    let busy = false;

    function thumb(index) {
        return items[index].querySelector('img');
    }

    // Transform that places the big image over the thumbnail
    function thumbTransform(index) {
        const from = thumb(index).getBoundingClientRect();
        const to = modalImage.getBoundingClientRect();
        if (!to.width || !to.height) return 'scale(.8)';
        const scale = Math.max(from.width / to.width, from.height / to.height);
        const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
        const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
        return `translate(${dx}px, ${dy}px) scale(${scale})`;
    }

    function animate(keyframes, options) {
        if (reduceMotion.matches) return Promise.resolve();
        return modalImage.animate(keyframes, Object.assign({ easing: EASE }, options)).finished;
    }

    function load(index) {
        const img = thumb(index);
        modalImage.src = img.currentSrc || img.src;
        modalImage.alt = img.alt;
        counter.textContent = (index + 1) + ' / ' + items.length;
        return modalImage.decode ? modalImage.decode().catch(() => {}) : Promise.resolve();
    }

    async function openModal(index) {
        if (busy || current >= 0) return;
        busy = true;
        try {
            current = index;
            await load(index);
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.documentElement.classList.add('no-scroll');
            if (main) main.inert = true;
            await animate([
                { transform: thumbTransform(index), opacity: .5, borderRadius: '20px' },
                { transform: 'none', opacity: 1 }
            ], { duration: 480 });
            closeModal.focus({ preventScroll: true });
        } finally {
            busy = false;
        }
    }

    async function closeModalFunction() {
        if (busy || current < 0) return;
        busy = true;
        try {
            modal.classList.remove('is-open');
            await animate([
                { transform: 'none', opacity: 1 },
                { transform: thumbTransform(current), opacity: 0 }
            ], { duration: 340, fill: 'forwards' });
            modalImage.getAnimations().forEach(animation => animation.cancel());
            modal.setAttribute('aria-hidden', 'true');
            document.documentElement.classList.remove('no-scroll');
            if (main) main.inert = false;
            items[current].focus({ preventScroll: true });
            current = -1;
        } finally {
            busy = false;
        }
    }

    async function step(direction) {
        if (busy || current < 0) return;
        busy = true;
        try {
            await animate([
                { transform: 'none', opacity: 1 },
                { transform: `translateX(${-direction * 60}px)`, opacity: 0 }
            ], { duration: 180, easing: 'ease-in', fill: 'forwards' });
            current = (current + direction + items.length) % items.length;
            await load(current);
            // Keep the thumbnail on screen so closing flies back to the right place
            document.documentElement.style.scrollBehavior = 'auto';
            items[current].scrollIntoView({ block: 'center' });
            document.documentElement.style.scrollBehavior = '';
            modalImage.getAnimations().forEach(animation => animation.cancel());
            await animate([
                { transform: `translateX(${direction * 60}px)`, opacity: 0 },
                { transform: 'none', opacity: 1 }
            ], { duration: 280 });
        } finally {
            busy = false;
        }
    }

    items.forEach((item, index) => item.addEventListener('click', () => openModal(index)));
    closeModal.addEventListener('click', closeModalFunction);
    prevButton.addEventListener('click', () => step(-1));
    nextButton.addEventListener('click', () => step(1));

    modal.addEventListener('click', function(event) {
        if (event.target === modal) closeModalFunction();
    });

    document.addEventListener('keydown', function(event) {
        if (current < 0) return;
        if (event.key === 'Escape') closeModalFunction();
        if (event.key === 'ArrowLeft') step(-1);
        if (event.key === 'ArrowRight') step(1);
    });

    // Swipe: left / right to change image, down to close
    let touchStart = null;
    modal.addEventListener('touchstart', function(event) {
        touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });

    modal.addEventListener('touchend', function(event) {
        if (!touchStart) return;
        const dx = event.changedTouches[0].clientX - touchStart.x;
        const dy = event.changedTouches[0].clientY - touchStart.y;
        touchStart = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeModalFunction();
    }, { passive: true });
});
