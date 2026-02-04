# Project Specification: DesiRecipes Video Finder

## 1. Overview
**DesiRecipes** is a lightweight, static web application hosted on GitHub Pages. Its primary purpose is to allow users to dynamically search for recipe videos (specifically targeting "Desi" or general distinct cuisines, or just general recipes as per user input) via the YouTube Data API and view them in a modern, aesthetically pleasing interface without leaving the site.

## 2. Technology Stack
*   **Hosting**: GitHub Pages (Static hosting).
*   **Frontend**: 
    *   **HTML5**: Semantic structure.
    *   **CSS3**: Vanilla CSS with modern features (Flexbox, Grid, CSS Variables) for a rich, premium aesthetic (Glassmorphism, vibrant colors). *No external CSS frameworks required.*
    *   **JavaScript (ES6+)**: Pure, vanilla JavaScript for DOM manipulation and API calls.
*   **External APIs**: 
    *   **YouTube Data API v3**: To search for videos and retrieve metadata (titles, thumbnails, channel names).
    *   **YouTube IFrame Player API** (Optional but recommended): For a seamless playback experience within a modal.

## 3. Architecture & Security
Since this is a serverless, client-side application:
*   **API Key Management**: 
    *   *Challenge*: Storing an API key in client-side code is insecure.
    *   *Solution for Version 1*: We will expose a settings modal where the user can input their own YouTube Data API Key. This key will be saved in the browser's `localStorage` so it persists between sessions. This makes the app a true "tool" for the user.
    *   *Alternative*: Hardcode a key restricted by HTTP Referrer (only allows requests from `username.github.io`). This is still visible in source but strictly scoped. *Decision: Hybrid approach. Check environment for a restricted key, fallback to prompting user.*
*   **Data Flow**:
    1.  User enters a search term (e.g., "Butter Chicken").
    2.  App sends GET request to `https://www.googleapis.com/youtube/v3/search`.
    3.  Response JSON is parsed.
    4.  Video grid is dynamically populated with results.
    5.  Clicking a video opens a modal with the YouTube Embed.

## 4. UI/UX Design
The design focuses on "Rich Aesthetics" as per development guidelines.

### 4.1. Visual Style
*   **Theme**: Dark mode by default with vibrant accent colors (e.g., Deep Charcoal background, Saffron/Gold accents).
*   **Typography**: Modern sans-serif (e.g., 'Inter' or 'Outfit' from Google Fonts).
*   **Effects**: 
    *   Glassmorphism on cards and modals (blur backdrop).
    *   Subtle hover transforms (scale up, shadow glow).
    *   Smooth transitions for loading states.

### 4.2. Layout Components
1.  **Hero/Header Section**:
    *   Large, inviting typography title ("Discover Details").
    *   Prominent "Search" bar with a glowing border on focus.
    *   "Settings" icon (gear) for API Key configuration.
2.  **Results Grid**:
    *   Responsive Grid Layout (1 column mobile, 2 tablet, 3-4 desktop).
    *   **Video Card**: 
        *   Thumbnail image (high res).
        *   Title (truncated if too long).
        *   Channel Name.
        *   "Watch Now" button or overlay.
3.  **Video Modal**:
    *   Fullscreen overlay with blurred background.
    *   Centered video player.
    *   Close button (X) in top right.

## 5. File Structure
```
/desirecipes
│
├── index.html          # Main application structure
├── styles.css          # All styling (Reset + Variables + Components)
├── app.js              # Application logic and API handling
├── assets/             # Images, icons (likely SVGs inlined)
└── README.md           # Documentation for setup
```

## 6. Functional Requirements
1.  **Initialization**:
    *   Check `localStorage` for API Key.
    *   If missing, show a friendly prompt/modal asking for the key.
2.  **Search**:
    *   Listen for `Enter` key or "Search" button click.
    *   Show a loading spinner (CSS animation).
    *   Call YouTube Search API (`params: part=snippet, type=video, q={query}`).
3.  **Display**:
    *   Render valid results.
    *   Handle empty states ("No recipes found").
    *   Handle errors (Quota exceeded, Invalid Key).
4.  **Playback**:
    *   Use an `iframe` with `src="https://www.youtube.com/embed/{VIDEO_ID}"`.

## 7. Implementation Plan (Future Steps)
1.  **Setup**: Create files and Git repo.
2.  **HTML Structure**: Build the skeleton.
3.  **Styling**: Apply the premium design system.
4.  **Logic**: Implement the API fetch and render loop.
5.  **Polishing**: Add animations and handle edge cases.
6.  **Deploy**: Push to GitHub and enable Pages.

## 8. Keyword Strategy: "Instant Pot Desi Favorites"
To curate the experience, we will use specific search queries combining "Instant Pot" with these popular dishes.

### Vegetarian
*   **Dal Makhani** ("Instant Pot Dal Makhani")
*   **Chana Masala** ("Instant Pot Chana Masala")
*   **Palak Paneer** ("Instant Pot Palak Paneer")
*   **Aloo Gobi** ("Instant Pot Aloo Gobi")
*   **Vegetable Biryani** ("Instant Pot Veg Biryani")
*   **Rajma** ("Instant Pot Rajma Masala")
*   **Khichdi** ("Instant Pot Khichdi Recipe")
*   **Pav Bhaji** ("Instant Pot Pav Bhaji")

### Non-Vegetarian
*   **Butter Chicken** ("Instant Pot Butter Chicken")
*   **Chicken Biryani** ("Instant Pot Chicken Biryani")
*   **Desi Chicken Curry** ("Instant Pot Homestyle Chicken Curry")
*   **Mutton Rogan Josh** ("Instant Pot Mutton Rogan Josh")
*   **Kheema (Minced Meat)** ("Instant Pot Kheema Pav")
*   **Egg Curry** ("Instant Pot Egg Curry")

## 9. API Strategy: "The Free Way"
**Is there a free way to search YouTube?**
*   **Official Way (Recommended)**: The **YouTube Data API v3** allows 10,000 units of usage per day for free. A search query costs 100 units. This means you get ~100 searches per day for free per API key.
*   **Implementation**: We will implement the "Bring Your Own Key" (BYOK) model. The user (you) will generate a free API Key from Google Cloud Console and paste it into the app's settings. This keeps usage free and personal to you.
*   **Alternatives**: Scraping (unstable) or piped instances (often slow/down). We will stick to the official API for reliability and speed.

