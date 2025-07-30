const UNSPLASH_ACCESS_KEY = "_HM4vCxWz8KfJ5FbjpHEMhz-prB93VqI1d-46K3sCsk";

// ✅ Helper to fetch image from Unsplash
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

// ✅ Load and render wishlist when page loads
document.addEventListener('DOMContentLoaded', () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const container = document.getElementById('wishlist-list');

    // ✅ Render wishlist items
    function renderWishlist() {
        container.innerHTML = '';
        if (wishlist.length === 0) {
            container.innerHTML = '<p>Your wishlist is empty <i class="fa-solid fa-heart-crack"></i></p>';
            return;
        }

        wishlist.forEach(async (p, index) => {
            const card = document.createElement('div');
            const imageUrl = await fetchImage(p.name);
            card.className = 'product-card';
            if (p.outOfStock) card.classList.add("out-of-stock");

            card.innerHTML = `
            ${p.discount ? `<span class="badge">${p.discount}</span>` : ""}
            <button class="wishlist-btn remove-wishlist" data-index="${index}">
                <i class="fa-solid fa-trash"></i>
            </button>
            <div class="image"><img src="${imageUrl}" alt="${p.name}" /></div>
            <div class="category">${p.category}</div>
            <h3>${p.name}</h3>
            <div class="rating">${"★".repeat(p.rating)}<span> (${p.ratingCount})</span></div>
            <div class="price">₹${p.price.toLocaleString("en-IN")}
                ${p.oldPrice ? `<span class="old">₹${p.oldPrice.toLocaleString("en-IN")}</span>` : ""}
            </div>
            <div class="card-footer">
                <button class="add-to-cart-btn" ${p.outOfStock ? "disabled" : ""}>
                    <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                </button>
                <button class="wishlist-toggle" data-name="${p.name}">
                    <i class="fa-solid fa-heart"></i>
                </button>
            </div>
        `;

            // Handle add to cart
            card.querySelector(".add-to-cart-btn").addEventListener("click", () => {
                addToCart(p, imageUrl);

                // ✅ Remove from wishlist
                const idx = wishlist.findIndex(item => item.name === p.name);
                if (idx !== -1) {
                    wishlist.splice(idx, 1);
                    localStorage.setItem("wishlist", JSON.stringify(wishlist));
                    renderWishlist(); // ✅ Re-render wishlist UI
                }

                // ✅ Show alert
                alert(`${p.name} has been added to your cart.`);
            });



            // Handle trash icon
            card.querySelector(".remove-wishlist").addEventListener("click", () => {
                wishlist.splice(index, 1);
                localStorage.setItem("wishlist", JSON.stringify(wishlist));
                renderWishlist();
            });

            // Handle heart icon toggle (remove from wishlist)
            card.querySelector(".wishlist-toggle").addEventListener("click", () => {
                const idx = wishlist.findIndex(item => item.name === p.name);
                if (idx !== -1) {
                    wishlist.splice(idx, 1);
                    localStorage.setItem("wishlist", JSON.stringify(wishlist));
                    renderWishlist(); // Re-render to reflect removal
                }
            });


            container.appendChild(card);
        });
    }



    // ✅ Add item to cart
    function addToCart(product, imageUrl) {
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existing = cart.find(p => p.name === product.name);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({
                id: Date.now(), // ✅ Ensure unique ID is assigned
                name: product.name,
                category: product.category,
                price: product.price,
                originalPrice: product.oldPrice || product.price,
                qty: 1,
                image: imageUrl
            });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
    }


    // ✅ Add all wishlist items to cart
    window.addAllToCart = async () => {
        for (const product of wishlist) {
            const imageUrl = await fetchImage(product.name);
            addToCart(product, imageUrl);
        }
        localStorage.setItem("wishlist", "[]");
        alert("All wishlist items have been added to cart!");
        window.location.reload();
    }

    renderWishlist();
});
