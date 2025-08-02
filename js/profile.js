firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const uid = user.uid;
    const userRef = firebase.database().ref("users/" + uid);

    // Load existing user data
    userRef.once("value").then(snapshot => {
        const data = snapshot.val() || {};
        document.getElementById("firstName").value = data.first_name || '';
        document.getElementById("lastName").value = data.last_name || '';
        document.getElementById("email").value = data.email || '';
        document.getElementById("phone").value = data.phone || '';
        document.getElementById("gender").value = data.gender || '';
        document.getElementById("street").value = data.street || '';
        document.getElementById("city").value = data.city || '';
        document.getElementById("state").value = data.state || '';
        document.getElementById("pincode").value = data.pincode || '';
        document.getElementById("country").value = data.country || '';
    });

    // Validate and Save Personal Info
    document.getElementById("personalForm").addEventListener("submit", e => {
        e.preventDefault();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const gender = document.getElementById("gender").value.trim();
        const fullName = `${firstName} ${lastName}`;

        if (!firstName || !lastName || !phone || !gender) {
            alert("Please fill in all personal information fields.");
            return;
        }

        userRef.update({
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            gender: gender
        }).then(() => alert("Personal info updated."));
    });

    // Validate and Save Address Info
    document.getElementById("addressForm").addEventListener("submit", e => {
        e.preventDefault();

        const street = document.getElementById("street").value.trim();
        const city = document.getElementById("city").value.trim();
        const state = document.getElementById("state").value.trim();
        const pincode = document.getElementById("pincode").value.trim();
        const country = document.getElementById("country").value.trim();

        if (!street || !city || !state || !pincode || !country) {
            alert("Please fill in all address fields.");
            return;
        }

        userRef.update({
            street: street,
            city: city,
            state: state,
            pincode: pincode,
            country: country
        }).then(() => alert("Address updated."));
    });
});

// Tab switching
function switchTab(tabId) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.querySelector(`.tab[onclick*='${tabId}']`).classList.add("active");
    document.getElementById(tabId).classList.add("active");
}
