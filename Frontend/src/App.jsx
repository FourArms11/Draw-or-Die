import { useState } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DrawingPage from "./pages/DrawingPage";
import { loginUser, registerUser } from "./services/api";
import { useAuth } from "./context/useAuth";

const defaultSettings = { rounds: "3", time: "60", players: "8" };

function App() {
  const [page, setPage] = useState("home");
  const [notice, setNotice] = useState("");
  const [settings, setSettings] = useState(defaultSettings);
  const [roomCode, setRoomCode] = useState("");
  const [waitingPlayers, setWaitingPlayers] = useState([]);
  const { user, login, logout } = useAuth();

  const navigate = (nextPage) => {
    setPage(nextPage);
    setNotice("");
  };

  const openAuthenticated = (nextPage) => {
    if (!user) {
      setNotice("Log in to create or join a game.");
      navigate("login");
      return;
    }
    navigate(nextPage);
  };

  const handleRegister = async (form) => {
    await registerUser(form);
    setNotice("Account created. You can log in now.");
    setPage("login");
  };

  const handleLogin = async (form) => {
    await loginUser(form);
    login(form.identifier);
    setPage("home");
  };

  const createGame = (event) => {
    event.preventDefault();
    const code = `SKETCH${Math.floor(100 + Math.random() * 900)}`;
    setRoomCode(code);
    setWaitingPlayers([user || "Host"]);
    navigate("waiting");
  };

  const joinGame = (event) => {
    event.preventDefault();
    if (!roomCode.trim()) return;
    setNotice(`Joined room ${roomCode.trim().toUpperCase()} in preview mode.`);
    navigate("drawing");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("home")} aria-label="Go to home">
          <img src="/logo.png" alt="Draw or Die" className="navbar-logo" />
        </button>
        <nav className="topbar-actions" aria-label="Main navigation">
          <button className="nav-link" onClick={() => navigate("home")}>Home</button>
          <button className="nav-link" onClick={() => openAuthenticated("drawing")}>Board</button>
          {user ? (
            <>
              <span className="welcome-user">Hi, {user}</span>
              <button className="nav-link" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="nav-link" onClick={() => navigate("login")}>Login</button>
              <button className="nav-link nav-register" onClick={() => navigate("register")}>Register</button>
            </>
          )}
        </nav>
      </header>

      {page === "login" && (
        <main className="standalone-page"><div className="auth-card">
          <LoginPage onSubmit={handleLogin} onRegister={() => navigate("register")} notice={notice} />
        </div></main>
      )}
      {page === "register" && (
        <main className="standalone-page"><div className="auth-card">
          <RegisterPage onSubmit={handleRegister} onLogin={() => navigate("login")} />
        </div></main>
      )}
      {page === "create" && (
        <CreateGamePage settings={settings} setSettings={setSettings} onSubmit={createGame} onBack={() => navigate("home")} />
      )}
      {page === "join" && (
        <JoinGamePage roomCode={roomCode} setRoomCode={setRoomCode} onSubmit={joinGame} onBack={() => navigate("home")} />
      )}
      {page === "waiting" && (
        <WaitingRoom
          roomCode={roomCode}
          settings={settings}
          players={waitingPlayers}
          onBack={() => navigate("home")}
          onOpenBoard={() => navigate("drawing")}
        />
      )}
      {page === "drawing" && <DrawingPage onBack={() => navigate("home")} settings={settings} notice={notice} />}
      {page === "home" && (
        <HomePage user={user} notice={notice} onCreate={() => openAuthenticated("create")} onJoin={() => openAuthenticated("join")} />
      )}
    </main>
  );
}

function WaitingRoom({ roomCode, settings, players, onBack, onOpenBoard }) {
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch {
      // Copy is a convenience; the code remains visible if clipboard access is unavailable.
    }
  };

  return (
    <main className="waiting-page">
      <button className="back-link" onClick={onBack}>← Back home</button>
      <section className="waiting-card">
        <p className="eyebrow">ROOM CREATED</p>
        <h1>Waiting for your crew.</h1>
        <p className="waiting-description">Share this unique code with the players you want to invite.</p>
        <div className="room-code-display">
          <span>{roomCode}</span>
          <button type="button" onClick={copyCode}>Copy code</button>
        </div>
        <div className="waiting-details">
          <div><span>Rounds</span><strong>{settings.rounds}</strong></div>
          <div><span>Players</span><strong>{players.length} / {settings.players}</strong></div>
          <div><span>Round time</span><strong>{settings.time}s</strong></div>
        </div>
        <div className="player-list">
          <h2>Players in room</h2>
          {players.map((player) => <div className="player-row" key={player}><span className="player-avatar">{player.charAt(0).toUpperCase()}</span><span>{player}</span><b>Host</b></div>)}
          <div className="player-row player-placeholder"><span className="player-avatar">+</span><span>Waiting for players to join...</span></div>
        </div>
        <button className="button button-primary button-large waiting-board-button" onClick={onOpenBoard}>Open board preview <span>→</span></button>
        <p className="form-footnote">The room is local for now. Multiplayer joining will be connected next.</p>
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
          <p className="hero-description">Create a room or join one with a code. The drawing board is ready when you are.</p>
          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={onCreate}>Create game</button>
            <button className="button button-outline button-large" onClick={onJoin}>Join game</button>
          </div>
          {notice && <p className="notice" role="status">{notice}</p>}
          {!user && <p className="login-hint">Log in first to start playing with your friends.</p>}
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

function CreateGamePage({ settings, setSettings, onSubmit, onBack }) {
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
          <button className="button button-primary button-large" type="submit">Create room <span>→</span></button>
        </form>
      </div>
    </main>
  );
}

function JoinGamePage({ roomCode, setRoomCode, onSubmit, onBack }) {
  return (
    <main className="game-setup join-setup">
      <button className="back-link" onClick={onBack}>← Back home</button>
      <div className="setup-layout">
        <form className="setup-card" onSubmit={onSubmit}>
          <div className="card-heading"><div><h2>Join game</h2><p>One code gets you in.</p></div></div>
          <label>Room code<input className="room-code-input" value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} placeholder="E.g. SKETCH7" maxLength="8" required /></label>
          <button className="button button-primary button-large" type="submit">Join room <span>→</span></button>
          <p className="form-footnote">No code yet? Ask the game host to share it with you.</p>
        </form>
      </div>
    </main>
  );
}

export default App;
