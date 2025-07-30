document.addEventListener("DOMContentLoaded", () => {
    const searchToggleBtn = document.getElementById("searchToggleBtn");
    const floatingSearch = document.getElementById("floatingSearch");
    const profileDropdown = document.getElementById("profileDropdown");

    if (searchToggleBtn && floatingSearch && profileDropdown) {
        searchToggleBtn.addEventListener("click", () => {
            profileDropdown.classList.remove("show");
            floatingSearch.classList.toggle("show");

            const icon = searchToggleBtn.querySelector("i");
            if (floatingSearch.classList.contains("show")) {
                icon.classList.remove("fa-magnifying-glass");
                icon.classList.add("fa-xmark");
            } else {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-magnifying-glass");
            }
        });
    }

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

function devFolio() {
    window.open('https://neelsavsani.vercel.app', '_blank');
}

function updateCartBadge(count) {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;

    badge.textContent = count > 0 ? count : "";
    badge.style.display = count > 0 ? "inline-block" : "none";
}
