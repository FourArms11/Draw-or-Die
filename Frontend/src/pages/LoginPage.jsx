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
      <p className="eyebrow">WELCOME BACK</p>
      <h2>Ready to play?</h2>
      <p className="auth-subtitle">Log in to jump back into the fun.</p>
      {notice && <p className="success-message">{notice}</p>}
      {error && <p className="error-message" role="alert">{error}</p>}
      <form onSubmit={submit} className="auth-form">
        <label>Email or username<input value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} required autoComplete="username" /></label>
        <label>Password<div className="password-field"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></div></label>
        <button className="button button-primary button-large" disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>
      </form>
      <p className="auth-switch">New here? <button onClick={onRegister}>Create an account</button></p>
    </div>
  );
}

export default LoginPage;
