document.addEventListener("DOMContentLoaded", () => {
    const searchToggleBtn = document.getElementById("searchToggleBtn");
    const floatingSearch = document.getElementById("floatingSearch");
    const profileDropdown = document.getElementById("profileDropdown");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    const searchInput = document.getElementById("searchInput");

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

                // Reset input and hide clear button
                searchInput.value = "";
                clearSearchBtn.style.display = "none";

                // ✅ Restore all product cards
                document.querySelectorAll(".product-card").forEach(card => {
                    card.style.display = "block";
                });
            }
        });
    }

    // 🔍 Search filtering
    searchInput.addEventListener("keyup", function () {
        const query = this.value.toLowerCase().trim();
        const productCards = document.querySelectorAll(".product-card");

        productCards.forEach(card => {
            const productName = card.querySelector(".product-name");
            if (productName && productName.textContent.toLowerCase().includes(query)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });

        // Show or hide clear button
        clearSearchBtn.style.display = query.length > 0 ? "inline" : "none";
        //adjustcardwithonsarch()
    });

    // ❌ Clear search input and reset cards
    clearSearchBtn.addEventListener("click", function () {
        searchInput.value = "";
        clearSearchBtn.style.display = "none";

        document.querySelectorAll(".product-card").forEach(card => {
            card.style.display = "block";
        });
    });
});
