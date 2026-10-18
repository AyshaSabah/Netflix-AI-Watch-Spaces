# 🍿 Netflix AI Watch Spaces - Comprehensive Architecture & System Design

> **Document:** `explain.MD`  
> **Topic:** Technical Architecture, UI Design, Real-Time Synchronization, AI Co-Pilot Engine, and Database Design for Netflix AI Watch Spaces.

---

## 1. Executive Summary & Design Decision

### Front-Facing UI Philosophy
The internal architecture and internship overview box was removed from the public front page (`HomePage.jsx`) to maintain a clean, immersive consumer streaming experience. True streaming platforms (like Netflix) never display internal development specifications or architectural blueprints to viewers. Instead, all architectural documentation, design decisions, and system specifications are maintained here in `explain.MD`.

---

## 2. High-Level System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT TIER (React)                             │
│  ┌───────────────────────────────┬───────────────────────────────────────┐  │
│  │   Consumer Experience (UI)    │       Real-Time Social Watch Room     │  │
│  │   - Netflix-Style Dark Theme  │       - Synchronized HTML5 Video      │  │
│  │   - Authentic Movie Catalog   │       - Floating Emoji Reactions      │  │
│  │   - Free Movie DB / IMDb Modal│       - Live Group Chat Panel         │  │
│  │   - Watchlist & History Dash  │       - Gemini AI Co-Pilot & Trivia   │  │
│  └───────────────────────────────┴───────────────────────────────────────┘  │
└───────────────────────▲────────────────────────────────▲────────────────────┘
                        │ HTTP / REST                    │ WebSockets (Socket.io)
                        │                                │ (Play/Pause/Seek/Chat)
┌───────────────────────▼────────────────────────────────▼────────────────────┐
│                             SERVER TIER (Node.js)                           │
│  ┌───────────────────────────────┬───────────────────────────────────────┐  │
│  │       Express 4 REST API      │         Socket.io Sync Engine         │  │
│  │   - /api/auth (JWT, Bcrypt)   │       - Room State Management         │  │
│  │   - /api/movies (Catalog)     │       - Host Authoritative Playback   │  │
│  │   - /api/rooms (CRUD)         │       - Anti-Drift Auto Resync        │  │
│  │   - /api/imdb (FM-DB API)     │       - Real-Time Chat Broadcast      │  │
│  │   - /api/ai/copilot (Gemini)  │       - Floating Reaction Events      │  │
│  └───────────────────────────────┴───────────────────────────────────────┘  │
└───────────────────────▲────────────────────────────────▲────────────────────┘
                        │                                │
┌───────────────────────▼──────────────┐  ┌──────────────▼────────────────────┐
│          DATA STORAGE TIER           │  │          EXTERNAL SERVICES        │
│  - MongoDB (Mongoose Schema)         │  │  - Google Gemini API (AI Co-Pilot)│
│  - In-Memory High-Speed Fallback     │  │  - Free Movie DB API (FM-DB v0.3) │
│    (Zero-config local development)   │  │  - JustWatch Streaming Providers  │
└──────────────────────────────────────┘  └───────────────────────────────────┘
```

---

## 3. Core Architectural Modules

### 🅰️ Frontend Tier (React 19 + Tailwind CSS)
- **Component-Driven Modular Architecture**:
  - `Navbar.jsx`: Brand banner, navigation links, quick-join room input, "Search IMDb" trigger, and authentication controls.
  - `HomePage.jsx`: Hero featured watch party billboard, live active spaces carousel, curated genre rows with authentic movie posters.
  - `MovieCard.jsx`: Aspect-ratio styled cards featuring official movie posters with `referrerPolicy="no-referrer"` protection and graceful fallback handlers.
  - `FreeMovieDbSearchModal.jsx`: Interactive modal for querying Free Movie DB & IMDb with live debounced search, detailed cast views, JustWatch regional streaming availability, and a 1-click "Watch Together in Space" button.
  - `VideoPlayer.jsx`: Custom-skinned synchronized HTML5 video player with host controls, resync utility, and floating CSS reaction animation overlays.
  - `ChatPanel.jsx`: Low-latency live group chat with host badges, timestamping, user presence list, and emoji reaction picker.
  - `AICopilotPanel.jsx`: Interactive conversational assistant panel grounded in the currently playing film, scene timestamp, and character bios.
  - `DashboardPage.jsx`: Personal viewing dashboard with visual progress bars, watch party history, and resume shortcuts.

### 🅱️ Real-Time Synchronization Engine (Socket.io)
- **Host-Authoritative State Pattern**:
  - The room creator (or designated host) controls the primary video timeline (`video-play`, `video-pause`, `video-seek`).
  - When the host performs an action, the server broadcasts the event to all clients in that specific socket room.
  - **Drift Compensation**: When a viewer joins an ongoing room, the server issues a `request-sync` to the host, who responds with `sync-state` containing the exact current timestamp and playback status.
  - **Floating Reactions**: Clients emit `reaction` events (`🍿`, `🔥`, `❤️`, `😂`, `😱`, `👏`) which render synchronized floating micro-animations across all connected players.

### 🅲 AI Co-Pilot Engine (Google Gemini API)
- **Contextual Scene Grounding**:
  - When a user asks a question, the backend retrieves the movie metadata (title, plot, genre, director, cast) along with the current video playback timestamp (e.g. `02:15`).
  - The prompt is constructed with clear instructions:
    1. Ground answers strictly in the movie and scene up to the current timestamp.
    2. Respect spoiler boundaries: do not reveal future plot twists or endings before the viewer reaches them.
    3. Adopt an engaging, knowledgeable cinephile tone.
- **Timeline Trivia Cues**:
  - Pre-seeded scene metadata cues (e.g., `00:15`, `00:45`, `02:00`) that automatically notify users of behind-the-scenes facts and trivia.

### 🅳 Movie Data & Free Movie DB (FM-DB v0.3.1)
- **Swagger Specification Integration**:
  - `/search`: Multi-parameter search by title (`q`), IMDb ID (`tt`), season (`lsn`), and version (`v`).
  - `/justwatch`: Real-time streaming platform search (`q`, `L`) returning providers like Netflix, Prime Video, Apple TV, Disney/Hotstar, and Tomatometer ratings.
- **High-Availability Fallback Architecture**:
  - If the primary upstream scraper experiences server downtime (`SERVER_FAILURE_25`), the service automatically falls back to the IMDb Suggestion Engine (`v3.sg.media-imdb.com`) and formats the response to the exact Free Movie DB schema (`#TITLE`, `#YEAR`, `#IMDB_ID`, `#RANK`, `#ACTORS`, `#IMG_POSTER`).

### 🅴 Authentication & Dual-Mode Persistence
- **JWT & Password Security**:
  - Bcrypt-hashed password storage with signed JWT tokens stored in localStorage.
  - Guest Mode: Instant 1-click access allowing visitors to test rooms without registering.
- **Hybrid Data Storage**:
  - Connects to MongoDB when available (`MONGODB_URI`).
  - Automatically initializes an in-memory database store (`inMemoryStore.js`) when MongoDB is not connected, ensuring zero configuration friction during testing or development.

---

## 4. REST API Endpoint Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user with hashed credentials |
| `POST` | `/api/auth/login` | Authenticate existing user & issue JWT |
| `POST` | `/api/auth/guest` | Instant guest login |
| `GET` | `/api/auth/me` | Validate session token & return profile |
| `GET` | `/api/movies` | Fetch all catalog movies |
| `GET` | `/api/movies/:id` | Fetch movie details & timeline trivia |
| `GET` | `/api/rooms` | List active watch rooms |
| `POST` | `/api/rooms` | Create new synchronized watch space |
| `GET` | `/api/rooms/:roomId` | Get room state, movie details, & host info |
| `POST` | `/api/ai/copilot` | Ask AI Co-Pilot a contextual scene question |
| `GET` | `/api/imdb/search` | Search titles on Free Movie DB (`q`, `tt`, `lsn`, `v`) |
| `GET` | `/api/imdb/justwatch` | Search streaming providers on JustWatch (`q`, `L`) |
| `GET` | `/api/imdb/photo/:id` | Fetch poster photo for IMDb ID (`w`, `h`) |
| `GET` | `/api/imdb/media/:id` | Fetch trailer / streaming media for IMDb ID |
| `GET` | `/api/imdb/trending` | Fetch trending movies, series, and anime (`category`) |
| `POST` | `/api/imdb/import` | Import IMDb title into Watch Space catalog |
| `GET` | `/api/history/:userId` | Retrieve user watch progress records |
| `POST` | `/api/history` | Update movie watch progress |
| `GET` | `/api/health` | System health, DB connection, & Gemini status |

---

## 5. Socket.io Event Protocol

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join-room` | Client ➔ Server | `{ roomId, user }` | Joins a watch room channel |
| `user-joined` | Server ➔ Room | `{ user, activeUsers }` | Broadcasts new participant |
| `video-play` | Host ➔ Server | `{ roomId, currentTime }` | Instructs all clients to play |
| `video-pause` | Host ➔ Server | `{ roomId, currentTime }` | Instructs all clients to pause |
| `video-seek` | Host ➔ Server | `{ roomId, currentTime }` | Synchronizes playhead position |
| `request-sync` | Client ➔ Server | `{ roomId }` | Requests timeline sync from host |
| `send-message` | Client ➔ Server | `{ roomId, text, user }` | Sends live chat message |
| `send-reaction`| Client ➔ Server | `{ roomId, emoji, user }` | Emits floating emoji reaction |
| `leave-room` | Client ➔ Server | `{ roomId, userId }` | Exits room session |

---

## 6. Summary

By keeping `explain.MD` as the single source of truth for technical architecture, the user-facing web application preserves an authentic, distraction-free Netflix viewing experience while retaining full engineering documentation for developers, evaluators, and project maintainers.
