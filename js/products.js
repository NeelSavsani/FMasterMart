// ✅ Load cart from localStorage safely
try {
    const storedCart = JSON.parse(localStorage.getItem("cart"));
    window.cart = Array.isArray(storedCart) ? storedCart : [];
} catch {
    window.cart = [];
}

// ✅ Product list
const products = [
    {
        category: "Electronics",
        name: "Premium Wireless Headphones with Noise Cancellation",
        rating: 4,
        ratingCount: 1234,
        price: 8999,
        oldPrice: 12999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Grooming",
        name: "Skincare Kit with Natural Ingredients",
        rating: 3,
        ratingCount: 789,
        price: 2999,
        oldPrice: 4499,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Fashion",
        name: "Organic Cotton Casual T-Shirt for Men",
        rating: 3,
        ratingCount: 432,
        price: 1299,
        oldPrice: 1899,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Photography",
        name: "Professional Camera Lens 50mm f/1.8",
        rating: 3,
        ratingCount: 156,
        price: 25999,
        oldPrice: 30000,
        discount: null,
        outOfStock: true,
    },
    {
        category: "Furniture",
        name: "Ergonomic Office Chair with Lumbar Support",
        rating: 4,
        ratingCount: 678,
        price: 18999,
        oldPrice: 24999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Electronics",
        name: "Bluetooth Portable Speaker Waterproof",
        rating: 4,
        ratingCount: 945,
        price: 3999,
        oldPrice: 5999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Wearables",
        name: "Smart Watch for Men 1.43' True AMOLED",
        rating: 4,
        ratingCount: 1138,
        price: 2999,
        oldPrice: 9999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Electronics",
        name: "Gaming Mechanical Keyboard RGB Backlit",
        rating: 5,
        ratingCount: 523,
        price: 7499,
        oldPrice: 9999,
        discount: null,
        outOfStock: true,
    },
    {
        category: "Fashion",
        name: "Polarized sunglass",
        rating: 5,
        ratingCount: 202,
        price: 6499,
        oldPrice: 7999,
        discount: null,
        outOfStock: true,
    },
    {
        category: "Photography",
        name: "RGB LED Stick Light with 30W Power",
        rating: 4,
        ratingCount: 527,
        price: 4749,
        oldPrice: 5990,
        discount: null,
        outOfStock: true,
    },
    {
        category: "Wearables",
        name: "Smart Fitness Watch with Heart Rate Monitor",
        rating: 4,
        ratingCount: 856,
        price: 15999,
        oldPrice: 19999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Electronics",
        name: "Ergonomic gaming mouse",
        rating: 4,
        ratingCount: 600,
        price: 6999,
        oldPrice: 9999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false
    },
    {
        category: "Furniture",
        name: "Laptop Stand with 360° Rotating Base",
        rating: 4.5,
        ratingCount: 1691,
        price: 1899,
        oldPrice: 3899,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },

    {
        category: "Grooming",
        name: "Coconut Milk & Peptides strength & shine shampoo",
        rating: 4,
        ratingCount: 2599,
        price: 315,
        oldPrice: 349,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Fashion",
        name: "Women's Georgette Embroidered Sequence Work Long Sleeve Round Nack Gown",
        rating: 4,
        ratingCount: 34,
        price: 979,
        oldPrice: 1199,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false,
    },
    {
        category: "Photography",
        name: "LED Video Light for Phone, Camera, Laptop",
        rating: 4,
        ratingCount: 194,
        price: 699,
        oldPrice: 1999,
        get discount() {
            return `-${((this.oldPrice - this.price) / this.oldPrice * 100).toFixed(1)}%`;
        },
        outOfStock: false
    }
];

// ✅ Unsplash image fetch
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

// ✅ Render all products
async function renderProducts() {
    const container = document.getElementById("productList");
    container.innerHTML = "";

    for (const [index, p] of products.entries()) {
        const imageUrl = await fetchImage(p.name);

        const card = document.createElement("div");
        card.className = "product-card";
        if (p.outOfStock) card.classList.add("out-of-stock");

        card.innerHTML = `
      ${p.discount ? `<span class="badge">${p.discount}</span>` : ""}
      <span class="wishlist"><i class="${isInWishlist(p.name) ? 'fa-solid' : 'fa-regular'} fa-heart"></i></span>
      <div class="image"><img src="${imageUrl}" alt="${p.name}" /></div>
      <div class="category">${p.category}</div>
      <h3>${p.name}</h3>
      <div class="rating">${"★".repeat(p.rating)}<span> (${p.ratingCount})</span></div>
      <div class="price">₹${p.price.toLocaleString("en-IN")}
        ${p.oldPrice ? `<span class="old">₹${p.oldPrice.toLocaleString("en-IN")}</span>` : ""}
      </div>
      <button class="add-to-cart-btn" ${p.outOfStock ? "disabled" : ""} data-id="${index}">
        ${p.outOfStock ? "Out of Stock" : `<i class="fa-solid fa-cart-shopping"></i> &nbsp; Add to Cart`}
      </button>
    `;

        // Toggle wishlist
        card.querySelector(".wishlist i").addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.target.classList.toggle("fa-regular");
            e.target.classList.toggle("fa-solid");
            updateWishlist(p.name);
        });

        // Add to cart
        card.querySelector(".add-to-cart-btn").addEventListener("click", async () => {
            const existing = window.cart.find(item => item.name === p.name);
            if (existing) {
                existing.qty += 1;
            } else {
                window.cart.push({
                    id: Date.now(),
                    name: p.name,
                    category: p.category,
                    price: p.price,
                    originalPrice: p.oldPrice || p.price,
                    qty: 1,
                    image: imageUrl // ✅ save image
                });
            }
            localStorage.setItem("cart", JSON.stringify(window.cart));
            updateCartBadge(window.cart.reduce((sum, p) => sum + p.qty, 0));
        });

        container.appendChild(card);
    }
}

// ✅ Update badge
function updateCartBadge(count) {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }
}

// ✅ On DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    const count = window.cart.reduce((sum, p) => sum + p.qty, 0);
    updateCartBadge(count);
    renderProducts();
});


// Initialize cart and wishlist from localStorage
window.cart = JSON.parse(localStorage.getItem("cart") || "[]");
window.wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");


function updateWishlist(name) {
    const exists = window.wishlist.find(p => p.name === name);
    if (exists) {
        window.wishlist = window.wishlist.filter(p => p.name !== name);
    } else {
        const product = products.find(p => p.name === name);
        if (product) {
            window.wishlist.push(product);
        }
    }
    localStorage.setItem("wishlist", JSON.stringify(window.wishlist));
    renderProducts(); // re-render UI
}


function isInWishlist(name) {
    return window.wishlist.some(p => p.name === name);
}
