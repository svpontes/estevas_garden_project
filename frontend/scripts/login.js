const API_BASE = "https://estevas-garden-project.onrender.com/auth";
// local: const API_BASE = "http://localhost:8080/auth";

const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const profileBtn = document.getElementById("profile-btn");
const loginMessage = document.getElementById("login-message");
const welcomeMsg = document.getElementById("welcome-msg");
const profileData = document.getElementById("profile-data");

const loginArea = document.getElementById("login-area");
const userArea = document.getElementById("user-area");

// Check login state on load
window.onload = () => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    loginArea.style.display = "none";
    userArea.style.display = "block";
    welcomeMsg.style.display = "block";
    welcomeMsg.innerText = `Welcome back!`;
    profileBtn.disabled = false;
  } else {
    profileBtn.disabled = true;
    welcomeMsg.style.display = "none";
  }
};

// LOGIN FUNCTION
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (res.ok && data.token) {
    localStorage.setItem("auth_token", data.token);

    loginMessage.innerText = "Login successful!";
    loginArea.style.display = "none";
    userArea.style.display = "block";
    
    welcomeMsg.style.display = "block";
    welcomeMsg.innerText = `Welcome, ${email}!`;

    profileBtn.disabled = false;
  } else {
    loginMessage.innerText = "Invalid credentials.";
  }
});

// CHECK PROFILE (Protected Route)
profileBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("auth_token");

  const res = await fetch(`${API_BASE}/profile`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });

  const data = await res.json();
  profileData.innerText = JSON.stringify(data, null, 2);
});

// LOGOUT FUNCTION
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("auth_token");
  loginArea.style.display = "block";
  userArea.style.display = "none";

  welcomeMsg.style.display = "none";
  profileData.innerText = "";
  loginMessage.innerText = "You have logged out.";

  profileBtn.disabled = true;
});

// REGISTER FUNCTION
document.getElementById("register-btn").addEventListener("click", async () => {
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();

  if (res.ok) {
    document.getElementById("register-message").innerText = "User created successfully! Now login.";
  } else {
    document.getElementById("register-message").innerText = data.error || "Could not create account";
  }
});
