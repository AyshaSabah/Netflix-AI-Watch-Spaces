# 🍿 Netflix AI Watch Spaces — Complete Project Guide & Documentation

> **File Name:** `EXPLAIN.md`  
> **Audience:** Beginners, students, and developers learning full-stack web development.  
> **Tone:** Simple English, clear step-by-step teaching, with exact code snippets, real file paths, and zero jargon without explanation.

---

## 📖 Welcome & Overview

Welcome to **Netflix AI Watch Spaces**! This document explains your entire application from top to bottom. Even if you are completely new to programming, React, Node.js, or WebSockets, this guide is written to help you understand every single file, feature, button click, and line of code.

### What is this project?
This application is a **social movie streaming and watch party web application** inspired by Netflix. It allows users to:
1. **Browse movies, TV series, and anime** (both classic open-source archive movies and live trending titles from the Free Movie Database & IMDb).
2. **Watch trailers and video clips instantly** with zero login required in a high-definition pop-up player (`TrailerModal`).
3. **Host synchronized "Watch Spaces" (Rooms)** where friends can watch video clips together at the exact same second using WebSockets. When the host hits Pause or Seeks to 01:25, everyone else's video pauses or seeks to 01:25 instantly.
4. **Chat live in real time** and send animated floating emoji reactions (🍿, ❤️, 🔥, 😂) that pop up over the screen.
5. **Ask an AI Co-Pilot (powered by Google Gemini)** questions about the movie, characters, or the exact scene playing right now.
6. **Sign up, Sign in, or Log in as a 1-Click Guest** with secure JSON Web Tokens (JWT) and passwords encrypted with bcrypt.
7. **View a personal Dashboard** with watch time statistics and movie watch history.
8. **Dual Database Architecture**: Works seamlessly with MongoDB when a database connection string is provided, or automatically switches to an in-memory database with pre-loaded movies and users if MongoDB is not connected.

---

## 🗂️ 1. Complete Project Folder Structure & Purpose of Every File

Here is the exact file tree of your project:

```text
netflix-ai-watch-spaces/
├── .env.example                       # Example configuration for environment variables
├── .gitignore                          # Tells git which files to ignore (like node_modules)
├── README.md                           # Quick project introduction
├── EXPLAIN.md                          # THIS comprehensive beginner documentation
├── explain.MD                          # Previous technical architecture documentation
├── index.html                          # Root HTML webpage template loaded by the browser
├── metadata.json                       # Applet configuration & metadata
├── package.json                        # Dependencies, npm scripts, and project packages
├── tsconfig.json                       # TypeScript compiler settings
├── vite.config.ts                      # Vite build tool and bundler configuration
├── server.ts                           # Node.js backend entry point (Express + Socket.io + Vite)
│
├── src/                                # FRONTEND SOURCE CODE (React.js)
│   ├── main.tsx                        # JavaScript entry point: renders React into index.html
│   ├── index.css                       # Global Tailwind CSS stylesheet
│   ├── App.jsx                         # Main parent React component managing app state & views
│   │
│   ├── components/                     # Reusable UI building blocks
│   │   ├── AICopilotPanel.jsx          # Chat panel talking to Gemini AI during movie playback
│   │   ├── AuthModal.jsx               # Login & Registration modal popup (with 1-click Guest)
│   │   ├── ChatPanel.jsx               # Live text chat & floating emoji reactions inside watch room
│   │   ├── CreateRoomModal.jsx         # Popup form to create a new Watch Space room
│   │   ├── FreeMovieDbSearchModal.jsx  # Search modal querying Free Movie DB & JustWatch
│   │   ├── JoinRoomModal.jsx           # Popup form to join an existing room via room code
│   │   ├── MovieCard.jsx               # Card component for classic catalog archive movies
│   │   ├── Navbar.jsx                  # Top navigation header with logo, navigation links & auth buttons
│   │   ├── TimelineTriviaCard.jsx      # Trivia pop-up cards triggered at specific video timestamps
│   │   ├── TrailerModal.jsx            # Instant modal player for demo clips and trailers
│   │   ├── TrendingCard.jsx            # Card for trending movies/series/anime with verified posters
│   │   └── VideoPlayer.jsx             # Synchronized HTML5 video player with scrubbers & controls
│   │
│   ├── pages/                          # Main page views
│   │   ├── HomePage.jsx                # Home screen: Hero banner, active rooms, trending, archive
│   │   ├── WatchRoomPage.jsx           # Watch room screen: video player + live chat + AI Co-Pilot
│   │   └── DashboardPage.jsx           # User profile, watch statistics, and continue watching history
│   │
│   └── services/                       # Client-side network helpers
│       ├── api.js                      # REST API client using fetch() to call backend endpoints
│       └── socket.js                   # Socket.IO client singleton connecting to the WebSocket server
│
└── server/                             # BACKEND SOURCE CODE (Node.js & Express)
    ├── app.js                          # Express application factory mounting all API routes
    ├── server.js                       # Optional standalone server runner
    │
    ├── config/                         # Backend configuration & databases
    │   ├── db.js                       # MongoDB connection via Mongoose + initial movie seeder
    │   └── inMemoryStore.js            # In-memory database fallback (movies, users, rooms, chat)
    │
    ├── controllers/                    # Business logic processing incoming API requests
    │   ├── aiController.js             # Handles POST /api/ai/copilot requests
    │   ├── authController.js           # Handles registration, login, guest login, and user info
    │   ├── freeMovieDbController.js    # Handles search, trending, JustWatch, and photo proxy
    │   ├── historyController.js        # Handles fetching and updating user watch history
    │   ├── movieController.js          # Handles fetching catalog movies and timeline trivia
    │   └── roomController.js           # Handles room creation, room lookup, and active rooms list
    │
    ├── models/                         # Mongoose Data Schemas for MongoDB
    │   ├── ChatMessage.js              # Schema for chat messages in a room
    │   ├── Movie.js                    # Schema for movie catalog records
    │   ├── TimelineEvent.js            # Schema for timestamped trivia events
    │   ├── User.js                     # Schema for registered user accounts
    │   ├── WatchHistory.js             # Schema for user playback watch progress
    │   └── WatchRoom.js                # Schema for watch rooms/spaces
    │
    ├── routes/                         # Express Route definitions mapping URLs to controllers
    │   ├── aiRoutes.js                 # Defines /api/ai endpoints
    │   ├── authRoutes.js               # Defines /api/auth endpoints
    │   ├── freeMovieDbRoutes.js        # Defines /api/imdb endpoints
    │   ├── historyRoutes.js            # Defines /api/history endpoints
    │   ├── movieRoutes.js              # Defines /api/movies endpoints
    │   └── roomRoutes.js               # Defines /api/rooms endpoints
    │
    └── services/                       # External integrations & real-time engines
        ├── freeMovieDbService.js       # Curated 18 trending titles with verified posters & streams
        ├── geminiService.js            # Google Gemini AI SDK integration (@google/genai)
        └── socketService.js            # Socket.IO server handling video sync, chat, and room users
```

---

## 📍 2. Exactly Where Every Feature is Coded (Feature Location Guide)

If you are wondering: *"Where is the login file? Where is the login button? Where is the video player?"*, this section gives you the exact paths and code locations:

| Feature | File Name & Full Path | Key Function or Component Name | Code Location / Lines |
| :--- | :--- | :--- | :--- |
| **Login / Sign In Modal** | `src/components/AuthModal.jsx` | `AuthModal` | Lines 5–184 |
| **Login Form Submit** | `src/components/AuthModal.jsx` | `handleSubmit` | Lines 15–38 |
| **1-Click Guest Login** | `src/components/AuthModal.jsx` | `handleGuestLogin` | Lines 40–55 |
| **Sign In Button on Header** | `src/components/Navbar.jsx` | `onOpenAuth` button | Lines 136–145 |
| **User Profile & Logout** | `src/components/Navbar.jsx` | `onLogout` button | Lines 111–134 |
| **Backend Login Logic** | `server/controllers/authController.js` | `login` | Lines 82–124 |
| **Backend Register Logic** | `server/controllers/authController.js` | `register` | Lines 15–79 |
| **Backend Guest Login Logic** | `server/controllers/authController.js` | `loginAsGuest` | Lines 164–180 |
| **JWT Token Generation** | `server/controllers/authController.js` | `generateToken` | Lines 10–12 |
| **Dashboard Page** | `src/pages/DashboardPage.jsx` | `DashboardPage` | Lines 15–287 |
| **Home Page** | `src/pages/HomePage.jsx` | `HomePage` | Lines 22–467 |
| **Watch Room Page** | `src/pages/WatchRoomPage.jsx` | `WatchRoomPage` | Lines 23–565 |
| **Synchronized Video Player** | `src/components/VideoPlayer.jsx` | `VideoPlayer` | Lines 29–871 |
| **Instant Trailer Modal** | `src/components/TrailerModal.jsx` | `TrailerModal` | Lines 22–326 |
| **Live Chat Panel** | `src/components/ChatPanel.jsx` | `ChatPanel` | Lines 4–186 |
| **AI Co-Pilot Panel** | `src/components/AICopilotPanel.jsx` | `AICopilotPanel` | Lines 5–210 |
| **Gemini AI Backend Service** | `server/services/geminiService.js` | `askGeminiCopilot` | Lines 25–99 |
| **Socket.IO Backend Engine** | `server/services/socketService.js` | `setupSocketHandlers` | Lines 11–230 |
| **Trending Movies & Posters** | `server/services/freeMovieDbService.js`| `TRENDING_CATALOG` | Lines 22–355 |
| **Free Movie DB Search Modal** | `src/components/FreeMovieDbSearchModal.jsx` | `FreeMovieDbSearchModal` | Lines 23–401 |
| **Create Watch Space Modal** | `src/components/CreateRoomModal.jsx` | `CreateRoomModal` | Lines 5–167 |
| **Join Watch Space Modal** | `src/components/JoinRoomModal.jsx` | `JoinRoomModal` | Lines 5–101 |
| **In-Memory Database Store** | `server/config/inMemoryStore.js` | `InMemoryDatabase` | Lines 199–430 |

---

## 🔐 3. Deep Dive: How Authentication Works (Login, Register, Logout & Guest)

Understanding user authentication is one of the most important concepts for a beginner. Here is exactly how it works in your project:

### A. The Front-End Flow: `src/components/AuthModal.jsx`
1. When the user clicks **"Sign In"** in the top navigation bar (`Navbar.jsx`), `setIsAuthOpen(true)` is triggered in `App.jsx`.
2. The `AuthModal` dialog appears with two tabs:
   - **Sign In** (Email + Password)
   - **Sign Up** (Display Name + Email + Password)
   - Plus a 1-Click **"Instant Demo: Login as Guest"** button.
3. When the user fills out the form and clicks the red button:
   ```javascript
   // src/components/AuthModal.jsx (Lines 15-38)
   const handleSubmit = async (e) => {
     e.preventDefault();
     setError('');
     setLoading(true);

     try {
       let data;
       if (isRegister) {
         data = await api.register(name, email, password); // Calls POST /api/auth/register
       } else {
         data = await api.login(email, password);          // Calls POST /api/auth/login
       }

       if (data.token) {
         // Save the JWT token in the browser's local storage
         localStorage.setItem('netflix_token', data.token);
         onAuthSuccess(data.user); // Tells App.jsx the user is logged in
         onClose();                // Closes the popup modal
       }
     } catch (err) {
       setError(err.message || 'Authentication failed. Please try again.');
     } finally {
       setLoading(false);
     }
   };
   ```

### B. The Client API Helper: `src/services/api.js`
In `src/services/api.js`:
- `api.login(email, password)` makes an HTTP POST request to `/api/auth/login` with `{ email, password }` in JSON format.
- `api.getMe()` sends the stored token in the `Authorization: Bearer <token>` HTTP header to verify who is logged in.

### C. The Backend Route & Controller: `server/controllers/authController.js`
1. **Password Hashing with bcrypt**:
   When registering, your app **never** saves passwords in plain text. It runs:
   ```javascript
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);
   ```
2. **Password Verification on Login**:
   When logging in, bcrypt compares the entered password against the scrambled hash:
   ```javascript
   const isMatch = await bcrypt.compare(password, user.password);
   ```
3. **JSON Web Token (JWT)**:
   If the password matches, the server signs a cryptographic token:
   ```javascript
   const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
   ```
   This token acts like a digital badge. The browser stores it and sends it with future requests so the server knows who is making the request.

### D. Logout Flow
In `src/App.jsx` (Lines 144–148):
```javascript
const handleLogout = () => {
  localStorage.removeItem('netflix_token'); // Deletes the token
  setCurrentUser(null);                     // Clears user state in React
  showToast('👋 Signed out of Watch Spaces.');
};
```
When clicked, the token is deleted from `localStorage`, and the UI instantly switches back to showing the **"Sign In"** button.

---

## 🎬 4. Deep Dive: Instant Trailers & Demo Clips (`TrailerModal.jsx`)

One of the newest and most user-friendly features in the project is the **Instant Trailer & Demo Clip Player**.

### Why was this added?
Previously, visitors couldn't immediately preview movies without creating a room. Now, visitors can click **"Watch Trailer / Demo Clip"** or **"Clip"** on any title to immediately watch the video with full controls without any login walls.

### How it works:
1. **Triggering the Modal**:
   - In `src/pages/HomePage.jsx`: The large Hero Banner has a red button:
     `<button onClick={() => onWatchTrailer(featuredMovie)}>Watch Trailer / Demo Clip</button>`
   - In `src/components/TrendingCard.jsx`: Every card has a hover overlay and a **"Clip"** button:
     `<button onClick={handlePlayClip}>Clip</button>`
   - In `src/components/MovieCard.jsx`: Clicking the thumbnail or the **"Clip"** button triggers `onWatchTrailer(movie)`.
2. **Managing State in `App.jsx`**:
   `App.jsx` holds `trailerMovie`. When a movie is passed, `setTrailerMovie(movie)` opens `<TrailerModal />`.
3. **Player Controls inside `src/components/TrailerModal.jsx`**:
   - Auto-plays the video stream (`oceans.mp4`, `sintel/trailer.mp4`, etc.).
   - If the browser blocks auto-play with sound, it automatically mutes audio and starts playback smoothly.
   - Includes custom scrubber bar, Play/Pause, Rewind 10s, Fast-forward 10s, Volume slider, Mute toggle, and Fullscreen toggle.
   - Includes keyboard shortcuts: `Space` (Play/Pause), `M` (Mute), `F` (Fullscreen), `Esc` (Close).
   - Has a **"Watch Together with Friends 🍿"** button that lets the user turn this trailer into a multi-user synchronized watch room!

---

## 🌐 5. Deep Dive: Multi-User Synchronized Playback (`VideoPlayer.jsx` + `socketService.js`)

This is the technical highlight of the project. How do multiple users across different computers stay in sync while watching a video?

### A. The Client Side: `src/components/VideoPlayer.jsx`
1. **The HTML5 `<video>` Tag**:
   The player uses a standard HTML5 `<video ref={videoRef} />` element wrapped in a responsive 16:9 container (`aspect-video`).
2. **Host vs. Viewer Roles**:
   - The user who created the room is the **Host** (`isHost = true`).
   - Other users are **Viewers** (`isHost = false`).
3. **Event Emitting (Host Actions)**:
   When the Host clicks Play, Pause, or drags the timeline scrubber:
   ```javascript
   // src/pages/WatchRoomPage.jsx
   const handleHostPlay = (time) => {
     socket.emit('video:play', { roomId, currentTime: time });
   };
   const handleHostPause = (time) => {
     socket.emit('video:pause', { roomId, currentTime: time });
   };
   const handleHostSeek = (time) => {
     socket.emit('video:seek', { roomId, currentTime: time });
   };
   ```
4. **Anti-Drift Synchronization**:
   When a viewer receives a `video:play` or `video:seek` event from the server, `VideoPlayer.jsx` compares the local video time against the host's timestamp. If the difference is greater than 1.5 seconds, it automatically seeks forward or backward so everyone is watching the exact same scene.

### B. The Server Side: `server/services/socketService.js`
The server acts as the authoritative coordinator:
- `socket.on('video:play')`: Updates the room's stored `currentTime` and `isPlaying: true`, then broadcasts `socket.to(roomId).emit('video:play', data)` to all viewers.
- `socket.on('video:pause')`: Sets `isPlaying: false` and broadcasts `video:pause`.
- `socket.on('video:seek')`: Updates `currentTime` and broadcasts `video:seek`.
- `socket.on('chat:message')`: Broadcasts new chat messages and saves them in the in-memory or MongoDB database.
- `socket.on('reaction:send')`: Broadcasts floating emoji animations (`🍿`, `🔥`, `❤️`) across all screens.

---

## 🤖 6. Deep Dive: Gemini AI Co-Pilot Engine (`AICopilotPanel.jsx` + `geminiService.js`)

In traditional streaming services, you watch alone. In Netflix AI Watch Spaces, you have an AI co-pilot that knows what movie you are watching and what is happening on screen!

### How the AI Works:
1. **The User Asks a Question**:
   In `src/components/AICopilotPanel.jsx`, the user types a question (e.g., *"Why did the character do that?"* or *"Who directed this?"*).
2. **Context Assembly**:
   The client sends `POST /api/ai/copilot` with:
   - `movieId`: Which movie is playing.
   - `currentTimestamp`: How many seconds into the video the player currently is (e.g. `95` seconds = `01:35`).
   - `question`: The user's question.
3. **Prompt Grounding in `server/services/geminiService.js`**:
   The backend pulls the movie title, plot synopsis, director, cast, and any pre-configured trivia cues near that timestamp. It constructs a system prompt for the official Google Gen AI SDK (`@google/genai`) using the `gemini-3.8-flash` model.
4. **Spoiler Guardrails**:
   The system instruction tells Gemini to be friendly, charismatic, and concise (2–4 sentences), and specifically instructs it **not** to spoil future twists unless explicitly asked.
5. **Graceful Fallback**:
   If no `GEMINI_API_KEY` is set in the environment, `geminiService.js` doesn't crash; instead, it returns an intelligent contextual reply referencing the movie facts and timeline cues so the demo remains functional!

---

## 🗄️ 7. Deep Dive: Databases & Data Flow (MongoDB + InMemoryStore)

Your project features a **Dual-Mode Persistence Architecture**:

### 1. In-Memory Store (`server/config/inMemoryStore.js`)
- Runs out of the box with zero setup required.
- Pre-seeded with 5 classic movies (`Big Buck Bunny`, `Tears of Steel`, `Sintel`, `Elephants Dream`, `Cosmic Horizons`).
- Pre-seeded with demo accounts (e.g. `alex@netflixspaces.com` / `password123`).
- Stores rooms, active viewers, chat messages, and watch histories in memory maps.

### 2. MongoDB with Mongoose (`server/config/db.js` & `server/models/`)
- If you supply a `MONGODB_URI` environment variable, `connectDB()` connects to MongoDB.
- Automatically seeds the database if empty.
- If MongoDB is unavailable or disconnects, the controllers gracefully fall back to `inMemoryStore`, ensuring the application **never crashes**.

---

## 📑 8. File-by-File Reference Table

| File Path | Purpose | Key Imports | Key Exports / Functions | Connected Files |
| :--- | :--- | :--- | :--- | :--- |
| `index.html` | HTML skeleton loaded by browser | None | Root DOM element (`<div id="root">`) | `src/main.tsx` |
| `package.json` | Project metadata, scripts, dependencies | None | Package configurations | npm/bun tools |
| `vite.config.ts` | Configures Vite & Tailwind v4 plugin | `@vitejs/plugin-react`, `@tailwindcss/vite` | Vite configuration object | `server.ts` |
| `server.ts` | Backend server & dev environment runner | `express`, `http`, `socket.io`, `createApp` | `startServer()` | `server/app.js`, `server/services/socketService.js` |
| `server/app.js` | Express app router and middleware setup | `express`, route handlers | `createApp()` | `server.ts`, `server/routes/*` |
| `src/main.tsx` | React app entry point | `react`, `react-dom/client`, `App` | Renders `<App />` | `index.html`, `src/App.jsx` |
| `src/App.jsx` | Master state manager and view router | `useState`, `useEffect`, `Navbar`, pages, modals | `App` component (default) | All pages and modals |
| `src/components/Navbar.jsx` | Top navigation bar and user profile | `lucide-react` icons | `Navbar` component (default) | `src/App.jsx` |
| `src/components/AuthModal.jsx` | User sign-in, sign-up, and guest login | `useState`, `api` | `AuthModal` component (default) | `src/App.jsx`, `src/services/api.js` |
| `src/components/TrailerModal.jsx` | Instant HD video clip & trailer player | `useRef`, `useState`, `useEffect` | `TrailerModal` component (default) | `src/App.jsx` |
| `src/components/TrendingCard.jsx` | Card for trending movies/series/anime | `useState`, `useEffect`, `lucide-react` | `TrendingCard` component (default) | `src/pages/HomePage.jsx` |
| `src/components/MovieCard.jsx` | Card for classic archive movies | `useState`, `lucide-react` | `MovieCard` component (default) | `src/pages/HomePage.jsx` |
| `src/components/VideoPlayer.jsx` | Real-time synchronized video player | `useRef`, `useState`, `useCallback` | `VideoPlayer` component (default) | `src/pages/WatchRoomPage.jsx` |
| `src/components/ChatPanel.jsx` | Room text chat & reactions | `useState`, `useRef`, `useEffect` | `ChatPanel` component (default) | `src/pages/WatchRoomPage.jsx` |
| `src/components/AICopilotPanel.jsx`| Chat with Gemini AI Co-Pilot | `useState`, `useEffect`, `api` | `AICopilotPanel` component (default) | `src/pages/WatchRoomPage.jsx` |
| `src/components/CreateRoomModal.jsx`| Form to host a new Watch Space | `useState`, `api` | `CreateRoomModal` component (default)| `src/App.jsx` |
| `src/components/JoinRoomModal.jsx` | Form to join room via room code | `useState`, `api` | `JoinRoomModal` component (default) | `src/App.jsx` |
| `src/components/FreeMovieDbSearchModal.jsx`| Search FM-DB & JustWatch | `useState`, `useEffect`, `api` | `FreeMovieDbSearchModal` (default) | `src/App.jsx` |
| `src/pages/HomePage.jsx` | Main homepage landing screen | `useState`, `useEffect`, cards | `HomePage` component (default) | `src/App.jsx` |
| `src/pages/WatchRoomPage.jsx`| Active watch party room view | `useState`, `useEffect`, `getSocket` | `WatchRoomPage` component (default) | `src/App.jsx`, `src/services/socket.js` |
| `src/pages/DashboardPage.jsx` | User profile & watch history | `useState`, `useEffect`, `api` | `DashboardPage` component (default) | `src/App.jsx` |
| `src/services/api.js` | HTTP client calling REST endpoints | None (native `fetch`) | `api` object with all methods | Used by all React components |
| `src/services/socket.js` | WebSocket client connecting to server | `socket.io-client` | `getSocket()` | `src/pages/WatchRoomPage.jsx` |
| `server/services/freeMovieDbService.js` | 18 trending titles & Swagger API | Native `fetch` | `TRENDING_CATALOG`, `searchFreeMovieDb` | `server/controllers/freeMovieDbController.js` |
| `server/services/socketService.js` | Server-authoritative WebSocket room sync| `inMemoryStore` | `setupSocketHandlers` | `server.ts` |
| `server/services/geminiService.js` | Gemini AI integration | `@google/genai` | `askGeminiCopilot` | `server/controllers/aiController.js` |
| `server/config/inMemoryStore.js` | Memory fallback database store | `bcryptjs` | `inMemoryStore`, `initialMovies` | Controllers and socketService |
| `server/config/db.js` | MongoDB Mongoose connection | `mongoose`, Models | `connectDB`, `getIsMongoConnected` | `server.ts`, controllers |

---

## 🔄 9. Complete Application Flow: Step by Step

Let's walk through what happens from the moment a user opens the application:

### Step 1: Loading the App
1. The browser requests `http://localhost:3000`.
2. `server.ts` handles the request. In development mode, Vite delivers `index.html` and executes `src/main.tsx`.
3. `main.tsx` renders `<App />` inside `<div id="root">`.
4. In `App.jsx`, a `useEffect` hook runs automatically:
   - Fetches the movie list via `api.getMovies()`.
   - Fetches active rooms via `api.getRooms()`.
   - Checks if a `netflix_token` exists in `localStorage`. If it does, calls `api.getMe()` to restore the user session.
   - Checks the URL hash (e.g. `#/room/SPACE-1234`). If a room code is in the URL, automatically opens that Watch Room!

### Step 2: Browsing Movies & Watching Clips
1. The user sees the **Hero Featured Movie Banner** (`Dune: Part Two`).
2. The user clicks **"Watch Trailer / Demo Clip"**.
3. `handleWatchTrailer(featuredMovie)` sets `trailerMovie`, which immediately opens `<TrailerModal />`.
4. The high-definition video starts playing instantly. The user can seek, pause, adjust volume, or go fullscreen.

### Step 3: Starting a Synchronized Watch Space
1. The user clicks **"Watch Together with Friends"** on any movie card or inside the trailer modal.
2. If the user is not signed in:
   - The application automatically calls `api.loginGuest()`.
   - Assigns a guest account (e.g. `MovieFan382`), sets the session token, and opens `<CreateRoomModal />`. (Zero friction!).
3. The user confirms the room name and clicks **"Create Space"**.
4. The backend generates a room code (e.g. `NETFLIX-7482`), saves the room, and returns the room data.
5. The frontend switches view to `'watch'` (`WatchRoomPage.jsx`) and updates the browser hash to `#/room/NETFLIX-7482`.

### Step 4: Inside the Watch Room
1. `WatchRoomPage.jsx` connects to the real-time WebSocket server (`socket.js` -> `socketService.js`).
2. The Host hits **Play**:
   - The video plays locally.
   - An event `video:play` is sent over WebSockets to the server.
   - The server broadcasts `video:play` to all other viewers in room `NETFLIX-7482`.
   - All other viewers' videos start playing at the exact same timestamp.
3. A viewer types: *"This soundtrack is amazing!"* in the chat box:
   - Chat message is emitted via `chat:message`.
   - The message pops up in everyone's chat panel instantly.
4. When the video reaches a trivia cue timestamp (e.g. at 00:15 in *Tears of Steel*):
   - A gold trivia card pops up on screen displaying background facts about how the scene was filmed!
   - Clicking **"Ask AI Co-Pilot"** pre-fills the question into the AI tab.
5. The user asks Gemini: *"Why are they in Amsterdam?"*:
   - The backend prompts Gemini with the movie details and playback timestamp.
   - Gemini responds in 2–3 witty, friendly sentences!

---

## 🛠️ 10. Technologies, Libraries & Commands Used

### Frontend Libraries:
- **React 19**: Modern component library using functional components and hooks (`useState`, `useEffect`, `useRef`, `useCallback`).
- **Tailwind CSS v4**: Utility-first CSS framework for dark cinematic styling.
- **Lucide React (`lucide-react`)**: Clean icons (`Play`, `Pause`, `Users`, `Sparkles`, `Film`, `Search`, etc.).
- **Socket.io Client (`socket.io-client`)**: Real-time WebSocket connection to the server.

### Backend Libraries:
- **Express.js (`express`)**: Node.js web framework handling REST API routes.
- **Socket.io (`socket.io`)**: WebSocket server engine for real-time room synchronization.
- **@google/genai**: Official Google Gemini AI SDK for scene-grounded intelligence.
- **bcryptjs**: Secure password hashing with salts.
- **jsonwebtoken (`jwt`)**: Signing and verifying authentication tokens.
- **Mongoose (`mongoose`)**: Object data modeling for MongoDB.
- **TSX (`tsx`)**: TypeScript execution engine running Node.js server files directly.
- **Vite (`vite`)**: Development server and build bundler.

### Key Terminal Commands:
- `npm run dev`: Starts the unified full-stack development server on port 3000.
- `npm run build`: Compiles and bundles the React frontend into `dist/`.
- `npm run lint`: Validates TypeScript types across the codebase (`tsc --noEmit`).

---

## 💡 11. Honest Assessment: What is Production-Ready vs. Simulated

As requested, here is an honest, transparent breakdown of what is connected to real services versus what is local/simulated:

1. **Movie Posters & Artwork**: **100% Real & Verified**. All 18 trending movies, series, and anime use tested, working, high-definition CDN posters (TMDB and Amazon Media CDN) returning HTTP 200 OK.
2. **Video Playback**: **Real HTML5 Video Streams**. Uses verified, public MP4 cinema trailers and open-source milestone films (`oceans.mp4`, `sintel/trailer.mp4`, `bunny/trailer.mp4`, `movie_300.mp4`). It does not pirate full copyrighted Netflix streams; instead, it uses verified cinema clips and trailers perfect for portfolio demonstrations.
3. **Real-Time Synchronization & Chat**: **100% Real WebSockets**. Built on real Socket.IO connections. If you open two browser tabs or share the room code with a friend, the play/pause state, chat, and emojis sync in real-time.
4. **User Authentication**: **100% Real Cryptography**. Uses actual bcrypt password hashing and real JWT tokens stored in `localStorage`.
5. **Database**: **Dual Mode**. Uses MongoDB when `MONGODB_URI` is provided; otherwise seamlessly uses an in-memory database store so the app works anywhere without installation hurdles.
6. **AI Co-Pilot**: **Real Gemini API with Contextual Fallback**. When `GEMINI_API_KEY` is provided, it calls Google's `gemini-3.8-flash` model. When no key is set, it returns pre-grounded contextual responses based on the movie's timeline cues.

---

## ⚡ 12. Quick Reference Cheatsheet

| Question | Answer |
| :--- | :--- |
| **Where is the login page?** | `src/components/AuthModal.jsx` (Modal format) |
| **Where is the login button?** | `src/components/Navbar.jsx` (Lines 136–145) |
| **Where is the dashboard?** | `src/pages/DashboardPage.jsx` |
| **Where is the homepage?** | `src/pages/HomePage.jsx` |
| **Where is the watch room?** | `src/pages/WatchRoomPage.jsx` |
| **Where is the video player?** | `src/components/VideoPlayer.jsx` |
| **Where are the trailer clips?** | `src/components/TrailerModal.jsx` |
| **Where are the database models?** | `server/models/` |
| **Where are the backend API routes?** | `server/routes/` and `server/controllers/` |
| **Where are the WebSockets handled?** | `server/services/socketService.js` (Server) & `src/services/socket.js` (Client) |
| **Where is the AI logic?** | `server/services/geminiService.js` & `src/components/AICopilotPanel.jsx` |
| **Where are trending titles stored?** | `server/services/freeMovieDbService.js` (`TRENDING_CATALOG`) |

---

*This document was generated specifically for your codebase to help you master full-stack web development. Keep this file handy as a guide whenever you explore or explain your project!*
