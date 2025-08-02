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
});
