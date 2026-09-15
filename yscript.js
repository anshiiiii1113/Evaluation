
// document.addEventListener("DOMContentLoaded", () => {
//   setupSearchListener();
//   checkLoginState();
// });

// // --- POPUP SIGN IN LOGIC ---
// function openPopup() {
//   const popup = document.getElementById("signinPopup");
//   popup.style.display = "flex";
// }

// function closePopup() {
//   const popup = document.getElementById("signinPopup");
//   popup.style.display = "none";
// }

// function loginUser(event) {
//   event.preventDefault();
//   const emailInput = document.getElementById("loginEmail");
//   const passwordInput = document.getElementById("loginPassword");
//   const submitBtn = document.getElementById("loginSubmitBtn");

//   const email = emailInput ? emailInput.value : "scout@stream.com";
//   const username = email.split("@")[0];

//   // Button loading feedback
//   const originalText = submitBtn.innerHTML;
//   submitBtn.innerHTML = "Signing in...";
//   submitBtn.disabled = true;

//   setTimeout(() => {
//     // Success feedback
//     submitBtn.innerHTML = "Verified!";
//     submitBtn.style.background = "#2ecc71";
//     submitBtn.style.color = "#fff";

//     setTimeout(() => {
//       // Save user to localStorage
//       localStorage.setItem("streamscout_user", username);

//       // Close popup
//       closePopup();

//       // Reset button
//       submitBtn.disabled = false;
//       submitBtn.style.background = "";
//       submitBtn.style.color = "";
//       submitBtn.innerHTML = originalText;

//       // Clear fields
//       if (emailInput) emailInput.value = "";
//       if (passwordInput) passwordInput.value = "";

//       // Show welcome toast notification
//       showToast(`Welcome back, ${username}! Sign in successful.`);

//       // Update header
//       checkLoginState();
//     }, 500);
//   }, 700);
// }

// function checkLoginState() {
//   const user = localStorage.getItem("streamscout_user");
//   const signinBtn = document.querySelector(".signin-btn");

//   if (user && signinBtn) {
//     signinBtn.innerHTML = `Hi, ${user} <span style="margin-left:6px; cursor:pointer;" onclick="logoutUser(event)" title="Sign Out">✕</span>`;
//     signinBtn.onclick = null;
//   }
// }

// function logoutUser(e) {
//   e.stopPropagation();
//   localStorage.removeItem("streamscout_user");
//   const signinBtn = document.querySelector(".signin-btn");
//   if (signinBtn) {
//     signinBtn.innerHTML = "Sign In";
//     signinBtn.onclick = openPopup;
//   }
//   showToast("You have been signed out.");
// }

// // --- FLOATING TOAST NOTIFICATION ---
// function showToast(message) {
//   const oldToast = document.getElementById("creativeToast");
//   if (oldToast) oldToast.remove();

//   const toast = document.createElement("div");
//   toast.id = "creativeToast";
//   toast.innerHTML = `
//     <div class="toast-card">
//       <i class="fa-solid fa-bolt toast-bolt"></i>
//       <span>${message}</span>
//     </div>
//   `;
//   document.body.appendChild(toast);

//   setTimeout(() => toast.classList.add("active"), 20);

//   setTimeout(() => {
//     toast.classList.remove("active");
//     setTimeout(() => toast.remove(), 300);
//   }, 3500);
// }

// // --- LIVE SEARCH FUNCTIONALITY ---
// function setupSearchListener() {
//   const searchInput = document.getElementById("searchInput");
//   if (searchInput) {
//     // Live filter as user types
//     searchInput.addEventListener("input", (e) => {
//       filterMovies(e.target.value);
//     });

//     // Handle Enter key
//     searchInput.addEventListener("keydown", (e) => {
//       if (e.key === "Enter") {
//         handleSearch();
//       }
//     });
//   }
// }

// function handleSearch() {
//   const searchInput = document.getElementById("searchInput");
//   if (!searchInput) return;
//   const query = searchInput.value.trim();

//   filterMovies(query);

//   // Smooth scroll to the movies section
//   const moviesSection = document.getElementById("movies");
//   if (moviesSection) {
//     moviesSection.scrollIntoView({ behavior: "smooth" });
//   }
// }

// function filterMovies(query) {
//   const cards = document.querySelectorAll("#movieCards .card");
//   const term = query.toLowerCase().trim();

//   cards.forEach(card => {
//     const title = card.getAttribute("data-title") || card.querySelector("h3").textContent;
//     const desc = card.querySelector("p").textContent;

//     if (title.toLowerCase().includes(term) || desc.toLowerCase().includes(term)) {
//       card.style.display = "block";
//     } else {
//       card.style.display = "none";
//     }
//   });
// }

// // --- MODAL CLOSE HANDLERS ---
// window.onclick = function(event) {
//   const popup = document.getElementById("signinPopup");
//   if (event.target === popup) {
//     closePopup();
//   }
// };

// window.addEventListener("keydown", (e) => {
//   if (e.key === "Escape") {
//     closePopup();
//   }
// });


// ===================================================
// StreamScout — JavaScript Core with TMDB & Debouncing
// ===================================================

// --- 1. TMDB API CONFIGURATION ---
const TMDB_API_KEY = "f620fae6c8fb8e90de690762e7575d17"; // 👈 Your TMDB Key is active!
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// Fallback backup movies (used if network is disconnected)
const BACKUP_MOVIES = [
  {
    id: 1,
    title: "Into the Multiverse",
    genre: "Action • Adventure",
    rating: 8.9,
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    rank: "01"
  },
  {
    id: 2,
    title: "Night City",
    genre: "Thriller • Mystery",
    rating: 8.7,
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80",
    rank: "02"
  },
  {
    id: 3,
    title: "Beyond Space",
    genre: "Sci-Fi • Drama",
    rating: 8.6,
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    rank: "03"
  },
  {
    id: 4,
    title: "Dark Horizon",
    genre: "Action • Fantasy",
    rating: 8.5,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    rank: "04"
  }
];

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
  setupSearchWithDebounce();
  fetchTrendingMovies();
  checkLoginState();
});

// --- 2. DEBOUNCE UTILITY FUNCTION ---
/**
 * Debouncing delays the execution of searchTMDB until the user
 * stops typing for 500ms, preventing spamming the TMDB API.
 */
function debounce(func, delay = 500) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId); // Clears the previous timer on each keystroke
    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// --- 3. FETCH LIVE TRENDING MOVIES FROM TMDB ---
async function fetchTrendingMovies() {
  const container = document.getElementById("movieCards");
  if (!container) return;

  try {
    container.innerHTML = `
      <div class="api-loading">
        <i class="fa-solid fa-circle-notch fa-spin"></i> Loading Trending Titles from TMDB...
      </div>
    `;

    const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const formatted = data.results.slice(0, 8).map((m, index) => ({
      id: m.id,
      title: m.title || m.original_title,
      genre: `Release: ${m.release_date ? m.release_date.split('-')[0] : '2024'}`,
      rating: m.vote_average ? m.vote_average.toFixed(1) : "8.0",
      poster: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : BACKUP_MOVIES[0].poster,
      rank: String(index + 1).padStart(2, '0')
    }));

    renderMovies(formatted);
  } catch (error) {
    console.error("TMDB fetch failed, rendering fallback:", error);
    renderMovies(BACKUP_MOVIES);
  }
}

// --- 4. SEARCH TMDB MOVIES WITH DEBOUNCE ---
async function searchTMDB(query) {
  const container = document.getElementById("movieCards");
  const heading = document.querySelector("#movies .heading h2");
  if (!container) return;

  const trimmed = query.trim();

  // Reset to trending if the search bar is emptied
  if (!trimmed) {
    if (heading) heading.innerHTML = `Trending <span>Movies</span>`;
    fetchTrendingMovies();
    return;
  }

  if (heading) heading.innerHTML = `Search Results for <span>"${trimmed}"</span>`;

  try {
    container.innerHTML = `
      <div class="api-loading">
        <i class="fa-solid fa-spinner fa-spin"></i> Searching TMDB for "${trimmed}"...
      </div>
    `;

    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(trimmed)}`
    );
    if (!response.ok) throw new Error(`Search error! status: ${response.status}`);

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      container.innerHTML = `
        <div class="api-empty">
          <i class="fa-solid fa-film"></i>
          <h3>No movies found for "${trimmed}"</h3>
          <p>Try searching for titles like "Spider-Man", "Batman", or "Avengers".</p>
        </div>
      `;
      return;
    }

    const formatted = data.results.slice(0, 8).map((m, index) => ({
      id: m.id,
      title: m.title || m.original_title,
      genre: `Release: ${m.release_date ? m.release_date.split('-')[0] : 'N/A'}`,
      rating: m.vote_average ? m.vote_average.toFixed(1) : "N/A",
      poster: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : BACKUP_MOVIES[0].poster,
      rank: String(index + 1).padStart(2, '0')
    }));

    renderMovies(formatted);
  } catch (error) {
    console.error("Search error:", error);
    container.innerHTML = `
      <div class="api-empty">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>Search request failed</h3>
        <p>Please check your internet connection.</p>
      </div>
    `;
  }
}

// Render dynamic movie cards
function renderMovies(movieList) {
  const container = document.getElementById("movieCards");
  if (!container) return;

  container.innerHTML = "";
  movieList.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-title", movie.title);

    card.innerHTML = `
      <div class="poster" style="background-image: linear-gradient(to top, rgba(8, 8, 8, 0.92) 0%, rgba(8, 8, 8, 0.2) 60%, transparent 100%), url('${movie.poster}'); background-size: cover; background-position: center;">
        <span class="card-badge">TOP ${parseInt(movie.rank, 10)}</span>
        <span class="poster-num">${movie.rank}</span>
      </div>
      <div class="card-body">
        <h3>${movie.title}</h3>
        <p><i class="fa-solid fa-star"></i> ${movie.rating} • ${movie.genre}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- 5. SETUP SEARCH INPUT WITH DEBOUNCE (500ms) ---
function setupSearchWithDebounce() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  if (!searchInput) return;

  // 500ms Debounce: fires ONLY 500ms after the user pauses typing
  const debouncedSearchHandler = debounce((event) => {
    searchTMDB(event.target.value);
  }, 500);

  // Live input listening with debouncing
  searchInput.addEventListener("input", debouncedSearchHandler);

  // Immediate search on Enter key
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchTMDB(searchInput.value);
      scrollToMovies();
    }
  });

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      searchTMDB(searchInput.value);
      scrollToMovies();
    });
  }
}

function scrollToMovies() {
  const moviesSection = document.getElementById("movies");
  if (moviesSection) {
    moviesSection.scrollIntoView({ behavior: "smooth" });
  }
}

// --- 6. SIGN IN POPUP & TOAST NOTIFICATION ---
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

  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Signing in...`;
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.innerHTML = "Verified!";
    submitBtn.style.background = "#2ecc71";
    submitBtn.style.color = "#fff";

    setTimeout(() => {
      localStorage.setItem("streamscout_user", username);
      closePopup();

      submitBtn.disabled = false;
      submitBtn.style.background = "";
      submitBtn.style.color = "";
      submitBtn.innerHTML = originalText;

      if (emailInput) emailInput.value = "";
      if (passwordInput) passwordInput.value = "";

      showToast(`Welcome back, ${username}! Sign in successful.`);
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

// Window click & Escape key handlers
window.onclick = function (event) {
  const popup = document.getElementById("signinPopup");
  if (event.target === popup) closePopup();
};

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopup();
});