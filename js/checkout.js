const shippingForm = document.querySelector('.shipping-form form');
const paymentSection = document.querySelector('.payment-section');
const stepIndicators = document.querySelectorAll('.step');
const Indicators = document.querySelectorAll('.divider');
const backToShippingButton = document.getElementById('backToShipping');

// Move to payment step
shippingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    document.querySelector('.shipping-form').style.display = 'none';
    if (paymentSection) paymentSection.style.display = 'block';

    // Update step UI
    // stepIndicators[0].classList.remove('active');
    stepIndicators[1].classList.add('active');
    Indicators[0].classList.add('active');
    syncPaymentDetails();
});

// Back to shipping step
backToShippingButton.addEventListener('click', function () {
    document.querySelector('.shipping-form').style.display = 'block';
    if (paymentSection) paymentSection.style.display = 'none';

    // Update step UI
    stepIndicators[0].classList.add('active');
    stepIndicators[1].classList.remove('active');
    Indicators[0].classList.remove('active');
});

// Payment method toggle logic (optional)
document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
    radio.addEventListener('change', function () {
        document.querySelectorAll('.payment-details').forEach(el => {
            el.style.display = 'none';
        });
        const selected = document.getElementById(this.value + '-details');
        if (selected) selected.style.display = 'block';
        syncPaymentDetails();
    });
});

function syncPaymentDetails() {
// Hide all detail blocks
document.querySelectorAll('.payment-details').forEach(el => el.style.display = 'none');

// Show the block matching the checked radio
const checked = document.querySelector('input[name="payment-method"]:checked');
if (checked) {
    const target = document.getElementById(`${checked.value}-details`);
    if (target) target.style.display = 'block'; // matches CSS flex layout
}
}

document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('cardNumber');
  const expiryField = document.getElementById('expiry'); // target to focus
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

    // Auto-focus expiry when user enters the 16th digit at the end (not on deletes)
    const isInsert = !e || (e.inputType && !e.inputType.startsWith('delete'));
    const caretAtEnd = digitsLeft === allDigits.length;
    if (expiryField && isInsert && allDigits.length === MAX_DIGITS && caretAtEnd) {
      expiryField.focus();
      const end = expiryField.value.length;
      try { expiryField.setSelectionRange(end, end); } catch {}
    }
  }

  // pass the event so we can detect insert vs delete
  card.addEventListener('input', (e) => formatCardPreserveCaret(e));

  // Smart backspace: if caret is just after the separator " - ", delete the previous digit
  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Backspace') return;

    const selStart = card.selectionStart ?? 0;
    const selEnd = card.selectionEnd ?? 0;

    // Let default handle range deletions; we'll reformat on 'input'
    if (selStart !== selEnd) return;

    const v = card.value;
    const SEP_STR = ' - ';
    const justAfterFullSep = selStart >= 3 && v.slice(selStart - 3, selStart) === SEP_STR;
    const justAfterHyphen   = selStart > 0 && v[selStart - 1] === '-';

    if (justAfterFullSep || justAfterHyphen) {
      e.preventDefault();

      // Count of digits before the separator
      const digitIdx = digitsOnly(v.slice(0, justAfterFullSep ? selStart - 3 : selStart - 1)).length;

      const totalDigits = digitsOnly(v);
      if (digitIdx > 0) {
        const newDigits = totalDigits.slice(0, digitIdx - 1) + totalDigits.slice(digitIdx);
        card.value = group4(newDigits);
        setCaretForDigitIndex(card, digitIdx - 1);
      } else {
        const newPos = Math.max(0, selStart - 1);
        card.setSelectionRange(newPos, newPos);
      }
    }
  });

  // Block non-digit keypresses (navigation/backspace still works)
  card.addEventListener('keypress', (e) => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  });
});

/* ---------------------------
   Expiry mask (MM / YY)
   Auto-focus CVV on completion
----------------------------*/
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

    // Auto-focus CVV when complete
    if (all.length === MAX_DIGITS) {
      const next = document.getElementById('cvv') || expiry.closest('form')?.querySelector('input[placeholder="CVV"]');
      if (next) next.focus();
    }
  }

  expiry.addEventListener('input', formatPreserveCaret);

  // Smart backspace over separator
  expiry.addEventListener('keydown', (e) => {
    if (e.key !== 'Backspace') return;

    const selStart = expiry.selectionStart ?? 0;
    const selEnd = expiry.selectionEnd ?? 0;
    if (selStart !== selEnd) return; // let default handle range deletes

    const v = expiry.value;
    const afterFullSep = selStart >= 3 && v.slice(selStart - 3, selStart) === SEP;
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

  // Block non-digits and prevent beyond 4 digits (unless replacing selection)
  expiry.addEventListener('keypress', (e) => {
    if (!/[0-9]/.test(e.key)) return e.preventDefault();
    const selection = (expiry.selectionEnd ?? 0) - (expiry.selectionStart ?? 0);
    const currentDigits = digitsOnly(expiry.value).length;
    if (selection === 0 && currentDigits >= MAX_DIGITS) e.preventDefault();
  });

  // Validate month on blur
  expiry.addEventListener('blur', () => {
    const raw = digitsOnly(expiry.value);
    if (raw.length !== 4) { expiry.value = ''; return; }
    const mm = +raw.slice(0, 2);
    const yy = raw.slice(2, 4);
    if (mm < 1 || mm > 12) { expiry.value = ''; return; }
    expiry.value = raw.slice(0, 2) + SEP + yy; // normalize
  });
})();

/* ---------------------------
   CVV (3 digits) → auto-focus Name on Card
----------------------------*/
(() => {
  const cvv = document.getElementById('cvv');
  const nameOnCard = document.getElementById('cardName') 
                  || document.querySelector('input[placeholder="Name on Card"]');
  if (!cvv || !nameOnCard) return;

  const digitsOnly = s => s.replace(/\D/g, '');

  cvv.addEventListener('input', (e) => {
    // keep only digits, cap at 3
    const caretWasEnd = cvv.selectionStart === cvv.value.length && cvv.selectionEnd === cvv.value.length;
    let v = digitsOnly(cvv.value).slice(0, 3);
    cvv.value = v;
    if (caretWasEnd) {
      const end = cvv.value.length;
      try { cvv.setSelectionRange(end, end); } catch {}
    }

    // focus Name on Card only when user *adds* the 3rd digit and caret is at end
    const isInsert = !e.inputType || !e.inputType.startsWith('delete');
    if (isInsert && v.length === 3 && caretWasEnd) {
      nameOnCard.focus();
      const end = nameOnCard.value.length;
      try { nameOnCard.setSelectionRange(end, end); } catch {}
    }
  });

  // Optional: block non-digits on keypress
  cvv.addEventListener('keypress', (e) => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  });
})();