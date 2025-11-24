//Constantes e seletores
const API_BASE = "https://estevas-garden-project.onrender.com/auth";

const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const profileBtn = document.getElementById("profile-btn");
const registerBtn = document.getElementById("register-btn");

const loginMessage = document.getElementById("login-message");
const welcomeMsg = document.getElementById("welcome-msg");
const profileData = document.getElementById("profile-data");

const loginArea = document.getElementById("login-area");
const userArea = document.getElementById("user-area");

// ----------------------------
// STEP 1: Captura o token vindo do GitHub OAuth (?token=xxx)
// ----------------------------
(function handleOAuthRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromOAuth = urlParams.get("token");

  if (tokenFromOAuth) {
    console.log("OAuth token capturado:", tokenFromOAuth);

    localStorage.setItem("auth_token", tokenFromOAuth);

    // Remove token da URL para não expor
    window.history.replaceState({}, document.title, window.location.pathname);
  }
})();

// ----------------------------
// STEP 2: Ajusta UI quando página carrega
// ----------------------------
window.onload = () => {
  const token = localStorage.getItem("auth_token");

  if (token) {
    loginArea.style.display = "none";
    userArea.style.display = "block";

    const payload = decodeJwt(token);
    welcomeMsg.style.display = "block";
    welcomeMsg.innerText = `Welcome, ${payload?.name || "User"} 👋`;

    profileBtn.disabled = false;
  } else {
    profileBtn.disabled = true;
    welcomeMsg.style.display = "none";
  }
};

// Helper para decodificar JWT sem biblioteca
function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

// ----------------------------
// Login com usuário/password
// ----------------------------
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

// ----------------------------
// Ver Perfil (rota protegida)
// ----------------------------
profileBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("auth_token");

  const res = await fetch(`${API_BASE}/profile`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!res.ok) {
    profileData.innerText = "Session expired. Please login again.";
    logoutBtn.click();
    return;
  }

  const data = await res.json();
  profileData.innerText = JSON.stringify(data, null, 2);
});

// ----------------------------
// Logout
// ----------------------------
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("auth_token");
  loginArea.style.display = "block";
  userArea.style.display = "none";

  profileData.innerText = "";
  welcomeMsg.innerText = "";
  loginMessage.innerText = "You have logged out.";

  welcomeMsg.style.display = "none";
  profileData.style.display = "none";
  profileBtn.disabled = true;
});

// ----------------------------
// Register new user
// ----------------------------
registerBtn.addEventListener("click", async () => {
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();

  document.getElementById("register-message").innerText = 
    res.ok ? "User created successfully! Now login." 
           : (data.error || "Could not create account");
});
