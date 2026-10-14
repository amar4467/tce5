// Import the Firebase SDK modules from Google CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase Project Credentials for cloud-firebase-d4e35
const firebaseConfig = {
  apiKey: "AIzaSyDcCKDcPhSEOl0MdLQwPe2PpwYE6M77VSM",
  authDomain: "cloud-firebase-d4e35.firebaseapp.com",
  projectId: "cloud-firebase-d4e35",
  storageBucket: "cloud-firebase-d4e35.firebasestorage.app",
  messagingSenderId: "782364844788",
  appId: "1:782364844788:web:295e7bbb0d5cc4e24034a1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// DOM Elements
const authContainer = document.getElementById("auth-container");
const userDashboard = document.getElementById("user-dashboard");
const loginForm = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
const googleBtn = document.getElementById("google-btn");
const signoutBtn = document.getElementById("signout-btn");
const statusMessage = document.getElementById("status-message");

// User Profile Elements
const userAvatar = document.getElementById("user-avatar");
const avatarFallback = document.getElementById("avatar-fallback");
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const userUid = document.getElementById("user-uid");
const userProvider = document.getElementById("user-provider");

// UI Helpers
function showMessage(text, type = "error") {
  statusMessage.textContent = text;
  statusMessage.className = `status-box ${type}`;
  statusMessage.classList.remove("hidden");
}

function clearMessage() {
  statusMessage.textContent = "";
  statusMessage.className = "status-box hidden";
}

// Convert technical Firebase error codes into friendly messages
function getFriendlyErrorMessage(error) {
  console.error("Firebase Auth Error:", error.code, error.message);
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password. Please check your credentials.";
    case "auth/invalid-email":
      return "The email address is formatted incorrectly.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Access to this account has been temporarily disabled due to many failed login attempts.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completing.";
    case "auth/operation-not-allowed":
    case "auth/configuration-not-found":
      return "Sign-in provider is not enabled in Firebase Console. Go to Authentication > Sign-in method in Firebase Console.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized. Add it under Firebase Authentication > Settings > Authorized domains.";
    default:
      return error.message || "An unexpected error occurred during authentication.";
  }
}

// 1. Email & Password Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginForm.reset();
  } catch (error) {
    showMessage(getFriendlyErrorMessage(error), "error");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Log In";
  }
});

// 2. Google Sign In
googleBtn.addEventListener("click", async () => {
  clearMessage();
  const googleBtnSpan = googleBtn.querySelector("span");
  const originalText = googleBtnSpan ? googleBtnSpan.textContent : "Continue with Google";

  googleBtn.disabled = true;
  if (googleBtnSpan) googleBtnSpan.textContent = "Connecting to Google...";

  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Logged in user:", result.user);
  } catch (error) {
    showMessage(getFriendlyErrorMessage(error), "error");
  } finally {
    googleBtn.disabled = false;
    if (googleBtnSpan) googleBtnSpan.textContent = originalText;
  }
});

// 3. Log Out
signoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    alert("Error logging out: " + error.message);
  }
});

// 4. Auth State Observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    authContainer.classList.add("hidden");
    userDashboard.classList.remove("hidden");

    userName.textContent = user.displayName || "User";
    userEmail.textContent = user.email || "No email available";
    userUid.textContent = user.uid;

    const providerId = user.providerData[0]?.providerId || "password";
    userProvider.textContent = providerId === "google.com" ? "Google" : "Email / Password";

    if (user.photoURL) {
      userAvatar.src = user.photoURL;
      userAvatar.classList.remove("hidden");
      avatarFallback.classList.add("hidden");
    } else {
      userAvatar.classList.add("hidden");
      avatarFallback.classList.remove("hidden");
      avatarFallback.textContent = (user.email ? user.email[0] : "U").toUpperCase();
    }
  } else {
    // User is logged out
    authContainer.classList.remove("hidden");
    userDashboard.classList.add("hidden");
    clearMessage();
  }
});
