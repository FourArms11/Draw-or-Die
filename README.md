# Draw or Die

Draw or Die is an online multiplayer drawing-and-guessing game built with React, Node.js, Express, MongoDB, and Socket.IO.

Players can register, create rooms with custom settings, join via room codes, draw in real time with stroke synchronization, chat, submit guesses, and compete on a live scoreboard.

## Features

- **Authentication**: User registration, login, and secure sessions via HTTP-only JWT cookies.
- **Multiplayer Rooms**: Create private rooms with custom rounds, round duration, and player limits.
- **Live Waiting Room**: Real-time room synchronization as players join or leave.
- **Host Ownership**: Only the room host can start the match.
- **Real-Time Drawing**: Responsive canvas supporting mouse and touch pointer events, normalized coordinates (0..1) for consistent cross-device rendering, custom brush sizes, color palette, eraser, undo, and canvas clear.
- **Secret Word Security**: Only the assigned drawer receives the secret word. Guessers see masked blanks (`_ _ _ _`).
- **Scoring System**: Time-based scoring for fast guessers and reward points for the drawer.
- **Spoiler-Safe Chat**: Room chat with rate limiting. Once a player guesses the word, their chat is hidden from remaining guessers to prevent spoilers.
- **Game State Automation**: Server-side countdown timers, round transitions, and match completion with winner podium and stats persistence.
- **Soothing Chill Ambient Music**: Built-in procedural lo-fi ambient audio player powered by the Web Audio API with a toggle in the navigation bar to relax and play together.

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

## Environment Variables

### Backend (`Backend/.env`)

```env
MONGO_URI=mongodb url
PORT= your port
JWT_SECRET=you secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`Frontend/.env` - optional)

```env
VITE_API_URL=http://localhost:3000
```

## Getting Started

### 1. Start the Backend

```bash
cd Backend
npm install
npm run dev
```

The backend server runs on `http://localhost:3000`. You can verify server and DB health at `http://localhost:3000/api/health`.

To run the automated multiplayer test suite:
```bash
npm test
```

### 2. Start the Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend client runs on `http://localhost:5173`.

## How to Test with Multiple Windows

1. Open `http://localhost:5173` in a standard browser window.
2. Register an account (e.g. `Alice`) and click **Create Game**. Choose your preferred rounds and round time, then click **Create room**.
3. Copy the generated room code from the waiting room.
4. Open an Incognito/Private window (or a different browser profile) at `http://localhost:5173`.
5. Register a second account (e.g. `Bob`) and click **Join Game**. Enter the room code and submit.
6. Notice the waiting room updates live for both players.
7. As `Alice` (the host), click **Start Game**.
8. Both windows will transition into the live game:
   - The assigned drawer sees the secret word and has drawing tools enabled.
   - The guesser sees masked word blanks and can submit guesses in the chat box.
   - Drawing strokes, clear, undo, and timer count down in real time.
   - When the guesser types the word, points are awarded, a system announcement appears, and the round transitions.

## Notes & Limitations

- At least 2 players are required to start a game.
- If a drawer disconnects during their turn, the turn ends automatically and passes to the next player.
- Live active game sessions run in memory on the server for low-latency synchronization, while match histories and user statistics persist in MongoDB.
