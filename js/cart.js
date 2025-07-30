let cart = JSON.parse(localStorage.getItem("cart")) || [];

const UNSPLASH_ACCESS_KEY = "_HM4vCxWz8KfJ5FbjpHEMhz-prB93VqI1d-46K3sCsk";
async function fetchImage(query) {
    const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=squarish&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;
    try {
        const res = await fetch(endpoint);
        if (!res.ok) return "https://via.placeholder.com/300?text=Image+Unavailable";
        const data = await res.json();
        return data?.results?.[0]?.urls?.small || "https://via.placeholder.com/300?text=No+Image";
    } catch {
        return "https://via.placeholder.com/300?text=Error";
    }
}

async function renderCart() {
    const cartItems = document.getElementById("cartItems");
    const emptyCart = document.getElementById("emptyCart");
    const cartSummary = document.getElementById("cartSummary");

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        emptyCart.style.display = "block";
        cartSummary.style.display = "none";
        updateCartBadge(0);
        return;
    }

    emptyCart.style.display = "none";
    cartSummary.style.display = "block";

    for (const item of cart) {
        const imageUrl = item.image || await fetchImage(item.name);

        const div = document.createElement("div");
        div.className = "cart-item";
        div.dataset.id = item.id;

        div.innerHTML = `
        <div class="item-info">
            <div class="item-image"><img src="${imageUrl}" alt="${item.name}"></div>
            <div>
                <h2>${item.name}</h2>
                <span class="tag">${item.category}</span>
                <div class="price-group">
                    <span class="price">₹${item.price.toFixed(2)}</span>
                    <span class="original-price">₹${item.originalPrice.toFixed(2)}</span>
                    <span class="discount">-${Math.round((1 - item.price / item.originalPrice) * 100)}%</span>
                </div>
            </div>
        </div>
        <div class="item-actions">
            <div>
                <button class="qty-minus">−</button>
                <span class="qty">${item.qty}</span>
                <button class="qty-plus">+</button>
            </div>
            <div class="subtotal">Subtotal: ₹${(item.qty * item.price).toFixed(2)}</div>
            <button class="remove-item"><i class="fa-solid fa-trash"></i></button>
        </div>
        `;

        cartItems.appendChild(div);
    }

    updateSummary();
    updateCartBadge(cart.reduce((sum, item) => sum + item.qty, 0));
}

function updateSummary() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalAmount = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

    document.getElementById("totalItems").textContent = totalQty;
    document.getElementById("summaryAmount").textContent = `₹${totalAmount.toFixed(2)}`;
    document.getElementById("grandTotal").textContent = `₹${totalAmount.toFixed(2)}`;
}

function updateCartBadge(count) {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;
    badge.textContent = count > 0 ? count : "";
    badge.style.display = count > 0 ? "inline-block" : "none";
}

document.addEventListener("click", (e) => {
    const cartItemEl = e.target.closest(".cart-item");
    if (!cartItemEl) return;
    const id = +cartItemEl.dataset.id;
    const index = cart.findIndex(item => item.id === id);
    if (index === -1) return;

    const item = cart[index];

    if (e.target.classList.contains("qty-plus")) {
        item.qty++;
    } else if (e.target.classList.contains("qty-minus")) {
        if (item.qty > 1) item.qty--;
        else cart.splice(index, 1);
    } else if (e.target.closest(".remove-item")) {
        cart.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
});

// Clear cart
document.querySelector(".clear-cart-btn")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the cart?")) {
        cart = [];
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }
});

// Back button
document.querySelector(".back-link")?.addEventListener("click", () => {
    history.back();
});

// Initial render
document.addEventListener("DOMContentLoaded", () => {
    renderCart();
});
