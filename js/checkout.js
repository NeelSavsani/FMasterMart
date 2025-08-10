// ------- Step navigation -------
const shippingForm = document.querySelector('.shipping-form form');
const paymentSection = document.querySelector('.payment-section');
const stepIndicators = document.querySelectorAll('.step');
const Indicators = document.querySelectorAll('.divider');
const backToShippingButton = document.getElementById('backToShipping');
const paymentFormEl = document.getElementById('paymentForm');
const confirmationSection = document.querySelector('.confirmation-section');

// Enable only the active payment method's inputs (so hidden required fields don't block submit)
function setActivePaymentSection(method) {
  document.querySelectorAll('.payment-details').forEach(section => {
    const active = section.id === `${method}-details`;
    section.style.display = active ? 'block' : 'none';

    section.querySelectorAll('input, select, textarea').forEach(inp => {
      if (active) {
        inp.disabled = false;
        if (inp.dataset.wasRequired === 'true') inp.required = true;
        delete inp.dataset.wasRequired;
      } else {
        if (inp.required) inp.dataset.wasRequired = 'true';
        inp.required = false;
        inp.disabled = true;
      }
    });
  });
}

function syncPaymentDetails() {
  const checked = document.querySelector('input[name="payment-method"]:checked');
  if (checked) setActivePaymentSection(checked.value);
}

// Move to Payment
shippingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  document.querySelector('.shipping-form').style.display = 'none';
  if (paymentSection) paymentSection.style.display = 'block';

  stepIndicators[1].classList.add('active');
  Indicators[0].classList.add('active');

  syncPaymentDetails();
});

// Back to Shipping
if (backToShippingButton) {
  backToShippingButton.addEventListener('click', () => {
    document.querySelector('.shipping-form').style.display = 'block';
    if (paymentSection) paymentSection.style.display = 'none';

    stepIndicators[0].classList.add('active');
    stepIndicators[1].classList.remove('active');
    Indicators[0].classList.remove('active');
  });
}

// Toggle payment method
document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
  radio.addEventListener('change', syncPaymentDetails);
});

// ------- Card number mask (#### - #### - #### - ####) -------
document.addEventListener('DOMContentLoaded', () => {
  syncPaymentDetails(); // set initial enabled/disabled state

  const card = document.getElementById('cardNumber');
  const expiryField = document.getElementById('expiry');
  if (!card) return;

  const MAX_DIGITS = 16;
  const SEP = ' - ';
  const digitsOnly = s => s.replace(/\D/g, '');
  const group4 = s => (s.match(/.{1,4}/g) || []).join(SEP);

  function setCaretForDigitIndex(input, digitIdx) {
    let pos = 0, count = 0, v = input.value;
    while (pos < v.length && count < digitIdx) {
      if (/\d/.test(v[pos])) count++;
      pos++;
    }
    input.setSelectionRange(pos, pos);
  }

  function formatCardPreserveCaret(e) {
    const caret = card.selectionStart ?? 0;
    const digitsLeft = digitsOnly(card.value.slice(0, caret)).length;

    const allDigits = digitsOnly(card.value).slice(0, MAX_DIGITS);
    card.value = group4(allDigits);

    setCaretForDigitIndex(card, digitsLeft);

    // Auto-focus expiry when the 16th digit is typed and caret is at end
    const isInsert = !e || (e.inputType && !e.inputType.startsWith('delete'));
    const caretAtEnd = digitsLeft === allDigits.length;
    if (expiryField && isInsert && allDigits.length === MAX_DIGITS && caretAtEnd) {
      expiryField.focus();
      const end = expiryField.value.length;
      try { expiryField.setSelectionRange(end, end); } catch {}
    }
  }

  card.addEventListener('input', (e) => formatCardPreserveCaret(e));

  // Smart backspace over separators
  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Backspace') return;

    const selStart = card.selectionStart ?? 0;
    const selEnd = card.selectionEnd ?? 0;
    if (selStart !== selEnd) return;

    const v = card.value;
    const justAfterFullSep = selStart >= 3 && v.slice(selStart - 3, selStart) === ' - ';
    const justAfterHyphen   = selStart > 0 && v[selStart - 1] === '-';

    if (justAfterFullSep || justAfterHyphen) {
      e.preventDefault();
      const digitIdx = digitsOnly(v.slice(0, justAfterFullSep ? selStart - 3 : selStart - 1)).length;
      const total = digitsOnly(v);
      if (digitIdx > 0) {
        const newDigits = total.slice(0, digitIdx - 1) + total.slice(digitIdx);
        card.value = group4(newDigits);
        setCaretForDigitIndex(card, digitIdx - 1);
      } else {
        const newPos = Math.max(0, selStart - 1);
        card.setSelectionRange(newPos, newPos);
      }
    }
  });

  // Block non-digits
  card.addEventListener('keypress', (e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); });
});

// ------- Expiry mask (MM / YY) → focus CVV -------
(function setupExpiryMask() {
  const expiry = document.getElementById('expiry');
  if (!expiry) return;

  const SEP = ' / ';
  const MAX_DIGITS = 4;
  const digitsOnly = s => s.replace(/\D/g, '');
  const formatExpiry = s => {
    const mm = s.slice(0, 2);
    const yy = s.slice(2, 4);
    return s.length > 2 ? mm + SEP + yy : mm;
  };

  function setCaretForDigitIndex(input, digitIdx) {
    let pos = 0, count = 0, v = input.value;
    while (pos < v.length && count < digitIdx) {
      if (/\d/.test(v[pos])) count++;
      pos++;
    }
    input.setSelectionRange(pos, pos);
  }

  function formatPreserveCaret() {
    const caret = expiry.selectionStart ?? 0;
    const digitsLeft = digitsOnly(expiry.value.slice(0, caret)).length;
    const all = digitsOnly(expiry.value).slice(0, MAX_DIGITS);
    expiry.value = formatExpiry(all);
    setCaretForDigitIndex(expiry, digitsLeft);

    if (all.length === MAX_DIGITS) {
      const next = document.getElementById('cvv') || expiry.closest('form')?.querySelector('input[placeholder="CVV"]');
      if (next) next.focus();
    }
  }

  expiry.addEventListener('input', formatPreserveCaret);

  // Smart backspace over " / "
  expiry.addEventListener('keydown', (e) => {
    if (e.key !== 'Backspace') return;
    const selStart = expiry.selectionStart ?? 0;
    const selEnd = expiry.selectionEnd ?? 0;
    if (selStart !== selEnd) return;

    const v = expiry.value;
    const afterFullSep = selStart >= 3 && v.slice(selStart - 3, selStart) === ' / ';
    const afterSlash = selStart > 0 && v[selStart - 1] === '/';

    if (afterFullSep || afterSlash) {
      e.preventDefault();
      const digitIdx = digitsOnly(v.slice(0, afterFullSep ? selStart - 3 : selStart - 1)).length;
      const all = digitsOnly(v);
      if (digitIdx > 0) {
        const newDigits = all.slice(0, digitIdx - 1) + all.slice(digitIdx);
        expiry.value = formatExpiry(newDigits);
        setCaretForDigitIndex(expiry, digitIdx - 1);
      }
    }
  });

  // Block non-digits & > 4 digits when not replacing selection
  expiry.addEventListener('keypress', (e) => {
    if (!/[0-9]/.test(e.key)) return e.preventDefault();
    const selection = (expiry.selectionEnd ?? 0) - (expiry.selectionStart ?? 0);
    const currentDigits = digitsOnly(expiry.value).length;
    if (selection === 0 && currentDigits >= MAX_DIGITS) e.preventDefault();
  });

  // Validate on blur
  expiry.addEventListener('blur', () => {
    const raw = digitsOnly(expiry.value);
    if (raw.length !== 4) { expiry.value = ''; return; }
    const mm = +raw.slice(0, 2);
    const yy = raw.slice(2, 4);
    if (mm < 1 || mm > 12) { expiry.value = ''; return; }
    expiry.value = raw.slice(0, 2) + ' / ' + yy;
  });
})();

// ------- CVV (3 digits) → focus Name on Card -------
(() => {
  const cvv = document.getElementById('cvv');
  const nameOnCard = document.getElementById('cardName') ||
                     document.querySelector('input[placeholder="Name on Card"]');
  if (!cvv || !nameOnCard) return;

  const digitsOnly = s => s.replace(/\D/g, '');

  cvv.addEventListener('input', (e) => {
    const atEndBefore = cvv.selectionStart === cvv.value.length && cvv.selectionEnd === cvv.value.length;
    let v = digitsOnly(cvv.value).slice(0, 3);
    cvv.value = v;
    if (atEndBefore) {
      const end = cvv.value.length;
      try { cvv.setSelectionRange(end, end); } catch {}
    }

    const isInsert = !e.inputType || !e.inputType.startsWith('delete');
    if (isInsert && v.length === 3 && atEndBefore) {
      requestAnimationFrame(() => {
        nameOnCard.focus();
        const end = nameOnCard.value.length;
        try { nameOnCard.setSelectionRange(end, end); } catch {}
      });
    }
  });

  cvv.addEventListener('keypress', (e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); });
})();

// ------- Confirmation on Place Order -------
if (paymentFormEl && confirmationSection) {
  paymentFormEl.addEventListener('submit', (e) => {
    e.preventDefault();

    paymentSection.style.display = 'none';
    confirmationSection.style.display = 'block';

    stepIndicators[2]?.classList.add('active');
    Indicators[1]?.classList.add('active');

    const idEl = document.getElementById('orderId');
    if (idEl) idEl.textContent = 'ORD-' + Date.now();

    document.getElementById('continueShoppingBtn')?.addEventListener('click', () => {
      if (typeof gotoHome === 'function') gotoHome();
    });
    document.getElementById('trackOrderBtn')?.addEventListener('click', () => {
      alert('Tracking coming soon!');
    });
  });
}
