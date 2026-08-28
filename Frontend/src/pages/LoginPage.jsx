import { useState } from "react";
import "./LoginPage.css";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // API login logic will come here later
    console.log("Login submitted");
  };

  return (
    <div className="login-page">
      {/* Logo */}
      <div className="game-header">
        <h1>
          DRAW <span>OR</span> <strong>DIE</strong>
        </h1>

        <p>
          Draw fast. Guess faster. <strong>Survive.</strong>
        </p>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <h2>WELCOME BACK!</h2>

        <form onSubmit={handleSubmit}>
          {/* Email / Username */}
          <div className="input-group">
            <span className="input-icon">👤</span>

            <input
              type="text"
              id="identifier"
              name="identifier"
              placeholder="Email or Username"
              required
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <span className="input-icon">🔒</span>

            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Password"
              required
            />

            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* Options */}
          <div className="login-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <button type="button" className="forgot-password">
              Forgot password?
            </button>
          </div>

          {/* Login */}
          <button type="submit" className="login-btn">
            LOGIN
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span></span>
          <p>OR</p>
          <span></span>
        </div>

        {/* Guest */}
        <button className="guest-btn">
          🎮 PLAY AS GUEST
        </button>
      </div>

      {/* Register Link */}
      <div className="register-text">
        <p>
          Don't have an account?
          <span> Create one →</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;