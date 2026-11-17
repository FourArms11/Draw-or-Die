# Draw or Die Frontend

The frontend is a React + Vite application for Draw or Die, featuring a dark theme with red accent styling, responsive design for desktop and touch devices, and real-time Socket.IO multiplayer synchronization.

## Features

- **Authentication**: Registration and login with automatic session restoration via `/api/auth/me`.
- **Game Setup**: Create rooms with custom settings (rounds, round timer, player capacity).
- **Waiting Room**: Real-time room status, player list updates, host indicators, and host-controlled start.
- **Drawing Canvas**: High-DPI canvas supporting mouse and touch, normalized coordinate projection, color swatches, brush sizing, eraser, undo, and clear canvas actions.
- **Multiplayer Synchronization**: Real-time stroke batching, server-managed round timers, live guess submissions, and room chat.
- **Results Overlays**: Round over reveal screen and match ending podium leaderboard.

## Run Locally

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

Lint codebase:
```bash
npm run lint
```
