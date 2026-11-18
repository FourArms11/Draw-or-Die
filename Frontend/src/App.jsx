import { useState, useEffect, useCallback } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DrawingPage from "./pages/DrawingPage";
import { loginUser, registerUser } from "./services/api";
import { useAuth } from "./context/useAuth";
import socket, { connectSocket } from "./sockets/socket";
import { playChatMessage, playGuessSuccess, playTimerTick } from "./utils/gameAudio";

const defaultSettings = { rounds: "3", time: "60", players: "8" };

function App() {
  const [page, setPage] = useState("home");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [settings, setSettings] = useState(defaultSettings);
  const [roomCode, setRoomCode] = useState("");
  const [roomState, setRoomState] = useState(null);
  const [currentWord, setCurrentWord] = useState("");
  const [hint, setHint] = useState("");
  const [timer, setTimer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [roundEndInfo, setRoundEndInfo] = useState(null);
  const [gameOverInfo, setGameOverInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, login, logout } = useAuth();

  const navigate = useCallback((nextPage) => {
    setPage(nextPage);
    setNotice("");
    setErrorMessage("");
  }, []);

  const openAuthenticated = (nextPage) => {
    if (!user) {
      setNotice("Log in or create an account to start playing.");
      navigate("login");
      return;
    }
    navigate(nextPage);
  };

  // Socket event subscriptions
  useEffect(() => {
    if (user) {
      connectSocket({ username: user });
    }

    const handleRoomState = (state) => {
      setRoomState(state);
      if (state.code) setRoomCode(state.code);

      if (state.hint) setHint(state.hint);
      if (state.timeRemaining !== undefined && state.timeRemaining !== null) {
        setTimer(state.timeRemaining);
      }

      if (state.status === "DRAWING" || state.status === "ROUND_END") {
        setPage("drawing");
      }
    };

    const handleTurnStarted = ({ hint: newHint, time, drawerId }) => {
      setHint(newHint);
      setTimer(time);
      setRoundEndInfo(null);
      if (drawerId !== socket.id) {
        setCurrentWord("");
      }
      setPage("drawing");
    };

    const handleYourWord = ({ word }) => {
      setCurrentWord(word);
    };

    const handleTimerUpdate = (newTime) => {
      setTimer(newTime);
      if (newTime > 0 && newTime <= 10) {
        playTimerTick();
      }
    };

    const handleRoundEnded = (info) => {
      setRoundEndInfo(info);
      setCurrentWord("");
      if (info.reason?.includes("guessed the word")) {
        playGuessSuccess();
      }
    };

    const handleGameEnded = (info) => {
      setGameOverInfo(info);
      setCurrentWord("");
    };

    const handleChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      playChatMessage();
    };

    const handleGameError = ({ message }) => {
      setErrorMessage(message || "An error occurred");
    };

    const handleKicked = ({ message }) => {
      setNotice(message || "Session ended: logged in from another window.");
      logout();
      setRoomState(null);
      setPage("login");
    };

    socket.on("room_state", handleRoomState);
    socket.on("turn_started", handleTurnStarted);
    socket.on("your_word", handleYourWord);
    socket.on("timer_update", handleTimerUpdate);
    socket.on("round_ended", handleRoundEnded);
    socket.on("game_ended", handleGameEnded);
    socket.on("chat_message", handleChatMessage);
    socket.on("game_error", handleGameError);
    socket.on("kicked", handleKicked);

    return () => {
      socket.off("room_state", handleRoomState);
      socket.off("turn_started", handleTurnStarted);
      socket.off("your_word", handleYourWord);
      socket.off("timer_update", handleTimerUpdate);
      socket.off("round_ended", handleRoundEnded);
      socket.off("game_ended", handleGameEnded);
      socket.off("chat_message", handleChatMessage);
      socket.off("game_error", handleGameError);
      socket.off("kicked", handleKicked);
    };
  }, [user, page, logout]);

  // Signup -> immediately logged in and taken to Home
  const handleRegister = async (form) => {
    const data = await registerUser(form);
    login(data.user || form.username, data.token);
    setNotice("Welcome! Your account was created successfully.");
    setPage("home");
  };

  // Login -> logged in and taken to Home
  const handleLogin = async (form) => {
    const data = await loginUser(form);
    login(data.user || form.identifier, data.token);
    setNotice("");
    setPage("home");
  };

  const handleLogout = async () => {
    if (roomState) {
      socket.emit("leave_room");
      setRoomState(null);
    }
    await logout();
    setPage("home");
  };

  const createGame = (event) => {
    event.preventDefault();
    if (!user) {
      openAuthenticated("login");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    connectSocket({ username: user });

    socket.emit("create_room", { settings }, (res) => {
      setIsSubmitting(false);
      if (res?.error) {
        setErrorMessage(res.error);
        return;
      }
      if (res?.ok) {
        setRoomCode(res.roomCode);
        setMessages([]);
        setRoundEndInfo(null);
        setGameOverInfo(null);
        navigate("waiting");
      }
    });
  };

  const joinGame = (event) => {
    event.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (!code) return;

    if (!user) {
      openAuthenticated("login");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    connectSocket({ username: user });

    socket.emit("join_room", { code }, (res) => {
      setIsSubmitting(false);
      if (res?.error) {
        setErrorMessage(res.error);
        return;
      }
      if (res?.ok) {
        setRoomCode(res.roomCode);
        setMessages([]);
        setRoundEndInfo(null);
        setGameOverInfo(null);
        navigate("waiting");
      }
    });
  };

  const handleStartGame = () => {
    setIsSubmitting(true);
    socket.emit("start_game", (res) => {
      setIsSubmitting(false);
      if (res?.error) {
        setErrorMessage(res.error);
      }
    });
  };

  const handleLeaveRoom = () => {
    socket.emit("leave_room");
    setRoomState(null);
    setRoomCode("");
    setCurrentWord("");
    setHint("");
    setTimer(null);
    setMessages([]);
    setRoundEndInfo(null);
    setGameOverInfo(null);
    navigate("home");
  };

  const handleSendMessage = (text) => {
    socket.emit("send_message", text);
  };

  const isHost = roomState?.host === socket.id;

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("home")} aria-label="Go to home">
          <img src="/logo.png" alt="Draw or Die" className="navbar-logo" />
        </button>
        <nav className="topbar-actions" aria-label="Main navigation">
          <button className="nav-link" onClick={() => navigate("home")}>Home</button>

          {user ? (
            <>
              <span className="welcome-user">Hi, {user}</span>
              <button className="nav-link" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="nav-link" onClick={() => navigate("login")}>Login</button>
              <button className="nav-link nav-register" onClick={() => navigate("register")}>Register</button>
            </>
          )}
        </nav>
      </header>

      {errorMessage && (
        <div style={{ maxWidth: "1040px", margin: "16px auto 0", padding: "0 22px" }}>
          <p className="error-message" role="alert">{errorMessage}</p>
        </div>
      )}

      {page === "login" && (
        <main className="standalone-page">
          <div className="auth-card">
            <LoginPage onSubmit={handleLogin} onRegister={() => navigate("register")} notice={notice} />
          </div>
        </main>
      )}

      {page === "register" && (
        <main className="standalone-page">
          <div className="auth-card">
            <RegisterPage onSubmit={handleRegister} onLogin={() => navigate("login")} />
          </div>
        </main>
      )}

      {page === "create" && (
        <CreateGamePage
          settings={settings}
          setSettings={setSettings}
          onSubmit={createGame}
          onBack={() => navigate("home")}
          loading={isSubmitting}
        />
      )}

      {page === "join" && (
        <JoinGamePage
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          onSubmit={joinGame}
          onBack={() => navigate("home")}
          loading={isSubmitting}
        />
      )}

      {page === "waiting" && (
        <WaitingRoom
          roomCode={roomCode || roomState?.code || ""}
          settings={roomState ? { rounds: roomState.maxRounds, time: roomState.roundTime, players: roomState.playerLimit } : settings}
          players={roomState?.players || [{ id: socket.id, name: user || "Host", isHost: true }]}
          currentSocketId={socket.id}
          isHost={isHost}
          onBack={handleLeaveRoom}
          onStartGame={handleStartGame}
          loading={isSubmitting}
        />
      )}

      {page === "drawing" && (
        <DrawingPage
          roomState={roomState}
          socket={socket}
          currentWord={currentWord}
          hint={hint}
          timer={timer}
          onLeaveRoom={handleLeaveRoom}
          messages={messages}
          onSendMessage={handleSendMessage}
          roundEndInfo={roundEndInfo}
          gameOverInfo={gameOverInfo}
          onBackToLobby={handleLeaveRoom}
        />
      )}

      {page === "home" && (
        <HomePage
          user={user}
          notice={notice}
          onCreate={() => openAuthenticated("create")}
          onJoin={() => openAuthenticated("join")}
        />
      )}
    </main>
  );
}

function WaitingRoom({
  roomCode,
  settings,
  players = [],
  currentSocketId = null,
  isHost = false,
  onBack,
  onStartGame,
  loading = false,
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const playerCount = players.length;
  const canStart = isHost && playerCount >= 2;

  return (
    <main className="waiting-page">
      <button className="back-link" onClick={onBack}>← Back home</button>
      <section className="waiting-card">
        <p className="eyebrow">ROOM LOBBY</p>
        <h1>Waiting for your crew.</h1>
        <p className="waiting-description">Share this code with friends. Once everyone joins, the host can start the game.</p>

        <div className="room-code-display">
          <span>{roomCode}</span>
          <button type="button" onClick={copyCode}>
            {copied ? "Copied!" : "Copy code"}
          </button>
        </div>

        <div className="waiting-details">
          <div><span>Rounds</span><strong>{settings.rounds}</strong></div>
          <div><span>Players</span><strong>{playerCount} / {settings.players}</strong></div>
          <div><span>Round time</span><strong>{settings.time}s</strong></div>
        </div>

        <div className="player-list">
          <h2>Connected Players ({playerCount})</h2>
          {players.map((p) => {
            const displayName = typeof p === "string" ? p : p.name;
            const isPlayerHost = typeof p === "object" && p.isHost;
            const isMe = typeof p === "object" && p.id === currentSocketId;

            return (
              <div className="player-row" key={typeof p === "string" ? p : p.id}>
                <span className="player-avatar">{displayName.charAt(0).toUpperCase()}</span>
                <span>
                  {displayName}
                  {isMe && <span className="player-you-tag">(You)</span>}
                </span>
                {isPlayerHost && <b>Host</b>}
              </div>
            );
          })}

          <div className="player-row player-placeholder">
            <span className="player-avatar">+</span>
            <span>Waiting for more players to enter room code...</span>
          </div>
        </div>

        {/* ONLY THE HOST CAN CLICK START NOW */}
        {isHost ? (
          <div>
            <button
              className="button button-primary button-large waiting-board-button"
              onClick={onStartGame}
              disabled={!canStart || loading}
            >
              {loading
                ? "Starting..."
                : canStart
                ? "Start Now ➔"
                : "Waiting for players to join (Need 2+)"}
            </button>
            {!canStart && (
              <p className="form-footnote" style={{ marginTop: "12px", textAlign: "center" }}>
                Invite a friend or open a second browser window with room code <strong>{roomCode}</strong>.
              </p>
            )}
          </div>
        ) : (
          <div className="guest-waiting-box">
            <p className="notice" style={{ fontSize: "1.05rem", margin: "0 0 6px" }}>
              ⏳ Waiting for the host to click Start Now...
            </p>
            <p className="form-footnote">Only the host can start the match.</p>
          </div>
        )}

      </section>
    </main>
  );
}

function HomePage({ user, notice, onCreate, onJoin }) {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">DRAW OR DIE</p>
          <h1>Draw and guess<br /><em>with friends.</em></h1>
          <p className="hero-description">Create a room or join one with a code. Chill together, draw in real time, and beat the clock.</p>
          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={onCreate}>Create game</button>
            <button className="button button-outline button-large" onClick={onJoin}>Join game</button>
          </div>
          {notice && <p className="notice" role="status">{notice}</p>}
          {!user && <p className="login-hint">Sign up or log in first to create or join private rooms with your friends.</p>}
        </div>
        <div className="doodle-board logo-preview" aria-label="Draw or Die logo">
          <img src="/logo.png" alt="" />
        </div>
      </section>
      <section className="feature-row">
        <article><h2>Set the rules</h2><p>Choose rounds, time, and how many friends can join.</p></article>
        <article><h2>Draw together</h2><p>Use colors, brush sizes, and a real canvas that works with mouse or touch.</p></article>
        <article><h2>Beat the clock</h2><p>Guess quickly, score points, and make every second count.</p></article>
      </section>
    </div>
  );
}

function CreateGamePage({ settings, setSettings, onSubmit, onBack, loading = false }) {
  const update = (key) => (event) => setSettings({ ...settings, [key]: event.target.value });
  return (
    <main className="game-setup">
      <button className="back-link" onClick={onBack}>← Back home</button>
      <div className="setup-layout">
        <form className="setup-card create-game-card" onSubmit={onSubmit}>
          <div className="card-heading"><div><h2>Create game</h2><p>Your room, your rules.</p></div></div>
          <label>Number of rounds <select value={settings.rounds} onChange={update("rounds")}><option value="1">1 round</option><option value="3">3 rounds</option><option value="5">5 rounds</option><option value="10">10 rounds</option></select></label>
          <label>Time per round <select value={settings.time} onChange={update("time")}><option value="30">30 seconds</option><option value="60">60 seconds</option><option value="90">90 seconds</option><option value="120">2 minutes</option></select></label>
          <label>Player limit <select value={settings.players} onChange={update("players")}><option value="4">4 players</option><option value="6">6 players</option><option value="8">8 players</option><option value="12">12 players</option></select></label>
          <button className="button button-primary button-large" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create room"} <span>→</span>
          </button>
        </form>
      </div>
    </main>
  );
}

function JoinGamePage({ roomCode, setRoomCode, onSubmit, onBack, loading = false }) {
  return (
    <main className="game-setup join-setup">
      <button className="back-link" onClick={onBack}>← Back home</button>
      <div className="setup-layout">
        <form className="setup-card" onSubmit={onSubmit}>
          <div className="card-heading"><div><h2>Join game</h2><p>One code gets you in.</p></div></div>
          <label>Room code<input className="room-code-input" value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} placeholder="E.g. SKETCH7" maxLength="8" required /></label>
          <button className="button button-primary button-large" type="submit" disabled={loading}>
            {loading ? "Joining..." : "Join room"} <span>→</span>
          </button>
          <p className="form-footnote">No code yet? Ask the game host to share it with you.</p>
        </form>
      </div>
    </main>
  );
}

export default App;
