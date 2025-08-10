/********************
 * Firebase + state *
 ********************/
const db = firebase.database();
let CURRENT_UID = 'guest';

// Optional fallback if you store uid locally for guests
const storedUid = localStorage.getItem('uid') || sessionStorage.getItem('uid');
if (storedUid) CURRENT_UID = storedUid;

firebase.auth().onAuthStateChanged((user) => {
  CURRENT_UID = user?.uid || CURRENT_UID || 'guest';
  loadCartAndRender(CURRENT_UID);
});

/***********************
 * Currency formatting *
 ***********************/
const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

/***********************************
 * CART → load & render summary UI *
 ***********************************/
const GST_RATE = 0.18;
const FREE_SHIPPING = 0;
let CART_ITEMS = [];   // cached for order write

/** Read the user's cart from /Cart/{uid} */
async function fetchCartRaw(uid) {
  const snap = await db.ref(`Cart/${uid}`).once('value');
  return snap.val() || {};
}

/** Accepts /Cart/{uid}/{pushId}: { productName, productPrice, qty, image? } */
function normalizeCart(raw) {
  if (!raw) return [];
  return Object.entries(raw).map(([id, obj]) => {
    const name = obj.productName || obj.name || obj.title || `Item ${id}`;
    const price = Number(obj.productPrice ?? 0);
    const qty = Number(obj.qty ?? obj.quantity ?? 1);
    const img = obj.image || obj.img || obj.thumb || '';
    return { id, name, price, qty, img, total: +(price * qty).toFixed(2) };
  });
}

async function loadCartAndRender(uid) {
  try {
    const data = await fetchCartRaw(uid);
    CART_ITEMS = normalizeCart(data);

    const subtotal = CART_ITEMS.reduce((s, it) => s + it.price * it.qty, 0);
    const tax = Math.round((subtotal * GST_RATE) * 100) / 100;
    const shipping = FREE_SHIPPING;
    const total = subtotal + tax + shipping;

    renderOrderSummary(CART_ITEMS, { subtotal, tax, shipping, total });
    updatePlaceOrderButton(total);
  } catch (err) {
    console.error('Failed to load cart:', err);
  }
}

function renderOrderSummary(items, totals) {
  const wrap = document.querySelector('.order-summary');
  if (!wrap) return;

  // remove demo rows we didn’t build
  wrap.querySelectorAll('.product, .product-list').forEach(el => el.remove());

  const list = document.createElement('div');
  list.className = 'product-list';

  items.forEach(it => {
    const row = document.createElement('div');
    row.className = 'product';
    row.innerHTML = `
      <div class="product-img" style="${it.img ? `background-image:url('${it.img}');background-size:cover;background-position:center;` : ''}"></div>
      <div class="product-details">
        <p class="product-name">${it.name}</p>
        <p class="product-price">${INR.format(it.price)}</p>
        <p class="product-qty">Qty: ${it.qty}</p>
      </div>
    `;
    list.appendChild(row);
  });

  const h2 = wrap.querySelector('h2');
  if (h2) h2.insertAdjacentElement('afterend', list);

  const lines = wrap.querySelectorAll('.summary-line');
  if (lines[0]) lines[0].lastElementChild.textContent = INR.format(totals.subtotal);
  if (lines[1]) lines[1].lastElementChild.textContent = totals.shipping === 0 ? 'Free' : INR.format(totals.shipping);
  if (lines[2]) lines[2].lastElementChild.textContent = INR.format(totals.tax);
  if (lines[3]) lines[3].lastElementChild.textContent = INR.format(totals.total);
}

function updatePlaceOrderButton(total) {
  const btn = document.querySelector('.payment-section form button.btn-primary[type="submit"]');
  if (btn && typeof total === 'number') {
    btn.textContent = `Place Order - ${INR.format(total)}`;
  }
}

/********************************
 * Step navigation (existing UI) *
 ********************************/
const shippingForm = document.querySelector('.shipping-form form');
const paymentSection = document.querySelector('.payment-section');
const stepIndicators = document.querySelectorAll('.step');
const Indicators = document.querySelectorAll('.divider');
const backToShippingButton = document.getElementById('backToShipping');
const paymentFormEl = document.getElementById('paymentForm');
const confirmationSection = document.querySelector('.confirmation-section');

function setActivePaymentSection(method) {
  document.querySelectorAll('.payment-details').forEach(section => {
    const active = section.id === `${method}-details`;
    section.style.display = active ? 'block' : 'none';

    // Avoid "invalid form control is not focusable"
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

shippingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  document.querySelector('.shipping-form').style.display = 'none';
  if (paymentSection) paymentSection.style.display = 'block';
  stepIndicators[1].classList.add('active');
  Indicators[0].classList.add('active');
  syncPaymentDetails();
});

if (backToShippingButton) {
  backToShippingButton.addEventListener('click', () => {
    document.querySelector('.shipping-form').style.display = 'block';
    if (paymentSection) paymentSection.style.display = 'none';
    stepIndicators[0].classList.add('active');
    stepIndicators[1].classList.remove('active');
    Indicators[0].classList.remove('active');
  });
}

document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
  radio.addEventListener('change', syncPaymentDetails);
});

/***********************************************
 * Masks + autofocus (card / expiry / cvv / name)
 ***********************************************/
document.addEventListener('DOMContentLoaded', () => {
  syncPaymentDetails();           // ensure correct method is enabled
  loadCartAndRender(CURRENT_UID); // also load cart on first paint

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

    const isInsert = !e || (e.inputType && !e.inputType.startsWith('delete'));
    const caretAtEnd = digitsLeft === allDigits.length;
    if (expiryField && isInsert && allDigits.length === MAX_DIGITS && caretAtEnd) {
      expiryField.focus();
      const end = expiryField.value.length;
      try { expiryField.setSelectionRange(end, end); } catch {}
    }
  }

  card.addEventListener('input', (e) => formatCardPreserveCaret(e));

  // smart backspace over separators
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

  // block non-digits
  card.addEventListener('keypress', (e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); });
});

// Expiry mask (MM / YY) → focus CVV
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

  // smart backspace over " / "
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

  expiry.addEventListener('keypress', (e) => {
    if (!/[0-9]/.test(e.key)) return e.preventDefault();
    const selection = (expiry.selectionEnd ?? 0) - (expiry.selectionStart ?? 0);
    const currentDigits = digitsOnly(expiry.value).length;
    if (selection === 0 && currentDigits >= MAX_DIGITS) e.preventDefault();
  });

  expiry.addEventListener('blur', () => {
    const raw = digitsOnly(expiry.value);
    if (raw.length !== 4) { expiry.value = ''; return; }
    const mm = +raw.slice(0, 2);
    const yy = raw.slice(2, 4);
    if (mm < 1 || mm > 12) { expiry.value = ''; return; }
    expiry.value = raw.slice(0, 2) + ' / ' + yy;
  });
})();

// CVV (3) → focus Name on Card
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

/*****************************************
 * Collect shipping & payment data (JS)  *
 *****************************************/
function collectShippingData() {
  const form = document.querySelector('.shipping-form form');
  if (!form) return {};

  const firstName = form.querySelector('.form-row.single .form-group:nth-child(1) input')?.value?.trim() || '';
  const lastName  = form.querySelector('.form-row.single .form-group:nth-child(2) input')?.value?.trim() || '';
  const email     = form.querySelector('input[type="email"]')?.value?.trim() || '';
  const phone     = form.querySelector('input[type="number"][oninput*="10"]')?.value?.trim() || '';
  const address   = form.querySelector('textarea')?.value?.trim() || '';

  const rows = form.querySelectorAll('.form-row');
  const lastRow = rows[rows.length - 1];
  const city    = lastRow?.querySelector('input[type="text"]')?.value?.trim() || '';
  const state   = lastRow?.querySelector('select')?.value || '';
  const pinCode = lastRow?.querySelector('input[type="number"]')?.value?.trim() || '';

  return { firstName, lastName, email, phone, address, city, state, pinCode };
}

function collectPaymentData() {
  const method = document.querySelector('input[name="payment-method"]:checked')?.value || 'card';
  if (method === 'card') {
    const rawCard = document.getElementById('cardNumber')?.value || '';
    const last4 = (rawCard.match(/\d/g) || []).join('').slice(-4);
    const expiry = document.getElementById('expiry')?.value || '';
    const name = document.getElementById('cardName')?.value || '';
    return { method, card: { last4, expiry, name } }; // never store CVV
  }
  if (method === 'upi') {
    const upiId = document.getElementById('upiId')?.value || '';
    return { method, upi: { upiId } };
  }
  return { method }; // COD
}

/********************************
 * Place Order → DB write + UI  *
 ********************************/
async function placeOrderAndConfirm() {
  const subtotal = CART_ITEMS.reduce((s, it) => s + (it.price * it.qty), 0);
  const tax = Math.round((subtotal * GST_RATE) * 100) / 100;
  const shipping = FREE_SHIPPING;
  const total = subtotal + tax + shipping;

  const orderId = 'ORD-' + Date.now();
  const order = {
    orderId,
    userId: CURRENT_UID,
    createdAt: Date.now(),
    status: 'confirmed',
    shipping: collectShippingData(),
    payment: collectPaymentData(),
    items: CART_ITEMS.map(({ id, name, price, qty, img, total }) => ({ id, name, price, qty, img, lineTotal: total })),
    totals: { subtotal, tax, shipping, total, currency: 'INR' }
  };

  // Write to /Order/{uid}/{orderId}
  await db.ref(`Order/${CURRENT_UID}/${orderId}`).set(order);

  // Clear cart at /Cart/{uid}
  await db.ref(`Cart/${CURRENT_UID}`).remove();

  return orderId;
}

// Submit Payment → Confirmation
if (paymentFormEl && confirmationSection) {
  paymentFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const id = await placeOrderAndConfirm();

      paymentSection.style.display = 'none';
      confirmationSection.style.display = 'block';
      stepIndicators[2]?.classList.add('active');
      Indicators[1]?.classList.add('active');

      const idEl = document.getElementById('orderId');
      if (idEl) idEl.textContent = id;

      document.getElementById('continueShoppingBtn')?.addEventListener('click', () => {
        if (typeof gotoHome === 'function') gotoHome();
      });
      document.getElementById('trackOrderBtn')?.addEventListener('click', () => {
        alert('Tracking coming soon!');
      });
    } catch (err) {
      console.error('Order placement failed:', err);
      alert('Sorry, something went wrong placing your order. Please try again.');
    }
  });
}
