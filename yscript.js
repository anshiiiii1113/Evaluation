// ===================================================
// StreamScout — JavaScript Core (yscript.js)
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
  setupSearchListener();
  checkLoginState();
});

// --- POPUP SIGN IN LOGIC ---
function openPopup() {
  const popup = document.getElementById("signinPopup");
  popup.style.display = "flex";
}

function closePopup() {
  const popup = document.getElementById("signinPopup");
  popup.style.display = "none";
}

function loginUser(event) {
  event.preventDefault();
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const submitBtn = document.getElementById("loginSubmitBtn");

  const email = emailInput ? emailInput.value : "scout@stream.com";
  const username = email.split("@")[0];

  // Button loading feedback
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = "Signing in...";
  submitBtn.disabled = true;

  setTimeout(() => {
    // Success feedback
    submitBtn.innerHTML = "Verified!";
    submitBtn.style.background = "#2ecc71";
    submitBtn.style.color = "#fff";

    setTimeout(() => {
      // Save user to localStorage
      localStorage.setItem("streamscout_user", username);

      // Close popup
      closePopup();

      // Reset button
      submitBtn.disabled = false;
      submitBtn.style.background = "";
      submitBtn.style.color = "";
      submitBtn.innerHTML = originalText;

      // Clear fields
      if (emailInput) emailInput.value = "";
      if (passwordInput) passwordInput.value = "";

      // Show welcome toast notification
      showToast(`Welcome back, ${username}! Sign in successful.`);

      // Update header
      checkLoginState();
    }, 500);
  }, 700);
}

function checkLoginState() {
  const user = localStorage.getItem("streamscout_user");
  const signinBtn = document.querySelector(".signin-btn");

  if (user && signinBtn) {
    signinBtn.innerHTML = `Hi, ${user} <span style="margin-left:6px; cursor:pointer;" onclick="logoutUser(event)" title="Sign Out">✕</span>`;
    signinBtn.onclick = null;
  }
}

function logoutUser(e) {
  e.stopPropagation();
  localStorage.removeItem("streamscout_user");
  const signinBtn = document.querySelector(".signin-btn");
  if (signinBtn) {
    signinBtn.innerHTML = "Sign In";
    signinBtn.onclick = openPopup;
  }
  showToast("You have been signed out.");
}

// --- FLOATING TOAST NOTIFICATION ---
function showToast(message) {
  const oldToast = document.getElementById("creativeToast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.id = "creativeToast";
  toast.innerHTML = `
    <div class="toast-card">
      <i class="fa-solid fa-bolt toast-bolt"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("active"), 20);

  setTimeout(() => {
    toast.classList.remove("active");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- LIVE SEARCH FUNCTIONALITY ---
function setupSearchListener() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    // Live filter as user types
    searchInput.addEventListener("input", (e) => {
      filterMovies(e.target.value);
    });

    // Handle Enter key
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    });
  }
}

function handleSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;
  const query = searchInput.value.trim();

  filterMovies(query);

  // Smooth scroll to the movies section
  const moviesSection = document.getElementById("movies");
  if (moviesSection) {
    moviesSection.scrollIntoView({ behavior: "smooth" });
  }
}

function filterMovies(query) {
  const cards = document.querySelectorAll("#movieCards .card");
  const term = query.toLowerCase().trim();

  cards.forEach(card => {
    const title = card.getAttribute("data-title") || card.querySelector("h3").textContent;
    const desc = card.querySelector("p").textContent;

    if (title.toLowerCase().includes(term) || desc.toLowerCase().includes(term)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// --- MODAL CLOSE HANDLERS ---
window.onclick = function(event) {
  const popup = document.getElementById("signinPopup");
  if (event.target === popup) {
    closePopup();
  }
};

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePopup();
  }
});