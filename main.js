
// Configuration
const CONFIG = {
  // Hardcoded API Key as requested
  API_KEY: 'AIzaSyDdrjT9yRjUdGD1fEILSAjJWh_hK7FVZ00'
};

// Utilities
const decodeKey = (str) => {
  try { return atob(str); } catch (e) { return ''; }
};

// State
const state = {
  apiKey: CONFIG.API_KEY,
  videos: [],
  query: ''
};

// Keyword Lists (Instant Pot Focus)
const RECIPES = {
  veg: [
    { name: "Dal Makhani", query: "Instant Pot Dal Makhani" },
    { name: "Chana Masala", query: "Instant Pot Chana Masala" },
    { name: "Palak Paneer", query: "Instant Pot Palak Paneer" },
    { name: "Aloo Gobi", query: "Instant Pot Aloo Gobi" },
    { name: "Veg Biryani", query: "Instant Pot Vegetable Biryani" },
    { name: "Rajma", query: "Instant Pot Rajma Masala" },
    { name: "Khichdi", query: "Instant Pot Khichdi" },
    { name: "Pav Bhaji", query: "Instant Pot Pav Bhaji" }
  ],
  nonVeg: [
    { name: "Butter Chicken", query: "Instant Pot Butter Chicken" },
    { name: "Chicken Biryani", query: "Instant Pot Chicken Biryani" },
    { name: "Chicken Curry", query: "Instant Pot Chicken Curry Home Style" },
    { name: "Mutton Rogan Josh", query: "Instant Pot Mutton Rogan Josh" },
    { name: "Kheema", query: "Instant Pot Keema" },
    { name: "Egg Curry", query: "Instant Pot Egg Curry" }
  ]
};

// DOM Elements
const app = document.getElementById('app');

// App Initialization
function init() {
  renderLayout();
  // Load a default category on start
  performSearch(RECIPES.nonVeg[0].query);
}

// Layout Rendering
function renderLayout() {
  app.innerHTML = `
    <header>
      <div class="logo">DesiRecipes</div>
      <!-- Settings removed -->
    </header>

    <div class="hero">
      <h1>Discover Details</h1>
      <p>Quick & Easy Instant Pot Recipes</p>
      
      <div class="search-container">
        <form id="searchForm" class="search-box">
          <input type="text" id="searchInput" class="search-input" placeholder="Search for a recipe (e.g. 'Paneer')..." autocomplete="off">
          <button type="submit" class="search-btn">Search</button>
        </form>
      </div>

      <div class="chips-container" id="chipsContainer">
        <!-- Injected via JS -->
      </div>
    </div>

    <main id="resultsArea">
      <!-- Grid or Loader -->
      <div class="video-grid" id="videoGrid"></div>
    </main>

    <!-- Modals -->
    <div id="videoModal" class="modal-overlay">
      <div class="modal-content">
        <button class="close-modal" id="closeVideoModal">&times;</button>
        <div class="video-frame-wrapper">
           <iframe id="videoFrame" class="video-frame" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  `;

  // Inject Chips
  const chipsContainer = document.getElementById('chipsContainer');
  const allRecipes = [...RECIPES.veg, ...RECIPES.nonVeg];

  allRecipes.forEach(recipe => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = recipe.name;
    chip.onclick = () => {
      // Highlight active
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      // Update Search Box
      document.getElementById('searchInput').value = recipe.query;
      performSearch(recipe.query);
    };
    chipsContainer.appendChild(chip);
  });

  // Event Listeners
  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('searchInput').value;
    if (query.trim()) performSearch(query);
  });

  // Close Modals
  document.getElementById('closeVideoModal').addEventListener('click', closeVideo);
  document.getElementById('videoModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('videoModal')) closeVideo();
  });
}

// Logic
async function performSearch(query) {
  state.query = query;
  const grid = document.getElementById('videoGrid');
  grid.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

  if (!state.apiKey) {
    grid.innerHTML = '<p style="text-align:center; color:var(--text-muted)">Configuration Error: API Key missing.</p>';
    return;
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=9&q=${encodeURIComponent(query)}&type=video&key=${state.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    state.videos = data.items;
    renderGrid(state.videos);

  } catch (error) {
    console.error(error);
    grid.innerHTML = `<p style="text-align:center; color:#ef4444">Error: ${error.message}</p>`;
  }
}

function renderGrid(videos) {
  const grid = document.getElementById('videoGrid');
  grid.innerHTML = '';

  if (!videos || videos.length === 0) {
    grid.innerHTML = '<p style="text-align:center; color:var(--text-muted)">No recipes found.</p>';
    return;
  }

  videos.forEach((video, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${index * 50}ms`;

    card.innerHTML = `
      <div class="thumbnail-wrapper">
        <img src="${video.snippet.thumbnails.high.url}" class="thumbnail-image" alt="${video.snippet.title}">
        <div class="play-icon">
          <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${decodeHTML(video.snippet.title)}</h3>
        <p class="card-channel">${decodeHTML(video.snippet.channelTitle)}</p>
      </div>
    `;

    card.addEventListener('click', () => openVideo(video.id.videoId));
    grid.appendChild(card);
  });
}

function openVideo(videoId) {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoFrame');
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  modal.classList.add('open');
}

function closeVideo() {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoFrame');
  iframe.src = ''; // Stop playback
  modal.classList.remove('open');
}

function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

// Start
init();
