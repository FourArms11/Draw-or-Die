import { useState } from "react";

function LoginPage({ onSubmit, onRegister, notice }) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-content">
      <div className="stamp" aria-hidden="true">LOG <b>IN</b></div>
      <h2>Login</h2>
      <p className="auth-subtitle">Welcome back! Enter your details to continue</p>
      {notice && <p className="success-message">{notice}</p>}
      {error && <p className="error-message" role="alert">{error}</p>}
      <form onSubmit={submit} className="auth-form">
        <label>
          Username or Email
          <input
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            placeholder="Enter your username or email"
            required
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        <button className="button button-primary button-large" disabled={loading}>
          {loading ? "Logging in..." : "Log in ➔"}
        </button>
      </form>
      <p className="auth-switch">Don't have an account? <button type="button" onClick={onRegister}>Create an account</button></p>
    </div>
  );
}

export default LoginPage;
