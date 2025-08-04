const UNSPLASH_ACCESS_KEY = "_HM4vCxWz8KfJ5FbjpHEMhz-prB93VqI1d-46K3sCsk";

document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged((user) => {
        updateWishlistBadgeFromFirebase();
        updateCartBadgeFromFirebase();
        if (!user) {
            alert("Please login to view your wishlist.");
            window.location.href = "/register.html";
            return;
        }

        loadWishlist(user);
    });
});

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

async function loadWishlist(user) {
    const uid = user.uid;
    const wishlistRef = firebase.database().ref(`Wishlist/${uid}`);
    const wishlistContainer = document.getElementById("wishlist-list");

    try {
        const snapshot = await wishlistRef.once("value");
        wishlistContainer.innerHTML = "";

        if (!snapshot.exists()) {
            wishlistContainer.innerHTML = "<p style='text-align:center;'>Your wishlist is empty.</p>";
            return;
        }

        const promises = [];

        snapshot.forEach(childSnapshot => {
            const item = childSnapshot.val();
            const key = childSnapshot.key;

            promises.push(
                fetchImage(item.productName).then(imageUrl => {
                    const card = document.createElement("div");
                    card.className = "product-card";

                    card.innerHTML = `
                        ${item.discount ? `<span class="badge">${item.discount}</span>` : ""}
                        <button class="wishlist-btn remove-wishlist" onclick="removeFromWishlist('${key}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                        <div class="image"><img src="${imageUrl}" alt="${item.productName}" /></div>
                        <div class="category">${item.productCategory}</div>
                        <h3>${item.productName}</h3>
                        <div class="product-price">₹${item.productPrice.toLocaleString("en-IN")}</div>
                        <div class="card-footer">
                            <button class="add-to-cart-btn" onclick="addToCartFromWishlist('${key}', ${item.productPrice}, '${escapeQuotes(item.productName)}', '${escapeQuotes(item.productCategory)}')">
                                <i class="fa-solid fa-cart-shopping"></i> Add to Cart
                            </button>
                        </div>
                    `;

                    wishlistContainer.appendChild(card);
                })
            );
        });

        await Promise.all(promises);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        wishlistContainer.innerHTML = "<p style='text-align:center;'>Error loading wishlist.</p>";
    }
}


function removeFromWishlist(wishlistId) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const uid = user.uid;
    firebase.database().ref(`Wishlist/${uid}/${wishlistId}`).remove()
        .then(() => {
            showToast("Removed from wishlist");
            location.reload();
        })
        .catch(err => {
            console.error("Error removing from wishlist:", err);
            showToast("Failed to remove from wishlist.");
        });
}

function addToCartFromWishlist(wishlistId, price, name, category) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Login required");
        return;
    }

    const uid = user.uid;
    const cartRef = firebase.database().ref(`Cart/${uid}`);
    const wishlistRef = firebase.database().ref(`Wishlist/${uid}/${wishlistId}`);
    const cartId = Date.now().toString();

    firebase.database().ref(`users/${uid}`).once("value").then(userSnapshot => {
        const userData = userSnapshot.val();

        const cartItem = {
            cartId: cartId,
            productName: name,
            productCategory: category,
            productPrice: price,
            customerFullName: userData?.full_name || "Unknown",
            customerEmail: user.email,
            qty: 1,
            cartedAt: new Date().toISOString()
        };

        // Add to cart
        cartRef.push(cartItem).then(() => {
            // ✅ Remove from wishlist after adding to cart
            wishlistRef.remove().then(() => {
                showToast("Item moved to cart");
                location.reload(); // refresh wishlist
            });
        });
    }).catch(err => {
        console.error("Failed to fetch user data:", err);
        alert("Failed to add item to cart.");
    });
}


function addAllToCart() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const uid = user.uid;
    const wishlistRef = firebase.database().ref(`Wishlist/${uid}`);
    const cartRef = firebase.database().ref(`Cart/${uid}`);

    firebase.database().ref(`users/${uid}`).once("value").then(userSnapshot => {
        const userData = userSnapshot.val();

        wishlistRef.once("value").then(snapshot => {
            if (!snapshot.exists()) {
                alert("Wishlist is empty");
                return;
            }

            const promises = [];

            snapshot.forEach(child => {
                const key = child.key;
                const item = child.val();

                const cartItem = {
                    cartId: Date.now().toString() + Math.floor(Math.random() * 1000),
                    productName: item.productName,
                    productCategory: item.productCategory,
                    productPrice: item.productPrice,
                    customerFullName: userData?.full_name || "Unknown",
                    customerEmail: user.email,
                    qty: 1,
                    cartedAt: new Date().toISOString()
                };

                // Add to cart and remove from wishlist
                const cartPush = cartRef.push(cartItem);
                const wishlistRemove = firebase.database().ref(`Wishlist/${uid}/${key}`).remove();

                promises.push(cartPush, wishlistRemove);
            });

            Promise.all(promises)
                .then(() => {
                    showToast("All items moved to cart");
                    location.reload();
                })
                .catch(err => {
                    console.error("Error moving all items:", err);
                    alert("Some items may not have been moved.");
                });
        });
    });
}


function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
