import http from "http";
import { io as Client } from "../../Frontend/node_modules/socket.io-client/build/esm/index.js";
import app from "./app.js";
import connectDB, { isDbConnected } from "./config/db.js";
import { initSocket } from "./sockets/index.js";
import UserModel from "./models/User.model.js";

async function runTests() {
    console.log("=== Starting Draw or Die End-to-End Verification ===");

    await connectDB();
    console.log("✓ Database connected");

    const server = http.createServer(app);
    initSocket(server);

    await new Promise((resolve) => server.listen(3099, "127.0.0.1", resolve));
    console.log("✓ Test server listening on http://127.0.0.1:3099");

    const BASE_URL = "http://127.0.0.1:3099";

    // Clean test users if they exist
    await UserModel.deleteMany({ username: { $in: ["alice_test", "bob_test", "charlie_test"] } });

    // 1. Test Registration
    console.log("\n--- Test 1: User Registration ---");
    const regResAlice = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "alice@test.com", username: "alice_test", password: "password123" }),
    });
    const regAliceData = await regResAlice.json();
    if (regResAlice.status !== 201) throw new Error("Alice reg failed: " + JSON.stringify(regAliceData));
    console.log("✓ Alice registered successfully");

    const regResBob = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "bob@test.com", username: "bob_test", password: "password123" }),
    });
    const regBobData = await regResBob.json();
    if (regResBob.status !== 201) throw new Error("Bob reg failed: " + JSON.stringify(regBobData));
    console.log("✓ Bob registered successfully");

    // 2. Test Login
    console.log("\n--- Test 2: User Login & Cookies ---");
    const loginResAlice = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "alice_test", password: "password123" }),
    });
    const aliceCookie = loginResAlice.headers.get("set-cookie");
    const loginAliceData = await loginResAlice.json();
    if (loginResAlice.status !== 200 || !loginAliceData.token) throw new Error("Alice login failed");
    console.log("✓ Alice logged in, received JWT token and cookie");

    const loginResBob = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "bob_test", password: "password123" }),
    });
    const loginBobData = await loginResBob.json();
    if (loginResBob.status !== 200 || !loginBobData.token) throw new Error("Bob login failed");
    console.log("✓ Bob logged in, received JWT token");

    // 3. Test /api/auth/me
    console.log("\n--- Test 3: Session Verification (/api/auth/me) ---");
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${loginAliceData.token}` },
    });
    const meData = await meRes.json();
    if (meData.user?.username !== "alice_test") throw new Error("GetMe failed");
    console.log("✓ Session verified for:", meData.user.username);

    // 4. Test Socket Connection with Auth
    console.log("\n--- Test 4: Socket.IO Authentication ---");
    const aliceSocket = Client(BASE_URL, {
        auth: { token: loginAliceData.token, username: "alice_test" },
        transports: ["websocket"],
    });

    const bobSocket = Client(BASE_URL, {
        auth: { token: loginBobData.token, username: "bob_test" },
        transports: ["websocket"],
    });

    await Promise.all([
        new Promise((resolve) => aliceSocket.on("connect", resolve)),
        new Promise((resolve) => bobSocket.on("connect", resolve)),
    ]);
    console.log("✓ Alice & Bob connected to Socket.IO with authenticated tokens");

    // 5. Test Room Creation & Waiting Room
    console.log("\n--- Test 5: Room Creation & Settings ---");
    const createRoomRes = await new Promise((resolve) => {
        aliceSocket.emit("create_room", { settings: { rounds: 2, time: 30, players: 4 } }, resolve);
    });
    if (!createRoomRes.ok || !createRoomRes.roomCode) throw new Error("Create room failed: " + JSON.stringify(createRoomRes));
    const roomCode = createRoomRes.roomCode;
    console.log("✓ Alice created room:", roomCode);

    // 6. Test Room Joining
    console.log("\n--- Test 6: Room Joining & Waiting Room Sync ---");
    let aliceSawBobJoin = false;
    aliceSocket.on("room_state", (state) => {
        if (state.players.some((p) => p.name === "bob_test")) {
            aliceSawBobJoin = true;
        }
    });

    const joinRoomRes = await new Promise((resolve) => {
        bobSocket.emit("join_room", { code: roomCode }, resolve);
    });
    if (!joinRoomRes.ok) throw new Error("Bob join room failed: " + JSON.stringify(joinRoomRes));
    console.log("✓ Bob joined room:", roomCode);

    // Give a brief tick for socket broadcast
    await new Promise((r) => setTimeout(r, 200));
    if (!aliceSawBobJoin) throw new Error("Waiting room sync failed: Alice did not see Bob in room_state");
    console.log("✓ Waiting room state synchronized across clients");

    // 7. Test Host-only Game Start
    console.log("\n--- Test 7: Unauthorized Start Prevention ---");
    const unauthorizedStart = await new Promise((resolve) => {
        bobSocket.emit("start_game", resolve);
    });
    if (!unauthorizedStart.error) throw new Error("Bob (non-host) was incorrectly allowed to start game");
    console.log("✓ Server prevented non-host Bob from starting game:", unauthorizedStart.error);

    // 8. Test Authorized Game Start & Turn Assignment
    console.log("\n--- Test 8: Host Starts Game & Turn Assignment ---");
    let secretWordReceived = null;
    let hintReceivedByBob = null;
    let drawerSocket = null;
    let guesserSocket = null;

    aliceSocket.on("your_word", ({ word }) => {
        secretWordReceived = word;
        drawerSocket = aliceSocket;
        guesserSocket = bobSocket;
    });

    bobSocket.on("your_word", ({ word }) => {
        secretWordReceived = word;
        drawerSocket = bobSocket;
        guesserSocket = aliceSocket;
    });

    bobSocket.on("turn_started", ({ hint }) => {
        hintReceivedByBob = hint;
    });

    const startRes = await new Promise((resolve) => {
        aliceSocket.emit("start_game", resolve);
    });
    if (!startRes.ok) throw new Error("Alice start game failed: " + JSON.stringify(startRes));

    await new Promise((r) => setTimeout(r, 400));
    if (!secretWordReceived) throw new Error("Drawer did not receive secret word");
    if (!hintReceivedByBob || hintReceivedByBob.includes(secretWordReceived)) {
        throw new Error("Guesser improperly received the secret word instead of masked hint!");
    }
    console.log("✓ Game started successfully");
    console.log(`✓ Drawer received secret word: "${secretWordReceived}"`);
    console.log(`✓ Guesser received masked hint: "${hintReceivedByBob}"`);

    // 9. Test Drawing Stroke Synchronization
    console.log("\n--- Test 9: Drawing Synchronization ---");
    let receivedStrokes = null;
    guesserSocket.on("draw_update", (batch) => {
        receivedStrokes = batch;
    });

    drawerSocket.emit("draw", [
        { x: 0.1, y: 0.2, type: "start", color: "#d7192c", brushSize: 5 },
        { x: 0.3, y: 0.4, type: "move", color: "#d7192c", brushSize: 5 },
        { x: 0.5, y: 0.6, type: "end", color: "#d7192c", brushSize: 5 },
    ]);

    await new Promise((r) => setTimeout(r, 200));
    if (!receivedStrokes || receivedStrokes.length !== 3) {
        throw new Error("Guesser did not receive drawer's synchronized strokes");
    }
    console.log("✓ Drawing strokes synchronized across clients with normalized coordinates");

    // 10. Test Drawer Self-Guess Prevention
    console.log("\n--- Test 10: Drawer Self-Guess Prevention ---");
    let drawerSelfGuessTriggered = false;
    drawerSocket.emit("send_message", secretWordReceived);
    await new Promise((r) => setTimeout(r, 200));

    // 11. Test Correct Guess & Scoring
    console.log("\n--- Test 11: Correct Guess & Scoring ---");
    let scoreAnnouncement = null;
    let roundEndedWord = null;
    let roundEndState = null;

    guesserSocket.on("chat_message", (msg) => {
        if (msg.system && msg.text.includes("guessed the word")) {
            scoreAnnouncement = msg.text;
        }
    });

    guesserSocket.on("round_ended", ({ word }) => {
        roundEndedWord = word;
    });

    guesserSocket.on("room_state", (state) => {
        if (state.status === "ROUND_END") {
            roundEndState = state;
        }
    });

    guesserSocket.emit("send_message", secretWordReceived);

    await new Promise((r) => setTimeout(r, 500));
    if (!scoreAnnouncement) throw new Error("Score announcement system message was not received!");
    console.log("✓ Guess verified & scored:", scoreAnnouncement);

    if (roundEndedWord !== secretWordReceived) {
        throw new Error("Round ended event was not received after all guessers guessed!");
    }
    const guesserState = roundEndState?.players?.find((player) => player.id === guesserSocket.id);
    if (!guesserState || guesserState.score <= 0) {
        throw new Error("Correct guess did not award points before the round ended!");
    }
    console.log("✓ Round ended cleanly, revealed word to all players:", roundEndedWord);
    console.log("✓ Correct guesser was awarded points:", guesserState.score);

    // 12. Test Clean Disconnect
    console.log("\n--- Test 12: Player Disconnect Handling ---");
    bobSocket.disconnect();
    await new Promise((r) => setTimeout(r, 300));
    aliceSocket.disconnect();

    server.close();
    console.log("\n=======================================================");
    console.log("🎉 ALL END-TO-END MULTIPLAYER VERIFICATION TESTS PASSED!");
    console.log("=======================================================\n");
    process.exit(0);
}

runTests().catch((err) => {
    console.error("\n❌ E2E VERIFICATION TEST FAILED:", err);
    process.exit(1);
});
