# Draw or Die

Draw or Die is an interactive multiplayer drawing-and-guessing game. The project is split into a React/Vite frontend and an Express backend with MongoDB and planned Socket.IO room synchronization.

## Current playable progress

The frontend now has a complete local game shell:

- account registration and login flow
- authenticated home dashboard
- create-game settings for rounds, time per round, and player limit
- join-game room code flow
- a separate board page that is openable from the navigation
- pointer-based drawing with colors, brush size, eraser, undo, clear, and a round timer

Create and join currently open a local board preview rather than a networked room. This is deliberate: the board experience can be tested independently while the Socket.IO room lifecycle is completed.

## Run the applications

Install dependencies in both application folders, then start each app:

```bash
cd Backend
npm install
npm run dev

cd ../Frontend
npm install
npm run dev
```

See [Frontend/README.md](./Frontend/README.md) for the complete local client flow and the next real-time integration boundary.
