/* ============================================================
   SUPER PLAYER ARCADE — Main JavaScript
   Handles: scroll animations, navbar behavior, mobile menu
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- NAVBAR SCROLL BEHAVIOR ---
  const navbar = document.querySelector('.navbar');
  const scrollThreshold = 60;

  function handleNavbarScroll() {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // Run on load


  // --- MOBILE MENU ---
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    mobileMenuClose.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });

    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  // --- SCROLL FADE-IN ANIMATIONS ---
  const fadeElements = document.querySelectorAll('.fade-in');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => fadeObserver.observe(el));


  // --- SMOOTH SCROLL FOR ANCHOR LINKS ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  // --- GRAND OPENING POPUP ---
  // Shows once per browser session. Uses sessionStorage so it doesn't
  // reappear on back-navigation within the same session.
  // Does not conflict with the mobile menu — each guards its own overflow reset.
  const goOverlay = document.getElementById('goPopupOverlay');
  const goClose   = document.getElementById('goPopupClose');

  if (goOverlay && goClose && !sessionStorage.getItem('grandOpeningPopupClosed')) {

    // Reveal the modal
    goOverlay.setAttribute('aria-hidden', 'false');
    goOverlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';

    // Move focus to the close button for keyboard / screen-reader users
    goClose.focus();

    const closePopup = () => {
      goOverlay.classList.remove('is-visible');
      goOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      sessionStorage.setItem('grandOpeningPopupClosed', '1');
      document.removeEventListener('keydown', onKeyDown);
    };

    // Close button click
    goClose.addEventListener('click', closePopup);

    // Click on the dim overlay (not inside the card) to close
    goOverlay.addEventListener('click', (e) => {
      if (e.target === goOverlay) closePopup();
    });

    // ESC key to close
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closePopup();
    };
    document.addEventListener('keydown', onKeyDown);
  }

});
