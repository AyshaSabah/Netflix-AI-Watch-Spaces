# 🍿 Netflix AI Watch Spaces

> A beginner-friendly social movie watch room where friends can watch movies in sync, chat live, enjoy timeline scene trivia, and get contextual answers from an **AI Co-Pilot powered by Google Gemini**.

---

## 🌟 Features Overview

1. **Netflix-Style Home Catalog**
   - Dark-mode streaming interface with featured banners and movie cards.
   - Each card displays movie title, poster, genre, duration, and a **"Watch Together"** button.

2. **User Authentication (JWT + MongoDB)**
   - User registration and login with bcrypt password hashing and JSON Web Tokens.
   - Includes a **1-Click Demo Guest Login** for instant access without registration.

3. **Synchronized Video Playback (Socket.io)**
   - The room host controls play, pause, and seeking.
   - All other room viewers receive updates in real-time, keeping everyone on the exact same second.
   - Includes a **Resync** button if any viewer's video drifts.

4. **Real-Time Live Chat & Floating Reactions**
   - Real-time group messaging with timestamps and host badges.
   - One-click emoji reactions (`🍿`, `❤️`, `😂`, `😱`, `🔥`, `👏`) that float live across the video player!

5. **AI Co-Pilot (Google Gemini 3.8)**
   - An intelligent assistant that knows the current movie, plot, genre, cast, and playback position.
   - Users can ask questions like *"Who is this character?"* or *"What is happening at 01:30?"* and receive concise, spoiler-conscious answers.

6. **Timeline Trivia Cards**
   - Timestamps stored in the database (e.g. `00:15`, `00:30`, `01:00`).
   - When the video reaches that point, a neat trivia card pops up over the video with fun facts and a direct link to ask the AI Co-Pilot for more details.

7. **User Dashboard & History**
   - Visual progress bar showing how much of each movie was watched.
   - Quick resume button to jump back into a watch space.

8. **Free Movie DB API (IMDb & JustWatch Integration)**
   - Integrates the **Free Movie Database API (FM-DB v0.3.1)**.
   - `/search` endpoint: Search millions of movies and series on IMDb by title query (`q`) or IMDb ID (`tt`).
   - `/justwatch` endpoint: Check real-time streaming providers (Netflix, Amazon Prime Video, Apple TV, Disney/Hotstar) and ratings.
   - 1-Click Import: Import any searched IMDb title into a Netflix Watch Space with live video sync and AI Co-Pilot commentary.

---

## 🛠️ Tech Stack

- **Frontend:** React (JavaScript / JSX), Tailwind CSS, Lucide Icons, Socket.io-client
- **Backend:** Node.js, Express.js, Socket.io
- **Movie Data API:** Free Movie DB API (`/search`, `/justwatch`) with high-availability fallback
- **Database:** MongoDB + Mongoose (with automated fallback in-memory store for zero-config local runs)
- **Authentication:** JSON Web Tokens (JWT) + Bcrypt
- **AI Integration:** Google Gemini API (`gemini-3.8-flash`)

---

## 📁 Project Structure

```text
netflix-ai-watch-spaces/
├── client/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx               # Header with brand, nav links, & user status
│       │   ├── MovieCard.jsx            # Catalog cards with "Watch Together" action
│       │   ├── VideoPlayer.jsx          # Synchronized HTML5 video player + reactions
│       │   ├── ChatPanel.jsx            # Live real-time chat with online user list
│       │   ├── AICopilotPanel.jsx       # Gemini-powered movie & scene Q&A
│       │   ├── TimelineTriviaCard.jsx   # Scene trivia pop-up cards
│       │   ├── AuthModal.jsx            # Login, Sign Up, & 1-click Demo guest login
│       │   ├── CreateRoomModal.jsx      # Launch custom watch rooms
│       │   └── JoinRoomModal.jsx        # Join room with 6-character room code
│       ├── pages/
│       │   ├── HomePage.jsx             # Hero banner, active spaces, movie catalog
│       │   ├── WatchRoomPage.jsx        # Synced video, host controls, chat & AI panel
│       │   └── DashboardPage.jsx        # Watch history, progress bars, active rooms
│       ├── services/
│       │   ├── api.js                   # REST API calls for auth, movies, history & AI
│       │   └── socket.js                # Socket.io connection helper
│       └── App.jsx                      # Primary layout and routing
├── server/
│   ├── config/
│   │   ├── db.js                        # Mongoose connection & initial movie seeder
│   │   └── inMemoryStore.js             # Fallback store if MongoDB isn't running locally
│   ├── models/
│   │   ├── User.js                      # User account model (name, email, password, avatar)
│   │   ├── Movie.js                     # Movie details, streaming URL, timeline events
│   │   ├── WatchRoom.js                 # Active room model (host, movie, playback state)
│   │   ├── ChatMessage.js               # Chat message history
│   │   ├── WatchHistory.js              # User watch history and progress
│   │   └── TimelineEvent.js             # Timestamp trivia moments for films
│   ├── controllers/
│   │   ├── authController.js            # Register, login, guest login, verify token
│   │   ├── movieController.js           # Get all movies and timeline trivia
│   │   ├── roomController.js            # Create rooms, list active spaces
│   │   ├── aiController.js              # Route user questions to Gemini AI
│   │   └── historyController.js         # Track watched movies and timestamp progress
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── roomRoutes.js
│   │   ├── aiRoutes.js
│   │   └── historyRoutes.js
│   ├── services/
│   │   ├── geminiService.js             # Calls Google GenAI SDK (gemini-3.8-flash)
│   │   └── socketService.js             # Video synchronization and real-time chat
│   ├── app.js                           # Express application configuration
│   └── server.js                        # Standalone Node.js HTTP server entrypoint
├── .env.example                         # Environment variable template
└── README.md
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- *(Optional)* **MongoDB** (if not installed or running, the app automatically falls back to the built-in memory store without any errors!)

### 2. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your `GEMINI_API_KEY` (optional if just testing locally, required for live AI generation):
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
MONGODB_URI="mongodb://localhost:27017/netflix_watch_spaces"
JWT_SECRET="your_secret_jwt_key"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Application
Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 How Key Features Work (In Simple Terms)

### 1. Synchronized Playback (`VideoPlayer.jsx` + `socketService.js`)
- When the host clicks **Play**, the browser triggers `video.play()` and sends an event `video:play` to the server with the current timestamp.
- The server receives this and broadcasts `video:play` to every other browser in that specific room.
- Non-host browsers receive `video:play`, update their video's `currentTime`, and start playing.
- To prevent infinite loops (where user A tells user B who tells user A), an `isRemoteAction` flag ensures only host manual gestures trigger outbound socket emissions.

### 2. AI Co-Pilot (`geminiService.js` + `AICopilotPanel.jsx`)
- The client sends a question along with the `movieId` and the `currentTimestamp` to `POST /api/ai/copilot`.
- On the server, we fetch the movie's plot, director, and any trivia tags occurring around that timestamp.
- We pass this structured prompt to the Gemini API (`gemini-3.8-flash`).
- Gemini answers within seconds, providing scene-aware, spoiler-safe commentary.

### 3. Timeline Trivia (`TimelineTriviaCard.jsx`)
- Each movie stores an array of interesting facts tied to specific seconds (e.g., at 10s: "Blender Cycles open-source milestone").
- During playback, the `<video>` element fires `timeupdate`.
- If the current time is within ±2.5 seconds of a trivia timestamp, the trivia card animates onto the screen.

### 4. MongoDB with Automatic Fallback (`db.js` + `inMemoryStore.js`)
- Standard Mongoose models (`User`, `Movie`, `WatchRoom`, `ChatMessage`, `WatchHistory`, `TimelineEvent`) are provided for production setups.
- If no MongoDB instance is detected, the app automatically routes calls to a memory-backed database, guaranteeing smooth, error-free testing in any environment.
