import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data =
        mode === "login"
          ? await authAPI.login({ email: form.email, password: form.password })
          : await authAPI.register({ name: form.name, email: form.email, password: form.password });
      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.card}>

        {/* Logo */}
        <div style={s.logo}>
          <div style={s.logoIcon}>💬</div>
          <span style={s.logoText}>PulseChat</span>
        </div>

        <h1 style={s.heading}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p style={s.sub}>
          {mode === "login"
            ? "Sign in to continue"
            : "Join and start chatting"}
        </p>

        <form onSubmit={handleSubmit} style={s.form}>
          {mode === "register" && (
            <div style={s.field}>
              <label style={s.label}>Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                style={s.input}
              />
            </div>
          )}

          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@email.com"
              required
              style={s.input}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={s.input}
            />
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in →" : "Create account →"}
          </button>
        </form>

        <p style={s.switchRow}>
          {mode === "login" ? "No account? " : "Have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={s.switchBtn}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "#0D0D0D",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    fontFamily: "'Outfit', sans-serif",
  },
  card: {
    background: "#161616",
    border: "1px solid #2a2a2a",
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 400,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  logoIcon: {
    fontSize: 28,
    lineHeight: 1,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.03em",
  },
  heading: {
    fontSize: 26,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 6px",
    letterSpacing: "-0.02em",
  },
  sub: {
    fontSize: 14,
    color: "#555",
    margin: "0 0 28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  input: {
    background: "#1e1e1e",
    border: "1px solid #2a2a2a",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#fff",
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    outline: "none",
  },
  error: {
    color: "#ff6b6b",
    fontSize: 13,
    background: "rgba(255,107,107,0.1)",
    border: "1px solid rgba(255,107,107,0.2)",
    borderRadius: 8,
    padding: "9px 12px",
  },
  btn: {
    background: "#E8FF47",
    color: "#0D0D0D",
    border: "none",
    borderRadius: 10,
    padding: "13px",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    cursor: "pointer",
    marginTop: 4,
    letterSpacing: "-0.01em",
  },
  switchRow: {
    textAlign: "center",
    color: "#555",
    fontSize: 13,
    marginTop: 20,
    fontFamily: "'Outfit', sans-serif",
  },
  switchBtn: {
    background: "none",
    border: "none",
    color: "#E8FF47",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Outfit', sans-serif",
    padding: 0,
  },
};
