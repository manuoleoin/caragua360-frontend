import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const redirect = new URLSearchParams(search).get("redirect") || "/perfil";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form.email, form.password);
      navigate(redirect.startsWith("/") ? redirect : "/perfil");
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel entrar.");
    } finally {
      setLoading(false);
    }
  }
  return <section className="auth-page">
      <img className="auth-bg" src="/images/login-folhas.jpg" alt="Folhas tropicais contra o céu azul" />
      <div className="auth-inner">
        <h1 className="auth-title">BEM-VINDO DE VOLTA</h1>
        <div className="auth-box">
          <h2>Login:</h2>
          <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
            <div className="field">
              <label htmlFor="email">Email:</label>
              <input
    id="email"
    type="email"
    autoComplete="email"
    className="input"
    value={form.email}
    onChange={(e) => setForm({ ...form, email: e.target.value })}
    required
  />
            </div>
            <div className="field">
              <label htmlFor="password">Senha:</label>
              <input
    id="password"
    type="password"
    autoComplete="current-password"
    className="input"
    value={form.password}
    onChange={(e) => setForm({ ...form, password: e.target.value })}
    required
  />
            </div>
            <div className="auth-row">
              <Link href="/esqueci-senha" className="auth-link">
                Esqueci a senha
              </Link>
            </div>
            {error ? <div className="form-error">{error}</div> : null}
            <button type="submit" className="btn btn--navy btn--block" disabled={loading}>
              {loading ? "Entrando\u2026" : "Entrar"}
            </button>
          </form>
          <p className="auth-alt">
            Não possui uma conta?{" "}
            <Link href={`/cadastro${search ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}>Cadastrar</Link>
          </p>
        </div>
      </div>
    </section>;
}
export {
  Login as default
};
