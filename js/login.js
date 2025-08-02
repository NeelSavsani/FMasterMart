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

    // ✅ Firebase Auth Login (v8 syntax)
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("✅ Login successful:", user);

            alert("✅ Login successful");

            // Optional: Redirect
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Login error full:", error);
            let code = error.code;
            console.log(error.code);
            switch (code) {
                case 'auth/user-not-found':
                    alert('🚫 User not found. Please register.');
                    break;
                case 'auth/wrong-password':
                    alert('❌ Invalid password.');
                    break;
                case 'auth/invalid-email':
                    alert('⚠️ Invalid email format.');
                    break;
                case 'auth/too-many-requests':
                    alert('⚠️ Too many failed attempts. Please try later.');
                    break;
                case 'auth/internal-error':
                    alert('⚠️ Internal error. Please try again later or Try registering.');
                    break;
                default:
                    alert('❌ Login failed. Please check your credentials.');
                    break;
            }
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
