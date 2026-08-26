# 🎨 Real-Time Multiplayer Drawing & Guessing Game

A real-time multiplayer drawing and guessing game built with the **MERN stack and Socket.IO**.

Players join a room, take turns drawing a secret word, and compete to guess it as quickly as possible. The game uses a **server-authoritative game engine**, real-time drawing synchronization, multiplayer rooms, chat, timers, scoring, and reconnection handling.

---

## 🚀 Project Overview

This project is designed as a full-stack multiplayer application where different technologies handle different types of communication:

* **REST API** → authentication, profiles, and persistent match history
* **Socket.IO** → real-time gameplay, rooms, drawing, chat, timers, scores, and turn changes
* **MongoDB** → persistent user and match data
* **In-memory server state** → active rooms and live game state

The core principle is:

> If the data needs to exist after the browser closes, persist it in MongoDB.
> If it only matters while players are actively in a game, keep it in server memory and synchronize it through Socket.IO.

## This separation avoids unnecessary database writes and keeps real-time gameplay responsive.

## ✨ Planned Features

### Authentication

* User registration
* User login
* JWT authentication
* Password hashing with bcrypt
* Protected routes
* JWT authentication for Socket.IO connections

### Multiplayer Rooms

* Create a room
* Join using a room code
* Live player list
* Host designation
* Ready/unready state
* Host-only game start
* Player join/leave notifications

### Drawing

* HTML Canvas-based drawing
* Adjustable brush size
* Color selection
* Eraser
* Clear canvas
* Real-time stroke synchronization
* Touch/pointer support

### Game

* Server-selected words
* Random turn rotation
* Multiple rounds
* Server-authoritative timer
* Server-side guess validation
* Score calculation
* Live scoreboard
* Round-end results
* Final leaderboard

### Chat & Guessing

* Real-time chat
* Guess submission
* Correct-guess detection
* Correct answer hidden from guessers
* Message validation
* Basic spam protection

### Reliability

* Socket reconnection
* Grace period for disconnected players
* Player restoration after reconnect
* Host reassignment
* Drawer disconnect handling
* Empty-room cleanup

### Persistence

* User profiles
* Player statistics
* Match history
* Final game results

---

## 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │     React Client     │
                         │ Vite + Canvas + UI   │
                         └──────────┬───────────┘
                                    │
                       ┌────────────┴────────────┐
                       │                         │
                    HTTPS                      WSS
                    REST                    Socket.IO
                       │                         │
                       ▼                         ▼
              ┌─────────────────┐      ┌─────────────────┐
              │  Express API    │      │ Socket.IO       │
              │                 │      │ Server          │
              │ /auth           │      │                 │
              │ /users          │      │ rooms           │
              │ /history        │      │ drawing         │
              └────────┬────────┘      │ chat            │
                       │                │ game state      │
                       │                └────────┬────────┘
                       ▼                         │
              ┌─────────────────┐                ▼
              │    MongoDB      │      ┌─────────────────┐
              │                 │      │ Game State      │
              │ Users           │      │ Manager         │
              │ GameHistory     │      │                 │
              │ Words (optional)│      │ Rooms           │
              └─────────────────┘      │ Players         │
                                       │ Scores          │
                                       │ Timer           │
                                       │ Current Word    │
                                       └─────────────────┘
```

The REST API and Socket.IO server run in the **same Node.js process and HTTP server**.

---

## 🛠️ Technology Stack

### Frontend

| Technology         | Purpose                   |
| ------------------ | ------------------------- |
| React              | UI                        |
| Vite               | Development/build tooling |
| React Router       | Application routing       |
| Socket.IO Client   | Real-time communication   |
| HTML Canvas API    | Drawing                   |
| Context API        | Shared application state  |
| Tailwind CSS / CSS | Styling                   |

### Backend

| Technology | Purpose                    |
| ---------- | -------------------------- |
| Node.js    | Runtime                    |
| Express    | REST API                   |
| Socket.IO  | Real-time multiplayer      |
| JWT        | Authentication             |
| bcrypt     | Password hashing           |
| Mongoose   | MongoDB ODM                |
| dotenv     | Environment configuration  |
| cors       | Cross-origin configuration |

### Database & Tools

* MongoDB / MongoDB Atlas
* Git & GitHub
* Postman
* Jest
* VS Code

The roadmap specifically recommends **Context API instead of introducing Redux/Zustand complexity** for this project timeline.

---

## 📁 Project Structure

The recommended structure is a **monorepo** containing both the client and server.

```text
project-root/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── canvas/
│   │   │   │   ├── DrawingCanvas.jsx
│   │   │   │   └── Toolbar.jsx
│   │   │   │
│   │   │   ├── room/
│   │   │   ├── chat/
│   │   │   └── game/
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── LobbyPage.jsx
│   │   │   ├── RoomPage.jsx
│   │   │   ├── GamePage.jsx
│   │   │   └── ResultsPage.jsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── SocketContext.jsx
│   │   │   └── GameContext.jsx
│   │   │
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── routes/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │
│   │   ├── sockets/
│   │   │   ├── index.js
│   │   │   ├── roomHandlers.js
│   │   │   ├── gameHandlers.js
│   │   │   ├── drawHandlers.js
│   │   │   └── chatHandlers.js
│   │   │
│   │   ├── game/
│   │   │   ├── GameStateManager.js
│   │   │   ├── RoomManager.js
│   │   │   ├── scoring.js
│   │   │   └── wordBank.js
│   │   │
│   │   └── utils/
│   │
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

Separating socket handlers by domain keeps room, game, drawing, and chat logic manageable, while the `game/` directory contains pure game logic that can be tested independently.

---

## 🔌 REST vs Socket.IO

The application deliberately uses **two communication systems**.

### REST API

Used for persistent data:

```text
POST /auth/register
POST /auth/login

GET  /users/:id
GET  /history
GET  /history/:id
```

### Socket.IO

Used for real-time events:

```text
create_room
join_room
leave_room

set_ready
start_game

draw
clear_canvas

send_message
submit_guess

ready_for_next_round
```

Gameplay events should not be implemented using REST polling because drawing, chat, timers, scores, and turn changes require near-instant propagation.

---

## 🎮 Game State Machine

The server manages the game using explicit states:

```text
             ┌─────────┐
             │ WAITING │
             └────┬────┘
                  │
                  ▼
             ┌─────────┐
             │STARTING │
             └────┬────┘
                  │
                  ▼
             ┌─────────┐
             │ DRAWING │
             └────┬────┘
                  │
                  ▼
             ┌───────────┐
             │ ROUND_END │
             └─────┬─────┘
                   │
             More rounds?
              /          \
            Yes           No
             │             │
             ▼             ▼
       ┌──────────┐   ┌──────────┐
       │NEXT_ROUND│   │ GAME_END │
       └────┬─────┘   └──────────┘
            │
            └──────────► STARTING
```

The server is authoritative for:

* Current drawer
* Current word
* Guess correctness
* Timer
* Turn order
* Scores
* Round transitions
* Game completion

Clients only **request actions and render server state**.

---

## 🧠 Server-Authoritative Design

This is one of the most important architectural decisions.

The client must **never** be trusted to determine:

```text
❌ "I am the drawer"
❌ "My guess is correct"
❌ "I won the round"
❌ "The timer has ended"
❌ "I have 500 points"
```

Instead:

```text
Client
   │
   │ "I want to guess giraffe"
   ▼
Server
   │
   ├── Check current word
   ├── Check player state
   ├── Calculate score
   └── Update game state
           │
           ▼
      Broadcast result
```

This prevents players from modifying client-side state through browser developer tools and cheating.

---

## 🎨 Real-Time Drawing

The application **does not send complete canvas images** over Socket.IO.

Instead, it sends small stroke events:

```js
{
  x: 120,
  y: 240,
  color: "#000000",
  brushSize: 5,
  type: "move"
}
```

Possible stroke types:

```text
start
move
end
```

The receiving clients reconstruct the drawing using the Canvas 2D API.

### Why?

Sending a complete `canvas.toDataURL()` image repeatedly creates large payloads and unnecessary bandwidth usage.

Stroke-based synchronization provides:

* Smaller payloads
* Lower latency
* Better multiplayer performance
* Better mobile performance

High-frequency pointer events should also be batched/throttled using `requestAnimationFrame`.

---

## 📡 Socket Event Reference

### Client → Server

| Event                  | Purpose               |
| ---------------------- | --------------------- |
| `create_room`          | Create a new room     |
| `join_room`            | Join an existing room |
| `leave_room`           | Leave a room          |
| `set_ready`            | Change ready status   |
| `start_game`           | Host starts the game  |
| `draw`                 | Send drawing stroke   |
| `clear_canvas`         | Clear drawing         |
| `send_message`         | Send chat/guess       |
| `submit_guess`         | Submit a guess        |
| `ready_for_next_round` | Signal readiness      |

### Server → Client

| Event           | Purpose                    |
| --------------- | -------------------------- |
| `player_joined` | Player joined              |
| `player_left`   | Player left                |
| `room_error`    | Room-related error         |
| `game_starting` | Countdown                  |
| `turn_changed`  | New drawer                 |
| `draw_update`   | Incoming drawing stroke    |
| `chat_message`  | Chat message               |
| `correct_guess` | Correct guess notification |
| `timer_update`  | Timer update               |
| `score_update`  | Score update               |
| `round_ended`   | Round completed            |
| `game_ended`    | Game completed             |

---

## 🗄️ Database Design

### MongoDB

Persistent data:

```text
User
├── username
├── passwordHash
├── createdAt
└── stats
    ├── gamesPlayed
    ├── gamesWon
    └── totalScore
```

```text
GameHistory
├── roomCode
├── players
│   ├── userId
│   ├── username
│   ├── finalScore
│   └── correctGuesses
├── rounds
├── startedAt
└── endedAt
```

An optional `Word` collection can store:

```text
Word
├── text
├── category
└── difficulty
```

### In-memory

Active gameplay stays in server memory:

```text
Room
├── players
├── currentDrawer
├── currentWord
├── scores
├── timer
├── round
└── guesses
```

Active room state is deliberately **not stored in MongoDB** because it changes frequently and has no long-term value after the game ends.

---

## 🔐 Authentication Flow

```text
User
 │
 ▼
Login via REST
 │
 ▼
JWT generated
 │
 ▼
Client initializes Socket.IO
 │
 │ auth: { token }
 ▼
Socket.IO Middleware
 │
 ▼
JWT Verification
 │
 ▼
socket.userId
socket.username
 │
 ▼
Authenticated Socket Connection
```

The server derives identity from the JWT handshake and does not trust `userId` values supplied in gameplay events.

---

## 🔄 Reconnection Strategy

Multiplayer games must handle unreliable connections.

### Browser Refresh

The client can store the room code in `sessionStorage` and attempt to reconnect automatically.

### Temporary Disconnect

The server keeps the player's slot for a short grace period.

```text
Disconnect
    │
    ▼
Mark player disconnected
    │
    ├──── Reconnect ────► Restore player
    │
    └──── Timeout ──────► Remove player
```

### Special Cases

* **Drawer disconnects** → skip/finish the round and rotate the drawer
* **Host disconnects** → assign a new host
* **Player reconnects** → restore their existing player slot using `userId`
* **Empty room** → eventually remove the room from memory

The roadmap recommends a practical grace period rather than an over-engineered distributed recovery system.

---

## 🧪 Testing Strategy

### Unit Tests

Use Jest for pure game logic:

* Score calculations
* Guess matching
* Word selection
* State transitions
* Turn rotation

### REST Testing

Use Postman for:

* Registration
* Login
* Authentication
* History endpoints

### Multiplayer Testing

Use:

* Multiple browser tabs
* Multiple real users
* `socket.io-client` scripts

### Stress Testing

Simulate approximately 8–10 clients joining a room and interacting with the server.

### Important Edge Cases

* Drawer disconnects
* Host disconnects
* Player refreshes mid-game
* Player joins during a round
* Timer reaches zero
* Everyone guesses incorrectly
* Two players guess correctly simultaneously
* Non-host attempts to start
* Non-drawer sends drawing events
* Room becomes empty

These are specifically identified as important test scenarios in the roadmap.

---

## 🚀 Development Roadmap

| Week | Milestone | Goal                                    |
| ---- | --------- | --------------------------------------- |
| 1    | M0 + M1   | Project setup + authentication          |
| 2    | M2        | Socket.IO foundation + chat experiment  |
| 3    | M3        | Multiplayer room system                 |
| 4    | M4        | Lobby + ready states                    |
| 5    | M5        | Solo drawing canvas                     |
| 6    | M6        | Real-time drawing + chat + guessing     |
| 7    | M7        | Core game engine                        |
| 8    | M8        | Timer + reconnection                    |
| 9    | M9        | Testing + match history + responsive UI |
| 10   | M10 + M11 | Deployment + final polish               |

The intended development style is **vertical slices**: build the frontend and backend for a feature together instead of completing the entire backend first.

---

## 📌 Milestones

### M0 — Project Setup

* Repository
* Client/server setup
* Environment configuration

### M1 — Authentication

* Register
* Login
* JWT
* Protected routes

### M2 — Socket Foundation

* Socket.IO connection
* JWT socket authentication

### M3 — Room System

* Create room
* Join room
* Live player list

### M4 — Lobby

* Ready states
* Host permissions
* Start game

### M5 — Canvas MVP

* Drawing
* Brush
* Eraser
* Clear
* Colors

### M6 — Real-Time Drawing + Chat

* Stroke synchronization
* Chat
* Guess detection

### M7 — Core Game Engine

* State machine
* Turns
* Words
* Scoring

### M8 — Timer + Reconnection

* Server timer
* Disconnect handling
* Rejoin support

### M9 — Testing + History

* Jest
* Match history
* Responsive UI
* Edge cases

### M10 — Deployment

* Production frontend
* Production backend
* MongoDB Atlas
* CORS/WSS configuration

### M11 — Polish

* UI refinement
* Documentation
* Optional AI features

---

## 🤖 Optional AI Features

AI is intentionally **not part of the core game engine**.

Possible future additions:

* Dynamic word/category generation
* AI-generated hints
* Difficulty-based word generation
* Post-game summaries
* Optional moderation

AI should remain a bolt-on feature. Core systems such as **word correctness, scoring, turn order, and game state must remain deterministic and server-controlled**.

---

## 🔮 Future Features

### Version 2

* Match history
* Profile statistics
* Typo-tolerant guesses
* Spectator mode
* Private/password rooms
* Difficulty levels
* Basic profanity filter

### Advanced

* AI-generated categories
* AI moderation
* Friends/invite system
* Statistics dashboards
* Power-ups

The roadmap explicitly recommends finishing the MVP before adding these features.

---

## 👥 Team Responsibilities

For a 4–5 person team:

| Role                | Responsibility                               |
| ------------------- | -------------------------------------------- |
| Backend / Real-Time | Socket.IO, rooms, game engine, socket auth   |
| Frontend / Canvas   | Drawing system and canvas synchronization    |
| Frontend / UI       | Lobby, chat, scoreboard, results             |
| Backend / DB        | Auth, MongoDB, history, deployment           |
| QA / Documentation  | Testing, edge cases, README, GitHub workflow |

Room-system and game-engine development should be handled collaboratively because their frontend/backend event contracts need to evolve together.

---

## 🧩 Mini Projects Before the Main Game

Before implementing the complete game, build these small experiments:

### 1. Socket.IO Chat

Learn:

* Connecting
* Emitting
* Broadcasting
* Client/server events

### 2. Shared Moving Object

Two users control a shared `<div>` and see its position update in real time.

Learn:

* Frequent updates
* Low-latency synchronization
* Conflict handling

### 3. Collaborative Canvas

Build a basic multiplayer canvas without:

* Rooms
* Turns
* Words
* Scores

This isolates the hardest part of the project — real-time drawing synchronization.

---

## 🔁 Development Philosophy

For every new concept:

```text
Learn
  ↓
Build a Small Experiment
  ↓
Integrate Into Main Project
  ↓
Test With Multiple Users
  ↓
Commit
```

Avoid spending weeks watching tutorials before building. The roadmap recommends limiting initial learning for a new concept to roughly **1–2 hours**, then learning through implementation and experiments.

---

## 🌿 GitHub Workflow

### Branches

```text
main
 │
 └── dev
      │
      ├── feature/room-system
      ├── feature/canvas-sync
      ├── feature/game-engine
      ├── fix/reconnect-drawer
      └── refactor/game-state-manager
```

### Commit Convention

Use Conventional Commits:

```text
feat: add socket-based room join and leave events
feat: implement stroke-based canvas synchronization
fix: prevent non-host from starting game
fix: handle drawer disconnect mid-round
refactor: extract game state into GameStateManager
test: add unit tests for scoring logic
docs: update README
chore: configure socket CORS
```

### Branch Rules

* `main` should always be deployable
* Use `dev` for integration
* Feature branches should branch from `dev`
* PRs should be reviewed by at least one teammate
* Map GitHub milestones to project milestones
* Tag weekly releases

---

## ⚙️ Local Development

### Prerequisites

Make sure you have:

* Node.js
* npm
* MongoDB / MongoDB Atlas account
* Git

### Clone

```bash
git clone <repository-url>
cd <project-directory>
```

### Install Dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### Environment Variables

Create the appropriate `.env` files.

Example backend configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

Example frontend configuration:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

> Never commit `.env` files or secrets to GitHub.

---

## ▶️ Running the Project

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

Then open the Vite development URL in your browser.

For multiplayer testing, open the application in multiple browser tabs and connect different users to the same room.

---

## 🌍 Deployment

Recommended architecture:

```text
React / Vite
     │
     ▼
Vercel / Netlify
     │
     │ HTTPS
     ▼
Node.js + Express + Socket.IO
     │
     │
     ▼
MongoDB Atlas
```

Recommended hosting:

| Component        | Platform         |
| ---------------- | ---------------- |
| React frontend   | Vercel / Netlify |
| Node + Socket.IO | Render / Railway |
| Database         | MongoDB Atlas    |

The Socket.IO server requires a long-lived server process and should not be deployed as a pure serverless function. Production deployment also requires correct CORS and WebSocket upgrade configuration.

---

## 🎯 MVP Definition

The first playable version should contain:

* [x] Registration/login
* [x] Unique usernames
* [x] Create/join rooms
* [x] Live player list
* [x] Host role
* [x] Ready system
* [x] Canvas drawing
* [x] Real-time stroke synchronization
* [x] Chat
* [x] Guess detection
* [x] Word selection
* [x] Turn rotation
* [x] Timer
* [x] Scoring
* [x] Multiple rounds
* [x] Final leaderboard
* [x] Basic disconnect handling
* [x] Deployed playable game

These constitute the roadmap's intended MVP scope.

---

## 🧭 Core Engineering Principles

This project follows five major architectural constraints:

1. **Server-authoritative game logic**
2. **In-memory active game state**
3. **MongoDB for persistent data**
4. **Stroke-based drawing synchronization**
5. **JWT authentication over the Socket.IO handshake**

AI remains optional and must never control core gameplay logic.

---

## 📜 License

Add your project's chosen license here.

---

## 👨‍💻 Team

Built as a team project using:

**React · Node.js · Express · MongoDB · Socket.IO**
