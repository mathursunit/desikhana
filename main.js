
// Configuration
const CONFIG = {
  // Hardcoded API Key
  API_KEY: 'AIzaSyDdrjT9yRjUdGD1fEILSAjJWh_hK7FVZ00'
};

// Utilities
const decodeKey = (str) => {
  try { return atob(str); } catch (e) { return ''; }
};

// --- DATA STRUCTURES (Faceted Search) ---

const METHODS = [
  { id: 'instantpot', label: 'Instant Pot', queryPrefix: 'Instant Pot' },
  { id: 'airfryer', label: 'Air Fryer', queryPrefix: 'Air Fryer' },
  { id: 'traditional', label: 'Traditional', queryPrefix: 'Indian Recipe' }
];

const CATEGORIES = [
  {
    id: 'all',
    label: 'All Recipes',
    subcategories: [] // No filters for All, just generic search
  },
  {
    id: 'veg',
    label: 'Vegetarian',
    subcategories: [
      { name: 'Paneer', term: 'Paneer' },
      { name: 'Dal (Lentils)', term: 'Dal' },
      { name: 'Sabzi (Dry Veg)', term: 'Sabzi' },
      { name: 'Rice / Biryani', term: 'Veg Biryani' },
      { name: 'Indian Breads', term: 'Naan Roti Paratha' },
      { name: 'Breakfast (Nashta)', term: 'Indian Breakfast' }
    ]
  },
  {
    id: 'nonveg',
    label: 'Non-Vegetarian',
    subcategories: [
      { name: 'Chicken', term: 'Chicken Curry' },
      { name: 'Mutton / Lamb', term: 'Mutton Curry' },
      { name: 'Fish / Seafood', term: 'Fish Curry' },
      { name: 'Egg', term: 'Egg Curry' },
      { name: 'Keema', term: 'Keema Recipe' },
      { name: 'Biryani', term: 'Chicken Biryani' }
    ]
  },
  {
    id: 'snacks',
    label: 'Snacks (Chaat)',
    subcategories: [
      { name: 'Fried Snacks', term: 'Samosa Pakora' },
      { name: 'Street Chaat', term: 'Pani Puri Chaat' },
      { name: 'Tandoori Starters', term: 'Tandoori Tikka' },
      { name: 'Indo-Chinese', term: 'Manchurian Noodles' }
    ]
  },
  {
    id: 'dessert',
    label: 'Desserts',
    subcategories: [
      { name: 'Hot Sweets', term: 'Gulab Jamun Halwa' },
      { name: 'Cold Sweets', term: 'Kulfi Rasmalai' }
    ]
  }
];

// --- STATE MANAGEMENT ---

const state = {
  apiKey: CONFIG.API_KEY,
  activeCategory: 'veg', // Default to Veg
  activeMethod: 'instantpot', // Default to Instant Pot
  activeSubcategory: 'Paneer', // Default term
  videos: [],
  query: ''
};

// --- DOM ELEMENTS ---
const app = document.getElementById('app');

// --- INITIALIZATION ---

function init() {
  renderLayout();
  updateUIFromState(); // Set initial active states

  // Trigger initial search
  constructAndPerformSearch();
}

// --- LOGIC: SEARCH CONSTRUCTION ---

function constructAndPerformSearch() {
  // 1. Get Method Prefix (e.g., "Instant Pot")
  const methodObj = METHODS.find(m => m.id === state.activeMethod);
  const prefix = methodObj ? methodObj.queryPrefix : 'Indian Recipe';

  // 2. Get Search Term (e.g., "Paneer")
  // If user typed essentially, that overrides subcategory.
  // But here we rely on the clicked PILL or generic Category.

  let searchTerm = state.activeSubcategory;

  // 3. Combine
  const fullQuery = `${prefix} ${searchTerm}`;

  // 4. Update Search Bar to reflect reality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = fullQuery;

  console.log(`Searching for: ${fullQuery}`);
  performSearch(fullQuery);
}

async function performSearch(query) {
  state.query = query;
  const grid = document.getElementById('videoGrid');
  grid.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

  if (!state.apiKey) {
    grid.innerHTML = '<p style="text-align:center; color:var(--text-muted)">Configuration Error: API Key missing.</p>';
    return;
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(query)}&type=video&key=${state.apiKey}`;
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

// --- RENDERING ---

function renderLayout() {
  app.innerHTML = `
    <header>
      <div class="logo-container" style="display:flex; align-items:center; gap:0.75rem;">
        <img src="/logo.svg" alt="Desi Khana Logo" style="height:40px; border-radius:8px;">
        <div class="logo">Desi Khana</div>
      </div>
    </header>

    <div class="hero">
      
      <!-- 1. Search Bar -->
      <div class="search-container">
        <form id="searchForm" class="search-box">
          <input type="text" id="searchInput" class="search-input" placeholder="Search..." autocomplete="off">
          <button type="submit" class="search-btn">Search</button>
        </form>
      </div>

      <!-- 2. Top Level Tabs (Categories) -->
      <div class="tabs-container" id="categoryTabs">
        ${CATEGORIES.map(cat => `
          <button class="nav-tab ${cat.id === state.activeCategory ? 'active' : ''}" data-cat="${cat.id}">
            ${cat.label}
          </button>
        `).join('')}
      </div>

      <!-- 3. Method Toggles (Smart Filters) -->
      <div class="method-toggles-container">
        <div class="method-group">
           ${METHODS.map(m => `
             <button class="method-btn ${m.id === state.activeMethod ? 'active' : ''}" data-method="${m.id}">
               ${m.label}
             </button>
           `).join('')}
        </div>
      </div>

      <!-- 4. Subcategory Pills -->
      <div class="pills-scroll-container">
         <div class="pills-track" id="pillsTrack">
           <!-- Injected dynamically based on Active Category -->
         </div>
      </div>

    </div>

    <main id="resultsArea">
      <div class="video-grid" id="videoGrid"></div>
    </main>

    <!-- Modal -->
    <div id="videoModal" class="modal-overlay">
      <div class="modal-content">
        <button class="close-modal" id="closeVideoModal">&times;</button>
        <div class="video-frame-wrapper">
           <iframe id="videoFrame" class="video-frame" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  `;

  attachEventHandlers();
  renderPills(); // Initial pills render
}

function renderPills() {
  const track = document.getElementById('pillsTrack');
  const catObj = CATEGORIES.find(c => c.id === state.activeCategory);

  if (!catObj || catObj.subcategories.length === 0) {
    track.innerHTML = '<span style="color:var(--text-muted); font-size:0.9rem">Browsing all... try searching above!</span>';
    return;
  }

  track.innerHTML = catObj.subcategories.map(sub => `
    <button class="chip ${sub.term === state.activeSubcategory ? 'active' : ''}" data-term="${sub.term}">
      ${sub.name}
    </button>
  `).join('');

  // Re-attach pill listeners
  track.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      // Update State
      state.activeSubcategory = btn.dataset.term;

      // Update UI (Active Class)
      track.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');

      // Perform Search
      constructAndPerformSearch();
    });
  });
}

function attachEventHandlers() {
  // Category Tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Update State
      state.activeCategory = tab.dataset.cat;
      const catObj = CATEGORIES.find(c => c.id === state.activeCategory);

      // Default to first subcategory if available
      if (catObj.subcategories.length > 0) {
        state.activeSubcategory = catObj.subcategories[0].term;
      } else {
        state.activeSubcategory = '';
      }

      // Update UI
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Re-render Pills
      renderPills();

      // Trigger Search
      constructAndPerformSearch();
    });
  });

  // Method Toggles
  document.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeMethod = btn.dataset.method;

      document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      constructAndPerformSearch();
    });
  });

  // Search Form
  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const val = document.getElementById('searchInput').value;
    if (val.trim()) performSearch(val);
  });

  // Modals
  document.getElementById('closeVideoModal').addEventListener('click', closeVideo);
  document.getElementById('videoModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('videoModal')) closeVideo();
  });
}

function updateUIFromState() {
  // Can add logic here to sync UI with state if needed later
}

function renderGrid(videos) {
  const grid = document.getElementById('videoGrid');
  grid.innerHTML = ''; // clear

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
  iframe.src = '';
  modal.classList.remove('open');
}

function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

// Kickoff
init();
