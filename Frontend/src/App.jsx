import { useState } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DrawingPage from "./pages/DrawingPage";
import { loginUser, registerUser } from "./services/api";
import { useAuth } from "./context/useAuth";

function App() {
  const [page, setPage] = useState("home");
  const [notice, setNotice] = useState("");
  const { user, login, logout } = useAuth();

  const navigate = (nextPage) => {
    setPage(nextPage);
    setNotice("");
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("home")} aria-label="Go to home">
          Draw <b>OR</b> Die
        </button>
        <nav className="topbar-actions" aria-label="Main navigation">
          <button className="nav-link" onClick={() => navigate("home")}>Home</button>
          {user ? (
            <>
              <span className="welcome-user">Hi, {user}</span>
              <button className="nav-link" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="nav-link" onClick={() => navigate("login")}>Login</button>
              <button className="nav-link" onClick={() => navigate("register")}>Register</button>
            </>
          )}
        </nav>
      </header>

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

      {page === "join" && (
        <main className="standalone-page">
          <div className="auth-card">
            <JoinGamePage onBack={() => navigate("home")} />
          </div>
        </main>
      )}

      {page === "drawing" && <DrawingPage onBack={() => navigate("home")} />}

      {page === "home" && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">THE DRAWING GUESSING GAME</p>
              <h1>Draw fast.<br /><em>Guess faster.</em></h1>
              <p className="hero-description">Create a room, invite your friends, and guess drawings before the timer runs out.</p>
              <div className="hero-actions">
                <button className="button button-primary button-large" onClick={() => navigate("drawing")}>Create Game</button>
                <button className="button button-outline button-large" onClick={() => navigate("join")}>Join Game</button>
              </div>
              {notice && <p className="notice" role="status">{notice}</p>}
            </div>
            <div className="doodle-board" aria-label="Drawing game preview">
              <span className="doodle doodle-word">DRAW<br />OR<br /><b>DIE</b></span>
            </div>
          </section>
          <section className="feature-row">
            <article><span>01</span><h2>Create a game</h2><p>Start a room and share the code with your friends.</p></article>
            <article><span>02</span><h2>Draw and guess</h2><p>Take turns drawing secret words and guessing quickly.</p></article>
            <article><span>03</span><h2>Win the round</h2><p>Earn points for correct guesses and creative drawings.</p></article>
          </section>
        </>
      )}
    </main>
  );
}

function JoinGamePage({ onBack }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const submit = (event) => {
    event.preventDefault();
    setMessage(`Room ${code.toUpperCase()} will be connected soon.`);
  };

  return (
    <div className="auth-content">
      <h2>Join Game</h2>
      <p className="auth-subtitle">Enter your room code to continue.</p>
      {message && <p className="success-message">{message}</p>}
      <form className="auth-form" onSubmit={submit}>
        <label>Room code<input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter room code" required /></label>
        <button className="button button-primary button-large">Join Game</button>
      </form>
      <p className="auth-switch"><button onClick={onBack}>Back to Home</button></p>
    </div>
  );
}

export default App;
