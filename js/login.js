document.getElementById("loginForm").addEventListener("submit",
    function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("All fields are required");
            return;
        }
        fetch("https://bmastermart.onrender.com/loginS.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                email: email,
                password: password
            })
        })
            .then(res => res.text())
            .then(response => {
                alert("Server response " + response);
                if (response.toLowerCase().includes("success")) {
                    window.location.href = "index.html";
                }
            })
            .catch(err => {
                console.log("Error: ", err);
                alert("Something went Wrong");
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