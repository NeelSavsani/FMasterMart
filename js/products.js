// ✅ Initialize Firebase Auth Listener
firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
        alert("Please login to continue.");
        window.location.href = "/register.html";
        return;
    }
    updateCartBadgeFromFirebase();
    updateWishlistBadgeFromFirebase();
    await renderProducts();
});

// ✅ Product List
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

// ✅ Render Products
async function renderProducts() {
    console.log("Rendering products...");
    const container = document.getElementById("productList");
    container.innerHTML = "";

    const user = firebase.auth().currentUser;
    const uid = user?.uid;

    let wishlistSnapshot = null;
    if (uid) {
        const wishlistRef = firebase.database().ref(`Wishlist/${uid}`);
        wishlistSnapshot = await wishlistRef.once("value");
    }

    for (const [index, p] of products.entries()) {
        const imageUrl = await fetchImage(p.name);

        let isWishlisted = false;
        if (wishlistSnapshot && wishlistSnapshot.exists()) {
            wishlistSnapshot.forEach(child => {
                if (child.val().productName === p.name) {
                    isWishlisted = true;
                }
            });
        }

        const card = document.createElement("div");
        card.className = "product-card";
        if (p.outOfStock) card.classList.add("out-of-stock");

        card.innerHTML = `
            ${p.discount ? `<span class="badge">${p.discount}</span>` : ""}
            <span class="wishlist"><i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i></span>
            <div class="image"><img src="${imageUrl}" alt="${p.name}" /></div>
            <div class="category">${p.category}</div>
            <h3 class="product-name">${p.name}</h3>
            <div class="rating">${"★".repeat(p.rating)}<span> (${p.ratingCount})</span></div>
            <div class="price">₹${p.price.toLocaleString("en-IN")}
                ${p.oldPrice ? `<span class="old">₹${p.oldPrice.toLocaleString("en-IN")}</span>` : ""}
            </div>
            <button class="add-to-cart-btn" ${p.outOfStock ? "disabled" : ""} data-id="${index}">
                ${p.outOfStock ? "Out of Stock" : `<i class="fa-solid fa-cart-shopping"></i> &nbsp; Add to Cart`}
            </button>
        `;

        card.querySelector(".wishlist i").addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const wishlistRef = firebase.database().ref(`Wishlist/${uid}`);
            const userSnapshot = await firebase.database().ref(`users/${uid}`).once("value");
            const userData = userSnapshot.val();
            const existingSnapshot = await wishlistRef.orderByChild("productName").equalTo(p.name).once("value");

            if (existingSnapshot.exists()) {
                const key = Object.keys(existingSnapshot.val())[0];
                await wishlistRef.child(key).remove();
                e.target.classList.remove("fa-solid");
                e.target.classList.add("fa-regular");
                alert("Removed from wishlist");
            } else {
                await wishlistRef.push({
                    productId: Date.now().toString(),
                    customerFullname: userData?.full_name || "Unknown",
                    customerEmail: user.email,
                    productCategory: p.category,
                    productName: p.name,
                    productPrice: p.price,
                    quantity: 1,
                    addedAt: new Date().toISOString()
                });
                e.target.classList.remove("fa-regular");
                e.target.classList.add("fa-solid");
                alert("Added to wishlist");
            }

            updateWishlistBadgeFromFirebase();
        });

        card.querySelector(".add-to-cart-btn").addEventListener("click", async () => {
            const cartRef = firebase.database().ref(`Cart/${uid}`);
            const cartId = Date.now().toString();

            const userSnapshot = await firebase.database().ref(`users/${uid}`).once("value");
            const userData = userSnapshot.val();

            const cartItem = {
                cartId,
                productName: p.name,
                productCategory: p.category,
                productPrice: p.price,
                customerFullName: userData?.full_name || "Unknown",
                customerEmail: user.email,
                qty: 1,
                cartedAt: new Date().toISOString()
            };

            const snapshot = await cartRef.orderByChild("productName").equalTo(p.name).once("value");

            if (snapshot.exists()) {
                const key = Object.keys(snapshot.val())[0];
                const existingItem = snapshot.val()[key];
                const newQty = (existingItem.qty || 1) + 1;
                await cartRef.child(key).update({ qty: newQty });
            } else {
                await cartRef.child(cartId).set(cartItem);
            }

            const wishlistSnapshot = await firebase.database().ref(`Wishlist/${uid}`).orderByChild("productName").equalTo(p.name).once("value");
            if (wishlistSnapshot.exists()) {
                const key = Object.keys(wishlistSnapshot.val())[0];
                await firebase.database().ref(`Wishlist/${uid}/${key}`).remove();
                updateWishlistBadgeFromFirebase();
            }

            alert("Item added to cart");
            updateCartBadgeFromFirebase();
        });

        container.appendChild(card);
    }
}

// ✅ Badge Functions
function updateCartBadgeFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    firebase.database().ref(`Cart/${user.uid}`).once("value").then(snapshot => {
        let count = 0;
        snapshot.forEach(child => {
            count += child.val()?.qty || 1;
        });
        const badge = document.getElementById("cartBadge");
        if (!badge) return;
        badge.textContent = count > 0 ? count : "";
        badge.style.display = count > 0 ? "inline-block" : "none";
    });
}

function updateWishlistBadgeFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    firebase.database().ref(`Wishlist/${user.uid}`).once("value").then(snapshot => {
        let count = snapshot.numChildren();
        const badge = document.getElementById("wishlistBadge");
        if (!badge) return;
        badge.textContent = count > 0 ? count : "";
        badge.style.display = count > 0 ? "inline-block" : "none";
    });
}
