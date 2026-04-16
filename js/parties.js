/* ============================================================
   SUPER PLAYER ARCADE — Parties Page JS
   Handles: form validation, success state, UX polish
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('partyRequestForm');
  if (!form) return;

  const formCard = form.closest('.party-form-card') || form.parentElement;

  // --- SET MINIMUM DATE TO TOMORROW ---
  const dateInput = document.getElementById('f-date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
  }


  // --- REAL-TIME FIELD VALIDATION ---
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(field);
    });
  });

  function validateField(field) {
    const wrapper = field.closest('.form-field');
    let errorMsg = wrapper ? wrapper.querySelector('.field-error-msg') : null;

    // Create error element if missing
    if (!errorMsg && wrapper) {
      errorMsg = document.createElement('span');
      errorMsg.className = 'field-error-msg';
      wrapper.appendChild(errorMsg);
    }

    const isEmpty = field.value.trim() === '' || (field.tagName === 'SELECT' && field.value === '');

    if (isEmpty) {
      field.classList.add('error');
      if (errorMsg) {
        errorMsg.textContent = getErrorText(field);
        errorMsg.classList.add('visible');
      }
      return false;
    } else {
      field.classList.remove('error');
      if (errorMsg) errorMsg.classList.remove('visible');
      return true;
    }
  }

  function getErrorText(field) {
    const id = field.id;
    const msgs = {
      'f-name':   'Please enter your name.',
      'f-email':  'Please enter a valid email address.',
      'f-phone':  'Please enter a phone number so we can reach you.',
      'f-date':   'Please choose a date for your party.',
      'f-guests': 'Please let us know how many guests.',
    };
    return msgs[id] || 'This field is required.';
  }


  // --- FORM SUBMIT ---
  form.addEventListener('submit', (e) => {

    // Validate all required fields first
    let allValid = true;
    requiredFields.forEach(field => {
      if (!validateField(field)) allValid = false;
    });

    if (!allValid) {
      // Block submission and scroll to first error
      e.preventDefault();
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Validation passed — update button state and let the form POST to Formspree
    const submitBtn = form.querySelector('.form-submit-btn');
    if (submitBtn) {
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
    }
    // Form submits natively to action="https://formspree.io/f/mreovepp"
  });


  // --- PACKAGE PRE-SELECT from URL hash ---
  // e.g. parties.html#package=party-pack pre-selects that package
  const hash = window.location.hash;
  if (hash) {
    const match = hash.match(/package=([^&]+)/);
    if (match) {
      const pkgSelect = document.getElementById('f-package');
      if (pkgSelect) pkgSelect.value = decodeURIComponent(match[1]);
    }
  }


  // --- PACKAGE CARD CTA — inject package into form ---
  document.querySelectorAll('.pkg-cta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Find which package this button belongs to
      const card = btn.closest('.package-card');
      const label = card ? card.querySelector('.package-label') : null;
      if (!label) return;

      const labelText = label.textContent.trim().toLowerCase();
      const pkgMap = {
        'party package':       'party-package',
        'arcade + craft party': 'arcade-craft-party',
        'gold package':        'gold-package',
      };

      const pkgValue = pkgMap[labelText];
      const pkgSelect = document.getElementById('f-package');
      if (pkgSelect && pkgValue) {
        pkgSelect.value = pkgValue;
      }
      // Let the anchor href scroll to form
    });
  });

});
