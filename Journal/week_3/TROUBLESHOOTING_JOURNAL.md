# Week 3 - Socket and Game-State Diagnostics

## Socket connects to the wrong server or as a guest



Check the frontend URL, credential support, and authentication data before connecting:

```js
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
});
```

If HTTP works but room events do not, check the browser's socket errors and verify both players joined the same room.

## Client/server score or timer desynchronization

**Status: Current scoring is server-authoritative.**

Do not calculate or award score from a browser's local countdown. The server uses its own remaining time, updates the player's score, then broadcasts room state:

```js
const guessScore = calculateGuesserScore(room.timeRemaining, room.settings.time);
player.score += guessScore;
syncRoomState(io, room);
```

```js
export function calculateGuesserScore(timeRemaining, totalTime) {
if (totalTime <= 0) return 50;
const ratio = Math.max(0, Math.min(1, timeRemaining / totalTime));
return 50 + Math.round(100 * ratio);
}
```

Clients should display server timer and score updates. For mismatches, compare the latest `room_state` with the final leaderboard and check for missed or duplicate socket listeners.
