/* ============================================================
   SUPER PLAYER ARCADE — Events page carousel
   ============================================================
   Lightweight, dependency-free carousel:
   - auto-rotation (configurable via data-autoplay, defaults to 5s)
   - arrow + dot navigation share the same goTo() as auto-play
   - manual navigation cleanly resets the auto-play timer
   - pause on hover, resume when hover ends
   - pause when browser tab is hidden, resume on return
   - touch/swipe support on mobile
   ============================================================ */
(function () {
  'use strict';

  // Run after DOM is ready — but also handle the case where this
  // script is injected AFTER DOMContentLoaded has already fired.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else {
    initCarousel();
  }

  function initCarousel() {
    var carousel = document.querySelector('.event-carousel');
    if (!carousel) return;

    var track   = carousel.querySelector('.event-carousel-track');
    var slides  = carousel.querySelectorAll('.event-slide');
    var dots    = carousel.querySelectorAll('.carousel-dot');
    var prevBtn = carousel.querySelector('.carousel-arrow-prev');
    var nextBtn = carousel.querySelector('.carousel-arrow-next');
    var total   = slides.length;

    // Clamp autoplay to 4000–6000ms per the design spec,
    // allowing the HTML data-autoplay attribute to set within that range.
    var requested  = parseInt(carousel.getAttribute('data-autoplay'), 10);
    var autoplayMs = isNaN(requested) ? 5000 : Math.min(Math.max(requested, 3000), 8000);

    if (!track || total < 2) {
      if (slides[0]) slides[0].classList.add('is-active');
      return;
    }

    var currentIndex = 0;
    var autoTimer = null;
    var isHoverPaused = false;

    // --- Render the current slide ---
    function render() {
      track.style.transform = 'translateX(' + (-currentIndex * 100) + '%)';

      for (var i = 0; i < total; i++) {
        if (i === currentIndex) {
          slides[i].classList.add('is-active');
          slides[i].setAttribute('aria-hidden', 'false');
        } else {
          slides[i].classList.remove('is-active');
          slides[i].setAttribute('aria-hidden', 'true');
        }
      }

      for (var j = 0; j < dots.length; j++) {
        if (j === currentIndex) {
          dots[j].classList.add('active');
          dots[j].setAttribute('aria-selected', 'true');
        } else {
          dots[j].classList.remove('active');
          dots[j].setAttribute('aria-selected', 'false');
        }
      }
    }

    // --- Shared navigation — used by both auto-play and manual controls ---
    function goTo(i) {
      currentIndex = ((i % total) + total) % total;
      render();
    }
    function nextSlide() { goTo(currentIndex + 1); }
    function prevSlide() { goTo(currentIndex - 1); }

    // --- Auto-play control ---
    function stopAuto() {
      if (autoTimer !== null) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function startAuto() {
      stopAuto();                 // Always clear before starting a new interval.
      if (isHoverPaused) return;  // Respect current hover state.
      autoTimer = setInterval(nextSlide, autoplayMs);
    }

    // Manual nav helper — advances, then restarts the timer
    // so the next auto-advance is a full interval away.
    function manualGo(fn) {
      fn();
      startAuto();
    }

    // --- Arrow buttons ---
    if (prevBtn) {
      prevBtn.addEventListener('click', function () { manualGo(prevSlide); });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () { manualGo(nextSlide); });
    }

    // --- Dot indicators ---
    for (var k = 0; k < dots.length; k++) {
      (function (idx) {
        dots[idx].addEventListener('click', function () {
          manualGo(function () { goTo(idx); });
        });
      })(k);
    }

    // --- Pause on hover, resume on leave ---
    carousel.addEventListener('mouseenter', function () {
      isHoverPaused = true;
      stopAuto();
    });
    carousel.addEventListener('mouseleave', function () {
      isHoverPaused = false;
      startAuto();
    });

    // --- Pause when tab is hidden (save cycles, avoid surprise jumps) ---
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAuto();
      } else if (!isHoverPaused) {
        startAuto();
      }
    });

    // --- Keyboard left/right when focus is within the carousel ---
    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); manualGo(prevSlide); }
      if (e.key === 'ArrowRight') { e.preventDefault(); manualGo(nextSlide); }
    });

    // --- Touch / swipe on mobile ---
    var touchStartX = 0;
    var touchStartY = 0;
    var touchStartTime = 0;
    var touchActive = false;

    carousel.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchStartTime = Date.now();
      touchActive = true;
      stopAuto();
    }, { passive: true });

    carousel.addEventListener('touchend', function (e) {
      if (!touchActive) return;
      touchActive = false;

      var t  = e.changedTouches[0];
      var dx = t.clientX - touchStartX;
      var dy = t.clientY - touchStartY;
      var dt = Date.now() - touchStartTime;

      // Horizontal swipe only — ignore taps and vertical scrolls.
      if (dt < 900 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) nextSlide();
        else        prevSlide();
      }

      // Always resume auto-play after a touch gesture.
      startAuto();
    }, { passive: true });

    carousel.addEventListener('touchcancel', function () {
      touchActive = false;
      startAuto();
    }, { passive: true });

    // --- Initialize ---
    render();
    startAuto();
  }
})();
