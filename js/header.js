document.addEventListener("DOMContentLoaded", () => {
    const searchToggleBtn = document.getElementById("searchToggleBtn");
    const floatingSearch = document.getElementById("floatingSearch");
    const profileDropdown = document.getElementById("profileDropdown");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    const searchInput = document.getElementById("searchInput");
    searchButton.addEventListener("click", () => {
        // Just close the floating searchbar
        floatingSearch.classList.remove("show");

        // Restore search icon
        const icon = searchToggleBtn.querySelector("i");
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-magnifying-glass");

        // ✅ DO NOT clear the input value
        // ✅ Keep filtered products as-is

        adjustCardWidthOnSearch(); // re-apply layout rules
    });

    if (searchToggleBtn && floatingSearch && profileDropdown) {
        searchToggleBtn.addEventListener("click", () => {
            profileDropdown.classList.remove("show");
            floatingSearch.classList.toggle("show");

            const icon = searchToggleBtn.querySelector("i");
            if (floatingSearch.classList.contains("show")) {
                icon.classList.remove("fa-magnifying-glass");
                icon.classList.add("fa-xmark");
                searchInput.focus();
            } else {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-magnifying-glass");

                // ✅ Don't reset the search input value
                // searchInput.value = ""; ❌ remove this line

                // ✅ Keep clearSearchBtn visible if there's still input
                clearSearchBtn.style.display = searchInput.value.trim().length > 0 ? "inline" : "none";

                // ✅ Do NOT restore product cards if input is not empty
                if (searchInput.value.trim() === "") {
                    document.querySelectorAll(".product-card").forEach(card => {
                        card.style.display = "block";
                    });
                }

                // ✅ Always fix layout according to search result
                adjustCardWidthOnSearch();
            }
        });
    }

    //Search filtering
    searchInput.addEventListener("keyup", function () {
        const query = this.value.toLowerCase();
        const productCards = document.querySelectorAll(".product-card");

        productCards.forEach(card => {
            const productName = card.querySelector(".product-name");
            if (productName && productName.textContent.toLowerCase().includes(query)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });

        //Show or hide clear button
        clearSearchBtn.style.display = query.length > 0 ? "inline" : "none";
        adjustCardWidthOnSearch(); // ✅ Add this here
    });

    //clear search input and reset cards
    clearSearchBtn.addEventListener("click", function () {
        searchInput.value = "";
        clearSearchBtn.style.display = "none";

        document.querySelectorAll(".product-card").forEach(card => {
            card.style.display = "block";
        });
        adjustCardWidthOnSearch(); // ✅ Add this here
    });

    document.addEventListener("click", function (e) {
        const isInsideDropdown = e.target.closest(".profile-menu");
        const isInsideSearch = e.target.closest("#floatingSearch");
        const isSearchBtn = e.target.closest("#searchToggleBtn");

        if (!isInsideDropdown && profileDropdown) {
            profileDropdown.classList.remove("show");
        }

        if (!isInsideSearch && !isSearchBtn && floatingSearch && searchToggleBtn) {
            if (floatingSearch.classList.contains("show")) {
                floatingSearch.classList.remove("show");
                const icon = searchToggleBtn.querySelector("i");
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-magnifying-glass");
            } else {
                document.querySelectorAll(".product-card").forEach(card => {
                    card.style.display = "block";
                });

                // ✅ Add this line here
                adjustCardWidthOnSearch();
            }
        }
    });

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    updateCartBadge(cart.reduce((sum, p) => sum + p.qty, 0));
});

function toggleDropdown(event) {
    const profileDropdown = document.getElementById("profileDropdown");
    const searchToggleBtn = document.getElementById("searchToggleBtn");
    const floatingSearch = document.getElementById("floatingSearch");

    event.stopPropagation();

    if (floatingSearch?.classList.contains("show")) {
        floatingSearch.classList.remove("show");
        const icon = searchToggleBtn?.querySelector("i");
        icon?.classList.remove("fa-xmark");
        icon?.classList.add("fa-magnifying-glass");
    }

    profileDropdown?.classList.toggle('show');
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

function gotoHome() {
    window.location.href = "index.html";
}

function gotoCart() {
    window.location.href = "cart.html";
}

function gotoWishlist() {
    window.location.href = "wishlist.html";
}

function gotoLogin() {
    window.location.href = "login.html";
}

function devFolio() {
    window.open('https://neelsavsani.vercel.app', '_blank');
}

function updateCartBadge(count) {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;

    badge.textContent = count > 0 ? count : "";
    badge.style.display = count > 0 ? "inline-block" : "none";
}

function adjustCardWidthOnSearch() {
    const productCards = Array.from(document.querySelectorAll(".product-card")).filter(c => c.style.display !== "none");
    const productList = document.querySelector(".product-list");

    if (!productList) return;

    if (productCards.length === 1) {
        productList.style.display = "flex";
        productList.style.justifyContent = "center";
        productCards[0].style.maxWidth = "350px"; // control width
        productCards[0].style.flex = "0 1 auto"; // prevent stretching
    } else {
        productList.style.display = "";
        productList.style.justifyContent = "";
        productCards.forEach(card => {
            card.style.maxWidth = "";
            card.style.flex = "";
        });
    }
}
