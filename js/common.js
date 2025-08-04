function updateCartBadge(count) {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;
    badge.textContent = count > 0 ? count : "";
    badge.style.display = count > 0 ? "inline-block" : "none";
}

function updateWishlistBadgeFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const wishlistRef = firebase.database().ref(`Wishlist/${user.uid}`);
    wishlistRef.once("value").then(snapshot => {
        let count = 0;
        snapshot.forEach(() => count++);

        const badge = document.getElementById("wishlistBadge");
        if (!badge) return;

        badge.textContent = count > 0 ? count : "";
        badge.style.display = count > 0 ? "inline-block" : "none";
    });
}

function updateCartBadgeFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const cartRef = firebase.database().ref(`Cart/${user.uid}`);
    cartRef.once("value").then(snapshot => {
        let count = 0;
        snapshot.forEach(child => {
            const item = child.val();
            count += item.qty || 1;
        });

        updateCartBadge(count);
    });
}

function showToast(message) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: green"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
