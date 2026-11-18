# Draw or Die: Development Journal

**Last updated:** 2026-11-18
**Previous journal update:** 2026-11-17
**Time since previous update:** 1 day (less than 1 week)
**Journal format:** Weekly development summary

## Introduction

This journal records the problems encountered while developing **Draw or Die** and the progress completed so far. The project is a multiplayer drawing-and-guessing game built with React, Node.js, Express, MongoDB, and the planned Socket.IO real-time layer.

## 1. Project structure and setup

The project uses separate `Frontend` and `Backend` applications. This made the code easier to organize, but dependencies must be installed in both folders, the applications use different ports, and the frontend must point to the correct backend URL.

Environment variables and separate startup instructions were documented to make local development more predictable.

## 2. Node.js and MongoDB DNS problem

The backend had trouble connecting to MongoDB Atlas because Atlas connection strings use DNS SRV records. With the latest Node.js version/environment used during development, hostname resolution was not working reliably. The application could stop during startup even when the MongoDB URI was correct.

As a temporary workaround, the following was added to `Backend/server.js` before the database connection:

```js
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
```

This makes Node.js use Google's public DNS resolvers and helped resolve the MongoDB host during development.

This is a workaround rather than a permanent production fix. Public DNS may be blocked by a company, school, VPN, firewall, or hosting provider. The long-term solution is to use a supported Node.js LTS version, verify normal DNS resolution, check the MongoDB Atlas network access list, and remove the forced DNS servers if the deployment environment works correctly.

## 3. Backend configuration

Missing environment variables originally caused confusing errors later in startup. The backend configuration now checks for:

- `MONGO_URI`
- `PORT`
- `JWT_SECRET`

Failing early makes configuration problems easier to identify and prevents the server from running in a partially configured state.


## 4. Login and authentication

Login was added after registration. Users can log in with either an email address or username. During frontend/backend integration, request field names were not always consistent, so the backend supports `identifier` as well as the older email/username forms.

The API validates missing credentials and returns suitable status codes:

- `400` for missing login fields.
- `401` for invalid credentials.
- `500` for unexpected server errors.

Successful login creates a JWT and stores it in an HTTP-only cookie.

## 5. CORS and browser cookies

The Vite frontend and Express backend run on different local origins. Browser security rules caused requests and cookies to fail until both sides were configured correctly.

The fix required:

- Allowing the configured frontend origin in the backend CORS settings.
- Enabling `credentials` in Express CORS.
- Enabling `withCredentials` in Axios.
- Keeping the API URL configurable through `VITE_API_URL`.

Without all of these settings, login could appear successful in server logs while the browser failed to retain the cookie.


## Current progress

Completed so far:

1. Frontend/backend project structure.
2. Node.js, Express, React, and Vite setup.
3. MongoDB and Mongoose configuration.
4. Environment variable validation.
5. DNS workaround for the Node.js/MongoDB hostname resolution issue.
6. User registration with bcrypt password hashing.
7. Login with username/email support and JWT cookies.
8. CORS and credential support.
9. Axios frontend integration.
10. Initial home page, authentication modals, and theme switching.

## 7. Playable frontend game shell

The frontend now has a proper authenticated game journey instead of a single placeholder drawing screen:

- Login/register leads to the home dashboard.
- Create Game has controls for rounds, time per round, and player limit.
- Join Game accepts and normalizes a room code.
- Board is a separate page and can be opened from the top navigation.
- The board works locally with mouse and touch input, multiple colors, brush size, eraser, undo, clear, and a visible round timer.

Create and join do not yet connect the board to a Socket.IO room. They intentionally open the local board preview so the interaction and drawing surface can be tested before network synchronization is enabled.

The next milestone is to persist room settings through Socket.IO, connect the room lifecycle to the existing backend handlers, and test multiple connected clients, refreshes, disconnects, and server restarts.

## 8. Local waiting room

The create-game flow now generates a unique local room code and opens a waiting room. The host can see the selected settings, current player capacity, the host player entry, and a copy-code action while other players are expected to join. The room is intentionally not connected to the board or multiplayer transport yet.

The board preview was also simplified by removing the local countdown clock. It remains independently openable and keeps only the drawing tools needed to validate the canvas experience.

## 9. Real-Time Multiplayer Milestone Completion

The local shell has been successfully converted into a complete, reliable online multiplayer game without altering the original dark/red theme or folder structure:

1. **Backend Real-Time Architecture**:
   - `RoomManager.js`: Implemented in-memory room management, unique code generation, host reassignments, and abandoned room garbage collection.
   - `GameStateManager.js`: Added turn progression, drawer assignment, word selection, server-authoritative countdown timers, scoring, round end reveals, and match completion.
   - `wordBank.js`: Curated word bank with word masking utility for guessers.
   - `scoring.js`: Time-based dynamic scoring awarding higher points for rapid guesses and rewarding drawers for recognizable art.
   - `sockets/`: Modularized handlers for rooms, game lifecycle, draw synchronization, and room chat.
   - `auth.middleware.js`: Secure JWT verification for both Express routes and Socket.IO handshakes.
   - `Match.model.js`: Match history persistence and cumulative player stats updates in MongoDB.

2. **Frontend Real-Time Integration**:
   - Integrated `socket.io-client` with auto-reconnection and session persistence.
   - `DrawingBoard.jsx`: Pointer-based drawing with normalized (0..1) coordinate projection across varying client resolutions, stroke batching, undo, and canvas clear.
   - `ChatBox.jsx`: Room-isolated chat and guess submissions. Added spoiler protection so players who already guessed can chat privately without leaking the answer.
   - `WaitingRoom`: Live player lists, host indicators, and host-only game start validation.
   - `DrawingPage.jsx`: 3-column responsive layout with scoreboard, drawing canvas, real-time chat, round banner overlays, and final podium leaderboard.

3. **Verification**:
   - Verified frontend linting (`npm run lint`) and production build (`npm run build`).
   - Implemented automated end-to-end multiplayer test suite (`Backend/src/test_e2e.js`) covering user registration, login, cookie sessions, socket auth, room creation, multi-client joining, host-only game start, drawer/guesser secret word isolation, stroke synchronization, guess scoring, and disconnect handling.

## 10. Smooth Onboarding Flow & Game Audio

1. **Seamless Login & Signup Journey**:
   - Registration now automatically establishes the authenticated cookie session and navigates directly to the Home page, removing redundant manual login steps.
   - Login navigates directly to the Home dashboard with authenticated controls.

2. **Lobby & Host Game Control**:
   - Real-time waiting room lists each connected player as they join or leave with avatar initials, usernames, and a `(You)` tag for self-identification.
   - The "Start Now ➔" button is exclusively accessible to the host. Non-host players see an informative status indicator waiting for the host to launch the game.

3. **Event-based Game Audio (`gameAudio.js`)**:
   - Removed continuous background chill music.
   - Added a success sound when the correct word is guessed.
   - Added a chat notification sound for every incoming chat message.
   - Added ticking sounds during the final 10 seconds of a round.
   - Sounds are generated through the native Web Audio API without external audio downloads.

## 11. Weekly Update - 2026-11-17 to 2026-11-18

### Time passed

- Previous journal update: 2026-11-17
- This update: 2026-11-18
- Elapsed time: 1 day, which is less than one full week

### Gameplay rules

- Correct guesses award points immediately based on the remaining round time.
- The round continues until all non-drawer players have guessed or the timer reaches zero.
- Correct guessers stop leaking the secret word in normal chat.
- Drawer order is randomly shuffled at game start instead of always following host order.
- The round timer produces urgent ticking feedback during the final 10 seconds.

### Expanded word bank

The server word bank was expanded to 160 words and organized into categories:

- 20 Easy words
- 20 Medium words
- 20 Difficult words
- 15 Funny words
- 15 Technology words
- Additional legacy words retained for variety

`wordBank.js` now exports the category arrays separately and combines them into the main `WORDS` pool. Random selection still avoids recently used words during the active game.

### Homepage and navigation changes

- Removed the unused Board button from the top navigation.
- Added a dark, polished home dashboard.
- Added responsive player statistics for authenticated users:
  - Matches played
  - Matches won
  - Overall correct guesses
- Added automatic frontend stat refresh after correct guesses and completed games.

### Player and match statistics

MongoDB uses separate collections for different purposes:

- `users` stores authentication details and cumulative player statistics.
- `matches` stores completed-match history, rankings, scores, and winner information.

The overall correct-guesses count is stored as `stats.correctGuesses`. Match completion updates `stats.gamePlayed`, `stats.gameWon`, and `stats.totalScore`.

The screenshot and local test environment showed a `test` database because the MongoDB URI did not include an explicit database name. The intended production database is `draw9or9die`. The production connection string should specify that database directly:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/draw9or9die
```

The `test` database contains test-suite records such as `alice_test` and `bob_test`. It is not a second app user system and can be removed or ignored once the application uses an explicit database name.

### Chat and layout fixes

- Constrained the game chat panel with a fixed height.
- Added internal scrolling to the message area so long conversations do not extend the page.
- Added a soft notification sound for every incoming chat message.

### Verification

- Frontend lint passes.
- Frontend production build passes.
- Expanded word bank verified with 160 available words.
- Multiplayer end-to-end tests passed for the earlier full-suite run.
- A later local backend test run was blocked by MongoDB SRV DNS resolution at the configured Atlas hostname.


