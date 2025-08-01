document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const phone = document.getElementById("phone").value.trim();
    const cncode = document.getElementById("country-code").value;
    const phonenum = cncode + phone;

    if (!name || !email || !password || !confirmPassword || !phone) {
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

    fetch("https://bmastermart.onrender.com/registerS.php", {
        method: "POST",
        header: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            uname: name,
            email: email,
            password: password,
            phone: phonenum
        })
    })
        .then(res => res.text())
        .then(response => {
            alert("Server response: " + response);
            if (response.includes("already")) {
                document.getElementById("email").focus();
            }
            if (response.includes("successfully")) {
                document.getElementById("registerForm").reset();
            }
        })
        .catch(err => {
            console.log("Error: ", err);
            alert("Something went wrong");
        })
});

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
