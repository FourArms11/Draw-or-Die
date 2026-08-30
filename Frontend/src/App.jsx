import { useEffect, useState } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { loginUser, registerUser } from "./services/api";

const SAVED_USER_KEY = "draw-or-die-user";

function App() {
  const [authModal, setAuthModal] = useState(null);
  const [user, setUser] = useState(() => localStorage.getItem(SAVED_USER_KEY));
  const [theme, setTheme] = useState(() => localStorage.getItem("draw-or-die-theme") || "light");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("draw-or-die-theme", theme);
  }, [theme]);

  const showModal = (modal) => {
    setNotice("");
    setAuthModal(modal);
  };

  const handleRegister = async (form) => {
    await registerUser(form);
    setNotice("Account created! You can log in now.");
    setAuthModal("login");
  };

  const handleLogin = async (form) => {
    await loginUser(form);
    localStorage.setItem(SAVED_USER_KEY, form.identifier);
    setUser(form.identifier);
    setAuthModal(null);
    setNotice("");
  };

  const logout = () => {
    localStorage.removeItem(SAVED_USER_KEY);
    setUser(null);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setAuthModal(null)} aria-label="Go to home">
          <span className="brand-mark">✎</span>
          <span>DRAW <b>OR</b> DIE</span>
        </button>
        <div className="topbar-actions">
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "☾" : "☀"}
          </button>
          {user ? (
            <>
              <span className="welcome-user">Hi, {user}</span>
              <button className="button button-small button-ghost" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <button className="button button-small button-ghost" onClick={() => showModal("login")}>Log in</button>
              <button className="button button-small button-primary" onClick={() => showModal("register")}>Register</button>
            </>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">THE DRAWING GUESSING GAME</p>
          <h1>Draw fast.<br /><em>Guess faster.</em></h1>
          <p className="hero-description">Grab a pencil, rally your friends, and see who can sketch their way to the top.</p>
          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={() => setNotice("Game creation is coming soon!")}>✦ Create game</button>
            <button className="button button-outline button-large" onClick={() => setNotice("Joining games is coming soon!")}>↗ Join game</button>
          </div>
          {notice && <p className="notice" role="status">{notice}</p>}
        </div>
        <div className="doodle-board" aria-label="Decorative drawing board">
          <span className="doodle doodle-star">✦</span>
          <span className="doodle doodle-circle" />
          <span className="doodle doodle-arrow">↝</span>
          <span className="doodle doodle-word">DRAW<br />OR<br /><b>DIE</b></span>
          <span className="doodle doodle-scribble">〰</span>
        </div>
      </section>

      <section className="feature-row">
        <article><span>01</span><h2>Sketch it</h2><p>Get a secret word and make your best drawing before time runs out.</p></article>
        <article><span>02</span><h2>Guess it</h2><p>Race your friends to figure out what the artist is trying to say.</p></article>
        <article><span>03</span><h2>Win it</h2><p>Score points, climb the leaderboard, and become the ultimate doodler.</p></article>
      </section>

      {authModal && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setAuthModal(null)}>
          <div className="auth-modal" role="dialog" aria-modal="true">
            <button className="modal-close" onClick={() => setAuthModal(null)} aria-label="Close">×</button>
            {authModal === "login" ? (
              <LoginPage onSubmit={handleLogin} onRegister={() => showModal("register")} notice={notice} />
            ) : (
              <RegisterPage onSubmit={handleRegister} onLogin={() => showModal("login")} />
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
