firebase.auth().onAuthStateChanged(function (user) {
    const loginMenuItem = document.getElementById('loginMenuItem');
    const loginBtn = document.getElementById('login');
    if (!loginMenuItem || !loginBtn) return;

    if (user) {
        loginMenuItem.innerText = "Logout";
        loginBtn.onclick = function (e) {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                window.location.reload();
            });
        };
    } else {
        loginMenuItem.innerText = "Login";
        loginBtn.onclick = function () {
            window.location.href = "/register.html";
        };
    }

    if (user) {
        const uid = user.uid;

        // Read 'full_name' from Realtime Database
        firebase.database().ref("users/" + uid + "/full_name").once("value")
            .then((snapshot) => {
                const fullName = snapshot.val();
                const nameElement = document.getElementById("name");
                if (nameElement && fullName) {
                    nameElement.textContent = fullName;
                }
            })
            .catch((error) => {
                console.error("Error fetching full name:", error);
            });
    }
});
