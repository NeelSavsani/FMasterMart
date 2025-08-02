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

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("All fields are required");
        return;
    }

    // ✅ Firebase Auth Login
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;

            // ✅ Optional: fetch user profile from Realtime DB
            return firebase.database().ref("users/" + user.uid).once("value");
        })
        .then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                console.log("User data:", userData);
                // You can store user info in localStorage or sessionStorage if needed
            }
            alert("Login successful!");
            window.location.href = "index.html";
        })
        .catch(error => {
            console.error("Login error:", error);

            let msg = "Login failed. Please try again.";

            try {
                // Firebase SDK errors (standard)
                if (
                    error.code === "auth/user-not-found" ||
                    error.code === "auth/wrong-password"
                ) {
                    msg = "Invalid email or password.";
                } else if (error.code === "auth/invalid-email") {
                    msg = "Please enter a valid email address.";
                } else if (error.code === "auth/too-many-requests") {
                    msg = "Too many attempts. Please wait and try again.";
                }

                // Defensive fallback for REST-style response
                if (error.message?.includes("INVALID_LOGIN_CREDENTIALS")) {
                    msg = "Invalid email or password.";
                }

            } catch (e) {
                console.warn("Unknown login error format", e);
            }

            alert(msg);
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
