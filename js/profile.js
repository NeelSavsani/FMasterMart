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
    document.getElementById("firstName").value = data.firstName || '';
    document.getElementById("lastName").value = data.lastName || '';
    document.getElementById("email").value = data.email || '';
    document.getElementById("phone").value = data.phone || '';
    document.getElementById("gender").value = data.gender || '';
    document.getElementById("street").value = data.street || '';
    document.getElementById("city").value = data.city || '';
    document.getElementById("state").value = data.state || '';
    document.getElementById("pincode").value = data.pincode || '';
    document.getElementById("country").value = data.country || '';
  });

  // Save Personal Info
  document.getElementById("personalForm").addEventListener("submit", e => {
    e.preventDefault();
    userRef.update({
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      phone: document.getElementById("phone").value,
      gender: document.getElementById("gender").value
    }).then(() => alert("Personal info updated."));
  });

  // Save Address Info
  document.getElementById("addressForm").addEventListener("submit", e => {
    e.preventDefault();
    userRef.update({
      street: document.getElementById("street").value,
      city: document.getElementById("city").value,
      state: document.getElementById("state").value,
      pincode: document.getElementById("pincode").value,
      country: document.getElementById("country").value
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
