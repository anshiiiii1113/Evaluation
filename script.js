// ===================================================
// IMDb Clone (Gold & Black Edition) — JavaScript Core
// ===================================================

// Live Ticker News Data (Breaking entertainment & box office)
const TICKER_NEWS = [
  { tag: "BOX OFFICE", text: "Oppenheimer crosses $957M worldwide milestone as awards season continues" },
  { tag: "CRITICS CHOICE", text: "12th Fail bags Best Feature Film and Best Actor honours" },
  { tag: "PRODUCTION", text: "Dune: Messiah officially confirmed by Warner Bros and Denis Villeneuve" },
  { tag: "RECORD", text: "Stree 2 shatters box office records across 3,500+ Indian cinema screens" },
  { tag: "RETROSPECTIVE", text: "The Dark Knight voted #1 cinematic comic book masterpiece of all time" },
  { tag: "UPCOMING", text: "Christopher Nolan secretly scouts IMAX locations for next mystery project" },
  { tag: "GLOBAL HIT", text: "RRR continues worldwide celebration with historic 100M+ international streams" }
];

// Helper: Generates an attractive Gold & Black SVG poster if any remote image is unavailable
function createDummyPosterUrl(title, subtitle, colorScheme = "gold") {
  const primaryBg = colorScheme === "gold" ? "%23141419" : "%230f0f14";
  const accentColor = colorScheme === "gold" ? "%23f5c518" : "%23ffd700";
  const textColor = "%23ffffff";
  const cleanTitle = encodeURIComponent(title);
  const cleanSub = encodeURIComponent(subtitle);

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${primaryBg}"/><stop offset="100%" stop-color="%23060608"/></linearGradient><linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23ffd700"/><stop offset="100%" stop-color="%23b8860b"/></linearGradient></defs><rect width="600" height="900" fill="url(%23g)"/><rect x="25" y="25" width="550" height="850" rx="16" fill="none" stroke="url(%23goldG)" stroke-width="2" stroke-opacity="0.35"/><circle cx="300" cy="380" r="120" fill="%231a1a24" stroke="url(%23goldG)" stroke-width="3" opacity="0.8"/><path d="M280 330 L340 380 L280 430 Z" fill="${accentColor}"/><rect x="240" y="80" width="120" height="34" rx="6" fill="url(%23goldG)"/><text x="300" y="103" fill="%23000" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle" letter-spacing="2">IMDb</text><text x="300" y="620" fill="${textColor}" font-family="sans-serif" font-size="34" font-weight="800" text-anchor="middle">${cleanTitle}</text><text x="300" y="665" fill="${accentColor}" font-family="sans-serif" font-size="20" font-weight="600" text-anchor="middle" opacity="0.9">${cleanSub}</text><text x="300" y="820" fill="%236c6c80" font-family="sans-serif" font-size="16" text-anchor="middle">CINEMA SHOWCASE • 4K UHD</text></svg>`;
}

// Comprehensive Movie Dataset with Dummy Posters, Verified YouTube Trailer IDs & Languages
const MOVIES = [
  // ==========================================
  // SECTION 1: TOP 10 WORLDWIDE BLOCKBUSTERS
  // ==========================================
  {
    id: "top-1",
    title: "Oppenheimer",
    year: 2023,
    rating: 8.9,
    language: "English",
    genre: "Biography, Drama, History",
    duration: "3h 00m",
    director: "Christopher Nolan",
    cast: "Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1400&auto=format&fit=crop&q=80",
    plot: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    trailerId: "uYPbbksJxIg",
    top10Rank: 1
  },
  {
    id: "top-2",
    title: "12th Fail",
    year: 2023,
    rating: 8.9,
    language: "Hindi",
    genre: "Biography, Drama",
    duration: "2h 27m",
    director: "Vidhu Vinod Chopra",
    cast: "Vikrant Massey, Medha Shankar, Anant V Joshi, Priyanshu Chatterjee",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1400&auto=format&fit=crop&q=80",
    plot: "Based on the inspiring real story of IPS officer Manoj Kumar Sharma, who restarted his academic journey and conquered the UPSC exam.",
    trailerId: "weP3p2Wl6t4",
    top10Rank: 2
  },
  {
    id: "top-3",
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    language: "English",
    genre: "Action, Crime, Drama",
    duration: "2h 32m",
    director: "Christopher Nolan",
    cast: "Christian Bale, Heath Ledger, Aaron Eckhart, Michael Caine",
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1400&auto=format&fit=crop&q=80",
    plot: "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological and physical tests.",
    trailerId: "EXeTwQWrcwY",
    top10Rank: 3
  },
  {
    id: "top-4",
    title: "3 Idiots",
    year: 2009,
    rating: 8.4,
    language: "Hindi",
    genre: "Comedy, Drama",
    duration: "2h 50m",
    director: "Rajkumar Hirani",
    cast: "Aamir Khan, R. Madhavan, Sharman Joshi, Kareena Kapoor",
    poster: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1400&auto=format&fit=crop&q=80",
    plot: "Two friends search for their long-lost companion Rancho, revisiting memories of a brilliant thinker who changed their perspectives forever.",
    trailerId: "K0eDlFX9GMc",
    top10Rank: 4
  },
  {
    id: "top-5",
    title: "Inception",
    year: 2010,
    rating: 8.8,
    language: "English",
    genre: "Action, Adventure, Sci-Fi",
    duration: "2h 28m",
    director: "Christopher Nolan",
    cast: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1400&auto=format&fit=crop&q=80",
    plot: "A thief who steals corporate secrets through dream-sharing technology is tasked with planting an idea into a CEO's mind.",
    trailerId: "YoHD9XEInc0",
    top10Rank: 5
  },
  {
    id: "top-6",
    title: "RRR",
    year: 2022,
    rating: 8.0,
    language: "Hindi",
    genre: "Action, Drama",
    duration: "3h 07m",
    director: "S.S. Rajamouli",
    cast: "N.T. Rama Rao Jr., Ram Charan, Ajay Devgn, Alia Bhatt",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&auto=format&fit=crop&q=80",
    plot: "A fearless revolutionary and a British officer embark on an epic journey before joining together in an all-out rebellion.",
    trailerId: "GY4BgdUSpbE",
    top10Rank: 6
  },
  {
    id: "top-7",
    title: "Interstellar",
    year: 2014,
    rating: 8.7,
    language: "English",
    genre: "Adventure, Drama, Sci-Fi",
    duration: "2h 49m",
    director: "Christopher Nolan",
    cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1400&auto=format&fit=crop&q=80",
    plot: "A team of explorers travel beyond this galaxy through a wormhole to discover whether humanity has a future among the stars.",
    trailerId: "zSWdZVtXT7E",
    top10Rank: 7
  },
  {
    id: "top-8",
    title: "Dangal",
    year: 2016,
    rating: 8.3,
    language: "Hindi",
    genre: "Action, Biography, Drama",
    duration: "2h 41m",
    director: "Nitesh Tiwari",
    cast: "Aamir Khan, Fatima Sana Shaikh, Sanya Malhotra, Sakshi Tanwar",
    poster: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1400&auto=format&fit=crop&q=80",
    plot: "Former wrestler Mahavir Singh Phogat coaches his two daughters to Commonwealth Games glory in defiance of societal norms.",
    trailerId: "x_7YlGv9u1g",
    top10Rank: 8
  },
  {
    id: "top-9",
    title: "Dune: Part Two",
    year: 2024,
    rating: 8.6,
    language: "English",
    genre: "Action, Adventure, Sci-Fi",
    duration: "2h 46m",
    director: "Denis Villeneuve",
    cast: "Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem",
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1400&auto=format&fit=crop&q=80",
    plot: "Paul Atreides unites with Chani and the Fremen to wage holy war against the conspirators who destroyed his dynasty.",
    trailerId: "Way9Dexny3w",
    top10Rank: 9
  },
  {
    id: "top-10",
    title: "Tumbbad",
    year: 2018,
    rating: 8.2,
    language: "Hindi",
    genre: "Drama, Fantasy, Horror",
    duration: "1h 44m",
    director: "Rahi Anil Barve, Anand Gandhi",
    cast: "Sohum Shah, Jyoti Malshe, Anita Date, Ronjini Chakraborty",
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&auto=format&fit=crop&q=80",
    plot: "A dark mythological tale of a family's sinister obsession with Hastar, an entity that grants unlimited gold at a terrifying price.",
    trailerId: "sN75MPxgvX8",
    top10Rank: 10
  },

  // ==========================================
  // SECTION 2: HINDI & BOLLYWOOD CINEMA
  // ==========================================
  {
    id: "hin-1",
    title: "Gangs of Wasseypur",
    year: 2012,
    rating: 8.2,
    language: "Hindi",
    genre: "Action, Comedy, Crime",
    duration: "5h 21m",
    director: "Anurag Kashyap",
    cast: "Manoj Bajpayee, Nawazuddin Siddiqui, Richa Chadha, Tigmanshu Dhulia",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1400&auto=format&fit=crop&q=80",
    plot: "A clash between rival factions ignites a lethal blood feud spanning three generations of coal mafia in Wasseypur.",
    trailerId: "j-5kExw-AjA"
  },
  {
    id: "hin-2",
    title: "Swades",
    year: 2004,
    rating: 8.2,
    language: "Hindi",
    genre: "Drama",
    duration: "3h 30m",
    director: "Ashutosh Gowariker",
    cast: "Shah Rukh Khan, Gayatri Joshi, Kishori Ballal, Rajesh Vivek",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&auto=format&fit=crop&q=80",
    plot: "A brilliant NASA engineer travels to rural India to find his childhood nanny, discovering the power of grassroots change.",
    trailerId: "NC7GSUt_4vI"
  },
  {
    id: "hin-3",
    title: "Andhadhun",
    year: 2018,
    rating: 8.2,
    language: "Hindi",
    genre: "Crime, Mystery, Thriller",
    duration: "2h 19m",
    director: "Sriram Raghavan",
    cast: "Ayushmann Khurrana, Tabu, Radhika Apte, Anil Dhawan",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1400&auto=format&fit=crop&q=80",
    plot: "A piano player pretending to be blind unwittingly witnesses a murder, trapping him in a bizarre web of crime and deceit.",
    trailerId: "2iVYI99VGaw"
  },
  {
    id: "hin-4",
    title: "Sholay",
    year: 1975,
    rating: 8.1,
    language: "Hindi",
    genre: "Action, Adventure, Comedy",
    duration: "3h 24m",
    director: "Ramesh Sippy",
    cast: "Dharmendra, Sanjeev Kumar, Hema Malini, Amitabh Bachchan, Amjad Khan",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400&auto=format&fit=crop&q=80",
    plot: "An ex-cop recruits two charismatic convicts to bring down Gabbar Singh, the ruthless bandit who massacred his family.",
    trailerId: "4Z8kGfL5iH8"
  },
  {
    id: "hin-5",
    title: "Stree 2",
    year: 2024,
    rating: 7.8,
    language: "Hindi",
    genre: "Comedy, Horror",
    duration: "2h 27m",
    director: "Amar Kaushik",
    cast: "Shraddha Kapoor, Rajkummar Rao, Pankaj Tripathi, Abhishek Banerjee",
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1400&auto=format&fit=crop&q=80",
    plot: "The town of Chanderi is haunted by a headless demon Sarkata, forcing Vicky and his quirky team to seek help from the mysterious Stree.",
    trailerId: "kv10w8_x58I"
  },
  {
    id: "hin-6",
    title: "Jawan",
    year: 2023,
    rating: 7.5,
    language: "Hindi",
    genre: "Action, Thriller",
    duration: "2h 49m",
    director: "Atlee",
    cast: "Shah Rukh Khan, Nayanthara, Vijay Sethupathi, Deepika Padukone",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&auto=format&fit=crop&q=80",
    plot: "A man is driven by a personal vendetta to rectify the wrongs in society, while keeping a promise made years ago to his fallen comrades.",
    trailerId: "MWOlnZSnXgw"
  },

  // ==========================================
  // SECTION 3: HOLLYWOOD & ENGLISH CINEMA
  // ==========================================
  {
    id: "eng-1",
    title: "Pulp Fiction",
    year: 1994,
    rating: 8.9,
    language: "English",
    genre: "Crime, Drama",
    duration: "2h 34m",
    director: "Quentin Tarantino",
    cast: "John Travolta, Uma Thurman, Samuel L. Jackson, Bruce Willis",
    poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1400&auto=format&fit=crop&q=80",
    plot: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    trailerId: "s7EdQ4FqbhY"
  },
  {
    id: "eng-2",
    title: "The Godfather",
    year: 1972,
    rating: 9.2,
    language: "English",
    genre: "Crime, Drama",
    duration: "2h 55m",
    director: "Francis Ford Coppola",
    cast: "Marlon Brando, Al Pacino, James Caan, Robert Duvall",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&auto=format&fit=crop&q=80",
    plot: "The aging patriarch of an organized crime dynasty in New York transfers control of his clandestine empire to his reluctant youngest son.",
    trailerId: "sY1S34973zA"
  },
  {
    id: "eng-3",
    title: "Fight Club",
    year: 1999,
    rating: 8.8,
    language: "English",
    genre: "Drama",
    duration: "2h 19m",
    director: "David Fincher",
    cast: "Brad Pitt, Edward Norton, Helena Bonham Carter, Meat Loaf",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1400&auto=format&fit=crop&q=80",
    plot: "An insomniac office worker looking for change crosses paths with a devil-may-care soap maker and forms an underground fight club.",
    trailerId: "qtRKdVHc-cE"
  },
  {
    id: "eng-4",
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    rating: 8.6,
    language: "English",
    genre: "Animation, Action, Adventure",
    duration: "2h 20m",
    director: "Joaquim Dos Santos, Kemp Powers, Justin K. Thompson",
    cast: "Shameik Moore, Hailee Steinfeld, Oscar Isaac, Daniel Kaluuya",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400&auto=format&fit=crop&q=80",
    plot: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.",
    trailerId: "cqGjhVJWtEg"
  },
  {
    id: "eng-5",
    title: "Gladiator II",
    year: 2024,
    rating: 8.1,
    language: "English",
    genre: "Action, Adventure, Drama",
    duration: "2h 28m",
    director: "Ridley Scott",
    cast: "Paul Mescal, Pedro Pascal, Denzel Washington, Connie Nielsen",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&auto=format&fit=crop&q=80",
    plot: "Years after witnessing the death of Maximus, Lucius must enter the Colosseum after his home is conquered by tyrannical emperors.",
    trailerId: "4rgYUipGJNo"
  },
  {
    id: "eng-6",
    title: "The Matrix",
    year: 1999,
    rating: 8.7,
    language: "English",
    genre: "Action, Sci-Fi",
    duration: "2h 16m",
    director: "Lana Wachowski, Lilly Wachowski",
    cast: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format&fit=crop&q=80",
    plot: "A computer hacker learns about the true nature of his reality and his pivotal role in the war against its automated controllers.",
    trailerId: "vKQi3bBA1y8"
  }
];

// App State
let activeHeroMovie = MOVIES[0];
let watchlist = JSON.parse(localStorage.getItem("imdb_gold_watchlist") || "[]");

// DOM Elements
const tickerTrack = document.getElementById("tickerTrack");
const top10Shelf = document.getElementById("top10Shelf");
const hindiShelf = document.getElementById("hindiShelf");
const englishShelf = document.getElementById("englishShelf");
const searchInput = document.getElementById("searchInput");
const searchCategory = document.getElementById("searchCategory");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const searchResultsSection = document.getElementById("searchResultsSection");
const searchGrid = document.getElementById("searchGrid");
const searchKeywordLabel = document.getElementById("searchKeywordLabel");
const noSearchResults = document.getElementById("noSearchResults");
const closeSearchSectionBtn = document.getElementById("closeSearchSectionBtn");
const mainShowcase = document.getElementById("mainShowcase");

// Hero Elements
const heroBackdrop = document.getElementById("heroBackdrop");
const heroTitle = document.getElementById("heroTitle");
const heroRating = document.getElementById("heroRating");
const heroYear = document.getElementById("heroYear");
const heroDuration = document.getElementById("heroDuration");
const heroGenre = document.getElementById("heroGenre");
const heroDesc = document.getElementById("heroDesc");
const heroLangBadge = document.getElementById("heroLangBadge");
const heroTrailerBtn = document.getElementById("heroTrailerBtn");
const heroDetailsBtn = document.getElementById("heroDetailsBtn");
const heroWatchlistBtn = document.getElementById("heroWatchlistBtn");
const miniCardsWrapper = document.getElementById("miniCardsWrapper");

// Watchlist & Modal Elements
const navWatchlistCount = document.getElementById("navWatchlistCount");
const openWatchlistBtn = document.getElementById("openWatchlistBtn");
const watchlistDrawer = document.getElementById("watchlistDrawer");
const closeWatchlistBtn = document.getElementById("closeWatchlistBtn");
const watchlistContent = document.getElementById("watchlistContent");
const movieModal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const trailerModal = document.getElementById("trailerModal");
const trailerWrapper = document.getElementById("trailerWrapper");
const closeTrailerModal = document.getElementById("closeTrailerModal");

// Initialize application
function init() {
  renderTicker();
  updateWatchlistBadge();
  setupHero(MOVIES[0]);
  renderHeroMiniSelector();
  renderTop10Shelf();
  renderHindiShelf();
  renderEnglishShelf();
  setupShelfScrollArrows();
  setupEventListeners();
}

// Render Breaking Live Ticker
function renderTicker() {
  if (!tickerTrack) return;
  // Duplicate array once for seamless infinite loop
  const duplicatedNews = [...TICKER_NEWS, ...TICKER_NEWS];
  tickerTrack.innerHTML = duplicatedNews.map(item => `
    <div class="ticker-item">
      <span class="ticker-tag">[${item.tag}]</span>
      <span class="ticker-text">${item.text}</span>
      <span class="ticker-divider">★</span>
    </div>
  `).join("");
}

// Watchlist Helpers
function updateWatchlistBadge() {
  navWatchlistCount.textContent = watchlist.length;
}

function isWatchlisted(id) {
  return watchlist.includes(id);
}

function toggleWatchlist(movieId) {
  const index = watchlist.indexOf(movieId);
  if (index > -1) {
    watchlist.splice(index, 1);
  } else {
    watchlist.push(movieId);
  }
  localStorage.setItem("imdb_gold_watchlist", JSON.stringify(watchlist));
  updateWatchlistBadge();
  refreshCardWatchlistStates();
  updateHeroWatchlistBtn();
  if (watchlistDrawer.classList.contains("open")) {
    renderWatchlistDrawer();
  }
}

// Hero Setup
function setupHero(movie) {
  if (!movie) return;
  activeHeroMovie = movie;
  heroBackdrop.style.backgroundImage = `url('${movie.backdrop}')`;
  heroTitle.textContent = movie.title;
  heroRating.textContent = movie.rating;
  heroYear.textContent = movie.year;
  heroDuration.textContent = movie.duration;
  heroGenre.textContent = movie.genre;
  heroDesc.textContent = movie.plot;
  heroLangBadge.textContent = movie.language.toUpperCase();

  heroTrailerBtn.onclick = () => playTrailer(movie.trailerId);
  heroDetailsBtn.onclick = () => openMovieModal(movie);
  heroWatchlistBtn.onclick = () => toggleWatchlist(movie.id);

  updateHeroWatchlistBtn();
}

function updateHeroWatchlistBtn() {
  const inList = isWatchlisted(activeHeroMovie.id);
  heroWatchlistBtn.innerHTML = `<i class="fa-solid ${inList ? 'fa-check' : 'fa-plus'}"></i>`;
  heroWatchlistBtn.classList.toggle("active", inList);
}

function renderHeroMiniSelector() {
  const upNext = MOVIES.slice(1, 4);
  miniCardsWrapper.innerHTML = "";
  upNext.forEach(movie => {
    const item = document.createElement("div");
    item.className = "mini-hero-item";
    const dummyFallback = createDummyPosterUrl(movie.title, movie.language);
    item.innerHTML = `
      <img src="${movie.poster}" onerror="this.onerror=null; this.src='${dummyFallback}'" alt="${movie.title}" class="mini-poster" />
      <div class="mini-meta">
        <h4>${movie.title}</h4>
        <p><i class="fa-solid fa-star"></i> ${movie.rating} • ${movie.year}</p>
      </div>
    `;
    item.onclick = () => setupHero(movie);
    miniCardsWrapper.appendChild(item);
  });
}

// Render Top 10 Shelf (Large Numbered Badges)
function renderTop10Shelf() {
  const top10 = MOVIES.filter(m => m.top10Rank).sort((a, b) => a.top10Rank - b.top10Rank);
  top10Shelf.innerHTML = "";

  top10.forEach(movie => {
    const item = document.createElement("div");
    item.className = "top10-item";
    const inList = isWatchlisted(movie.id);
    const dummyFallback = createDummyPosterUrl(movie.title, movie.genre.split(',')[0]);

    item.innerHTML = `
      <div class="rank-number">${movie.top10Rank}</div>
      <div class="movie-card" data-id="${movie.id}">
        <div class="poster-box">
          <img src="${movie.poster}" onerror="this.onerror=null; this.src='${dummyFallback}'" alt="${movie.title}" loading="lazy" />
          <button class="bookmark-ribbon ${inList ? 'active' : ''}" title="Add to Watchlist" data-action="watchlist">
            <i class="fa-solid ${inList ? 'fa-check' : 'fa-plus'}"></i>
          </button>
          <span class="card-lang-tag">${movie.language}</span>
        </div>
        <div class="card-details">
          <div class="card-rating-row">
            <span class="rating-score"><i class="fa-solid fa-star"></i> <strong>${movie.rating}</strong></span>
            <span class="card-year">${movie.year}</span>
          </div>
          <h4 class="card-title" title="${movie.title}">${movie.title}</h4>
          <p class="card-genre-sub">${movie.genre}</p>
          <div class="card-btn-stack">
            <button class="card-watchlist-btn ${inList ? 'active' : ''}" data-action="watchlist">
              <i class="fa-solid ${inList ? 'fa-check' : 'fa-plus'}"></i> Watchlist
            </button>
            <button class="card-trailer-btn" data-action="trailer">
              <i class="fa-solid fa-play"></i> Trailer
            </button>
          </div>
        </div>
      </div>
    `;

    attachCardInteractions(item.querySelector(".movie-card"), movie);
    top10Shelf.appendChild(item);
  });
}

// Render Hindi Shelf
function renderHindiShelf() {
  const hindiMovies = MOVIES.filter(m => m.language === "Hindi");
  renderStandardShelf(hindiShelf, hindiMovies);
}

// Render English Shelf
function renderEnglishShelf() {
  const englishMovies = MOVIES.filter(m => m.language === "English");
  renderStandardShelf(englishShelf, englishMovies);
}

// Render Standard Movie Shelf
function renderStandardShelf(container, movieList) {
  container.innerHTML = "";
  movieList.forEach(movie => {
    const card = createStandardMovieCard(movie);
    container.appendChild(card);
  });
}

function createStandardMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";
  card.setAttribute("data-id", movie.id);
  const inList = isWatchlisted(movie.id);
  const dummyFallback = createDummyPosterUrl(movie.title, movie.genre.split(',')[0]);

  card.innerHTML = `
    <div class="poster-box">
      <img src="${movie.poster}" onerror="this.onerror=null; this.src='${dummyFallback}'" alt="${movie.title}" loading="lazy" />
      <button class="bookmark-ribbon ${inList ? 'active' : ''}" title="Watchlist" data-action="watchlist">
        <i class="fa-solid ${inList ? 'fa-check' : 'fa-plus'}"></i>
      </button>
      <span class="card-lang-tag">${movie.language}</span>
    </div>
    <div class="card-details">
      <div class="card-rating-row">
        <span class="rating-score"><i class="fa-solid fa-star"></i> <strong>${movie.rating}</strong></span>
        <span class="card-year">${movie.year}</span>
      </div>
      <h4 class="card-title" title="${movie.title}">${movie.title}</h4>
      <p class="card-genre-sub">${movie.genre}</p>
      <div class="card-btn-stack">
        <button class="card-watchlist-btn ${inList ? 'active' : ''}" data-action="watchlist">
          <i class="fa-solid ${inList ? 'fa-check' : 'fa-plus'}"></i> Watchlist
        </button>
        <button class="card-trailer-btn" data-action="trailer">
          <i class="fa-solid fa-play"></i> Trailer
        </button>
      </div>
    </div>
  `;

  attachCardInteractions(card, movie);
  return card;
}

// Attach Clicks to Cards
function attachCardInteractions(card, movie) {
  card.addEventListener("click", (e) => {
    const actionTarget = e.target.closest("[data-action]");
    if (actionTarget) {
      const action = actionTarget.getAttribute("data-action");
      if (action === "watchlist") {
        e.stopPropagation();
        toggleWatchlist(movie.id);
        return;
      }
      if (action === "trailer") {
        e.stopPropagation();
        playTrailer(movie.trailerId);
        return;
      }
    }
    // Default click opens movie details
    openMovieModal(movie);
  });
}

// Refresh visual watchlist button state across all cards
function refreshCardWatchlistStates() {
  document.querySelectorAll(".movie-card").forEach(card => {
    const id = card.getAttribute("data-id");
    const inList = isWatchlisted(id);
    const ribbon = card.querySelector(".bookmark-ribbon");
    const btn = card.querySelector(".card-watchlist-btn");
    if (ribbon) {
      ribbon.classList.toggle("active", inList);
      ribbon.innerHTML = `<i class="fa-solid ${inList ? 'fa-check' : 'fa-plus'}"></i>`;
    }
    if (btn) {
      btn.classList.toggle("active", inList);
      btn.innerHTML = `<i class="fa-solid ${inList ? 'fa-check' : 'fa-plus'}"></i> Watchlist`;
    }
  });
}

// Scroll Arrows Setup
function setupShelfScrollArrows() {
  document.querySelectorAll(".scroll-arrow").forEach(arrow => {
    arrow.addEventListener("click", () => {
      const targetId = arrow.getAttribute("data-target");
      const shelf = document.getElementById(targetId);
      const direction = arrow.classList.contains("prev") ? -1 : 1;
      const scrollAmount = 480 * direction;
      shelf.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });
  });
}

// Open Movie Details Modal
function openMovieModal(movie) {
  const dummyFallback = createDummyPosterUrl(movie.title, movie.genre.split(',')[0]);
  modalBody.innerHTML = `
    <div class="modal-detail-wrapper">
      <div class="modal-poster">
        <img src="${movie.poster}" onerror="this.onerror=null; this.src='${dummyFallback}'" alt="${movie.title}" />
      </div>
      <div class="modal-info">
        <div class="modal-badges">
          <span class="badge gold-badge">${movie.language.toUpperCase()} CINEMA</span>
          ${movie.top10Rank ? `<span class="badge lang-badge">TOP 10 #${movie.top10Rank}</span>` : ''}
        </div>
        <h2 class="modal-title">${movie.title}</h2>
        <div class="modal-meta">
          <span>${movie.year}</span>
          <span class="dot">•</span>
          <span>${movie.duration}</span>
          <span class="dot">•</span>
          <span>${movie.genre}</span>
        </div>
        <div class="modal-rating-badge">
          <i class="fa-solid fa-star"></i>
          <span>${movie.rating} / 10 IMDb Gold Rating</span>
        </div>
        <p class="modal-plot">${movie.plot}</p>
        <div class="modal-crew">
          <p><strong>Director:</strong> ${movie.director}</p>
          <p><strong>Cast & Stars:</strong> ${movie.cast}</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-gold" onclick="playTrailer('${movie.trailerId}')">
            <i class="fa-solid fa-play"></i> Watch Trailer
          </button>
          <button class="btn btn-glass" onclick="toggleWatchlist('${movie.id}')">
            <i class="fa-solid ${isWatchlisted(movie.id) ? 'fa-check' : 'fa-plus'}"></i> 
            ${isWatchlisted(movie.id) ? 'In Watchlist' : 'Add to Watchlist'}
          </button>
        </div>
      </div>
    </div>
  `;
  movieModal.classList.add("open");
}

// Video Trailer Modal (YouTube Embed)
function playTrailer(trailerId) {
  if (!trailerId) {
    alert("Trailer not available for this title.");
    return;
  }
  trailerWrapper.innerHTML = `
    <iframe 
      src="https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  `;
  trailerModal.classList.add("open");
}

function stopTrailer() {
  trailerWrapper.innerHTML = "";
  trailerModal.classList.remove("open");
}

// Watchlist Drawer
function openWatchlist() {
  renderWatchlistDrawer();
  watchlistDrawer.classList.add("open");
}

function closeWatchlist() {
  watchlistDrawer.classList.remove("open");
}

function renderWatchlistDrawer() {
  watchlistContent.innerHTML = "";
  if (watchlist.length === 0) {
    watchlistContent.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-bookmark" style="font-size:2.5rem; color: var(--gold-dark); margin-bottom: 0.8rem;"></i>
        <h4>Your Watchlist is empty</h4>
        <p style="font-size:0.85rem; color: var(--text-muted); margin-top:0.4rem;">Explore Top 10, Hindi, or English movies and hit + to add them.</p>
      </div>
    `;
    return;
  }

  watchlist.forEach(id => {
    const movie = MOVIES.find(m => m.id === id);
    if (!movie) return;
    const dummyFallback = createDummyPosterUrl(movie.title, movie.genre.split(',')[0]);
    const item = document.createElement("div");
    item.className = "watchlist-drawer-item";
    item.innerHTML = `
      <img src="${movie.poster}" onerror="this.onerror=null; this.src='${dummyFallback}'" alt="${movie.title}" />
      <div class="watchlist-drawer-info">
        <h4>${movie.title}</h4>
        <p><i class="fa-solid fa-star"></i> ${movie.rating} • ${movie.year}</p>
        <button class="remove-watchlist-btn" onclick="toggleWatchlist('${movie.id}')">
          <i class="fa-solid fa-trash-can"></i> Remove
        </button>
      </div>
    `;
    item.onclick = (e) => {
      if (!e.target.closest(".remove-watchlist-btn")) {
        closeWatchlist();
        openMovieModal(movie);
      }
    };
    watchlistContent.appendChild(item);
  });
}

// Live Search Handling
function handleSearch(query) {
  const trimmed = query.trim().toLowerCase();
  const selectedCategory = searchCategory.value;

  if (!trimmed) {
    searchResultsSection.style.display = "none";
    mainShowcase.style.display = "block";
    clearSearchBtn.style.display = "none";
    return;
  }

  clearSearchBtn.style.display = "block";
  searchKeywordLabel.textContent = `"${query}"`;
  searchResultsSection.style.display = "block";
  mainShowcase.style.display = "none";

  const results = MOVIES.filter(movie => {
    const matchesCategory = selectedCategory === "all" || movie.language.toLowerCase() === selectedCategory.toLowerCase();
    const matchesKeyword = movie.title.toLowerCase().includes(trimmed) ||
                           movie.director.toLowerCase().includes(trimmed) ||
                           movie.cast.toLowerCase().includes(trimmed) ||
                           movie.genre.toLowerCase().includes(trimmed);
    return matchesCategory && matchesKeyword;
  });

  searchGrid.innerHTML = "";
  if (results.length === 0) {
    noSearchResults.style.display = "block";
  } else {
    noSearchResults.style.display = "none";
    results.forEach(movie => {
      const card = createStandardMovieCard(movie);
      searchGrid.appendChild(card);
    });
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Search input & category
  searchInput.addEventListener("input", (e) => handleSearch(e.target.value));
  searchCategory.addEventListener("change", () => handleSearch(searchInput.value));
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    handleSearch("");
  });
  closeSearchSectionBtn.addEventListener("click", () => {
    searchInput.value = "";
    handleSearch("");
  });

  // Language Filter Buttons in Nav
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");

      const hindiSec = document.getElementById("hindiSection");
      const englishSec = document.getElementById("englishSection");

      if (filter === "all") {
        hindiSec.style.display = "block";
        englishSec.style.display = "block";
      } else if (filter === "hindi") {
        hindiSec.style.display = "block";
        englishSec.style.display = "none";
        hindiSec.scrollIntoView({ behavior: "smooth" });
      } else if (filter === "english") {
        hindiSec.style.display = "none";
        englishSec.style.display = "block";
        englishSec.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Watchlist drawer
  openWatchlistBtn.addEventListener("click", openWatchlist);
  closeWatchlistBtn.addEventListener("click", closeWatchlist);
  watchlistDrawer.addEventListener("click", (e) => {
    if (e.target === watchlistDrawer) closeWatchlist();
  });

  // Modals close
  closeModal.addEventListener("click", () => movieModal.classList.remove("open"));
  movieModal.addEventListener("click", (e) => {
    if (e.target === movieModal) movieModal.classList.remove("open");
  });

  closeTrailerModal.addEventListener("click", stopTrailer);
  trailerModal.addEventListener("click", (e) => {
    if (e.target === trailerModal) stopTrailer();
  });

  // Keybindings
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      movieModal.classList.remove("open");
      stopTrailer();
      closeWatchlist();
      if (searchResultsSection.style.display === "block") {
        searchInput.value = "";
        handleSearch("");
      }
    }
  });
}

// Launch on DOM ready
document.addEventListener("DOMContentLoaded", init);
