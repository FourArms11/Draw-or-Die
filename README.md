# 🎨 Multiplayer Drawing Game

A real-time multiplayer drawing and guessing game built with the **MERN stack and Socket.IO**.

Players join a room, take turns drawing a secret word, and compete to guess it as quickly as possible.

## ✨ Features

* 🔐 User authentication with JWT
* 👥 Create and join multiplayer rooms
* 🎮 Real-time multiplayer gameplay
* 🎨 Collaborative drawing canvas
* 💬 Real-time chat and guessing
* ⏱️ Game timer and rounds
* 🏆 Scoreboard and final leaderboard
* 🔄 Basic disconnect/reconnection handling
* 📊 Match history

## 🛠️ Tech Stack

**Frontend**

* React
* Vite
* React Router
* Socket.IO Client
* HTML Canvas
* Tailwind CSS / CSS

**Backend**

* Node.js
* Express
* Socket.IO
* JWT
* bcrypt
* Mongoose

**Database**

* MongoDB / MongoDB Atlas

## 🏗️ Architecture

```text
React Client
     │
     ├──── REST API ────► Express ────► MongoDB
     │
     └── Socket.IO ─────► Node + Socket.IO
                              │
                              ▼
                       Game State Manager
                              │
                       Rooms / Players
                       Scores / Timer
                       Current Game
```

REST is used for persistent data such as authentication and match history, while Socket.IO handles real-time gameplay.

Active game state is kept in server memory, while persistent data is stored in MongoDB.

## 📁 Project Structure

```text
project/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── hooks/
│       ├── services/
│       └── sockets/
│
├── server/
│   └── src/
│       ├── models/
│       ├── routes/
│       ├── controllers/
│       ├── middleware/
│       ├── sockets/
│       └── game/
│
└── README.md
```

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 3. Configure environment variables

**Server**

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

**Client**

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Run the application

Start the server:

```bash
cd server
npm run dev
```

Start the client:

```bash
cd client
npm run dev
```

## 🗺️ Roadmap

* [x] Project setup
* [ ] Authentication
* [ ] Socket.IO foundation
* [ ] Multiplayer rooms
* [ ] Lobby and ready system
* [ ] Drawing canvas
* [ ] Real-time drawing
* [ ] Chat and guessing
* [ ] Game engine and scoring
* [ ] Timer and reconnection
* [ ] Match history
* [ ] Testing
* [ ] Deployment

The planned development timeline is approximately **10 weeks**, progressing from authentication and Socket.IO fundamentals to rooms, drawing, the game engine, testing, and deployment.

## 🚀 Future Ideas

* Difficulty levels
* Private rooms
* Spectator mode
* Typo-tolerant guesses
* AI-generated words and hints
* Player statistics
* Friends/invite system

## 👥 Team

Built as a team project using:

**React · Node.js · Express · MongoDB · Socket.IO**
