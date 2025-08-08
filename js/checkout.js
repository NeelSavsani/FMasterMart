const shippingForm = document.querySelector('.shipping-form form');
const paymentSection = document.querySelector('.payment-section');
const stepIndicators = document.querySelectorAll('.step');

// Move to payment step
shippingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    document.querySelector('.shipping-form').style.display = 'none';
    if (paymentSection) paymentSection.style.display = 'block';

    // Update step UI
    // stepIndicators[0].classList.remove('active');
    stepIndicators[1].classList.add('active');
});

// Payment method toggle logic (optional)
document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
    radio.addEventListener('change', function () {
        document.querySelectorAll('.payment-details').forEach(el => {
            el.style.display = 'none';
        });
        const selected = document.getElementById(this.value + '-details');
        if (selected) selected.style.display = 'block';
    });
});
