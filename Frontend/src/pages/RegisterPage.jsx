import { useState } from "react";

function RegisterPage({ onSubmit, onLogin }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
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
      <h2>Register</h2>
      <p className="auth-subtitle">Create an account to continue</p>
      {error && <p className="error-message" role="alert">{error}</p>}
      <form onSubmit={submit} className="auth-form">
        <label>Username<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required autoComplete="username" /></label>
        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" /></label>
        <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength="6" autoComplete="new-password" /></label>
        <button className="button button-primary button-large" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
      </form>
      <p className="auth-switch">Already have an account? <button onClick={onLogin}>Log in</button></p>
    </div>
  );
}

export default RegisterPage;
