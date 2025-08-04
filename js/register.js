// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDTkV-Tz1ukcViGLoHzkKGII7Uw-EOoN0w",
    authDomain: "mastermart-19050.firebaseapp.com",
    projectId: "mastermart-19050",
    databaseURL: "https://mastermart-19050-default-rtdb.asia-southeast1.firebasedatabase.app",
    storageBucket: "mastermart-19050.appspot.com",
    messagingSenderId: "724870756192",
    appId: "1:724870756192:web:913ef96cf4215427f01005"
};

firebase.initializeApp(firebaseConfig);

// Form submit event
document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const fullName = `${firstName} ${lastName}`;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const phone = document.getElementById("phone").value.trim();
    const cncode = document.getElementById("country-code").value;
    const phonenum = cncode + phone;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
        alert("All fields are required.");
        return;
    }

    if (cncode === "-1") {
        alert("Please select country code");
        return;
    }

    if (!/^\d{10}$/.test(phone)) {
        alert("Phone number must be exactly 10 digits.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Password and Confirm Password do not match.");
        return;
    }

    // ✅ Step 1: Create user in Firebase Auth
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            const uid = user.uid;

            // ✅ Step 2: Store additional details in Realtime Database
            const userData = {
                uid: uid,
                first_name: firstName,
                last_name: lastName,
                full_name: fullName,
                email: email,
                password: password, // ⚠️ still plain text
                phone: phonenum,
                registration_date: new Date().toISOString(),
                user_type: "customer"
            };

            return firebase.database().ref("users/" + uid).set(userData);
        })
        .then(() => {
            alert("Registration successful!");
            document.getElementById("registerForm").reset();
            window.location.href = "index.html"; // or login.html
        })
        .catch(error => {
            console.error("Registration error:", error.message);
            alert("Registration failed: " + error.message);
        });
});

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach((toggle) => {
    toggle.addEventListener("click", function () {
        const inputId = this.getAttribute("toggle");
        const input = document.querySelector(inputId);

        if (input.type === "password") {
            input.type = "text";
            this.querySelector("i").classList.remove("fa-eye");
            this.querySelector("i").classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            this.querySelector("i").classList.remove("fa-eye-slash");
            this.querySelector("i").classList.add("fa-eye");
        }
    });
});
