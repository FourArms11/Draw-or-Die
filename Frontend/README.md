# Draw or Die frontend

The frontend is a Vite/React client for the Draw or Die drawing-and-guessing game.

## Run locally

```bash
npm install
npm run dev
```

The current client flow is intentionally usable before the real-time room layer is connected:

1. Register or log in.
2. From Home, choose **Create game** and set rounds, round time, and player limit.
3. Choose **Join game** to enter a host's room code.
4. Open **Board** from the navigation at any time, or continue into the local board preview from either game flow.

The board supports mouse and touch pointer input, color selection, brush size, erasing, undo, clear, and a local round timer. Room settings and the board are currently local UI state; Socket.IO synchronization will be connected in the multiplayer milestone.
