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

firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
        alert("Please login first to access this page.");
        window.location.href = "/register.html";
    } else {
        document.dispatchEvent(new CustomEvent("auth-ready", { detail: { user } }));
    }
});

async function renderCart(user) {
    const uid = user.uid;
    const cartRef = firebase.database().ref(`Cart/${uid}`);
    const snapshot = await cartRef.once("value");

    const cartItems = document.getElementById("cartItems");
    const emptyCart = document.getElementById("emptyCart");
    const cartSummary = document.getElementById("cartSummary");

    cartItems.innerHTML = "";

    if (!snapshot.exists()) {
        emptyCart.style.display = "block";
        cartSummary.style.display = "none";
        updateCartBadge(0);
        return;
    }

    const cartData = snapshot.val();
    let totalQty = 0;
    let totalAmount = 0;

    emptyCart.style.display = "none";
    cartSummary.style.display = "block";

    for (const cartId in cartData) {
        const item = cartData[cartId];
        const imageUrl = item.image || await fetchImage(item.productName);
        const qty = item.qty || 1;

        totalQty += qty;
        totalAmount += qty * item.productPrice;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.dataset.id = cartId;

        console.log("Item from Firebase:", item);
        div.innerHTML = `
        <div class="item-info">
            <div class="item-image"><img src="${imageUrl}" alt="${item.name}"></div>
            <div>
                <h2>${item.productName}</h2>
                <span class="tag">${item.productCategory}</span>
                <div class="price-group">
                    <span class="price">₹${(item.productPrice || 0).toFixed(2)}</span>
                    <span class="original-price">₹${(item.originalPrice || item.productPrice || 0).toFixed(2)}</span>
                    <span class="discount">-${item.originalPrice ? Math.round((1 - (item.productPrice || 0) / item.originalPrice) * 100) : 0}%</span>
                </div>
            </div>
        </div>
        <div class="item-actions">
            <div>
                <button class="qty-minus">−</button>
                <span class="qty">${item.qty}</span>
                <button class="qty-plus">+</button>
            </div>
            <div class="subtotal">Subtotal: ₹${(qty * item.productPrice).toFixed(2)}</div>
            <button class="remove-item"><i class="fa-solid fa-trash"></i></button>
        </div>
        `;

        cartItems.appendChild(div);
    }

    document.getElementById("totalItems").textContent = totalQty;
    document.getElementById("summaryAmount").textContent = `₹${totalAmount.toFixed(2)}`;
    document.getElementById("grandTotal").textContent = `₹${totalAmount.toFixed(2)}`;
    updateCartBadge(totalQty);
}

function updateCartBadge(count) {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;
    badge.textContent = count > 0 ? count : "";
    badge.style.display = count > 0 ? "inline-block" : "none";
}

document.addEventListener("auth-ready", (e) => {
    const user = e.detail.user;
    renderCart(user);

    document.getElementById("cartItems").addEventListener("click", async (evt) => {
        const cartItemEl = evt.target.closest(".cart-item");
        if (!cartItemEl) return;

        const cartId = cartItemEl.dataset.id;
        const qtyEl = cartItemEl.querySelector(".qty");
        let qty = parseInt(qtyEl.textContent);
        const ref = firebase.database().ref(`Cart/${user.uid}/${cartId}`);

        if (evt.target.classList.contains("qty-plus")) {
            qty++;
            await ref.update({ qty });
        } else if (evt.target.classList.contains("qty-minus")) {
            if (qty > 1) {
                qty--;
                await ref.update({ qty });
            } else {
                await ref.remove();
            }
        } else if (evt.target.closest(".remove-item")) {
            await ref.remove();
        }

        renderCart(user);
    });

    // Clear cart
    document.querySelector(".clear-cart-btn")?.addEventListener("click", async () => {
        if (confirm("Are you sure you want to clear the cart?")) {
            await firebase.database().ref(`Cart/${user.uid}`).remove();
            renderCart(user);
        }
    });

    // Back button
    document.querySelector(".back-link")?.addEventListener("click", () => {
        history.back();
    });
});

// Initial render is handled in "auth-ready"
