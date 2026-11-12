import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { toast } from "sonner";
import { api } from "@/lib/api";
function RedefinirSenha() {
  const search = useSearch();
  const token = new URLSearchParams(search).get("token") ?? "";
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", { token, ...form });
      toast.success("Senha redefinida. Fa\xE7a login com a nova senha.");
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel redefinir a senha.");
    } finally {
      setLoading(false);
    }
  }
  return <section className="auth-page">
      <img className="auth-bg" src="/images/login-folhas.jpg" alt="Folhas tropicais" />
      <div className="auth-inner">
        <h1 className="auth-title">NOVA SENHA</h1>
        <div className="auth-box">
          <h2>Defina sua nova senha:</h2>
          {!token ? <div className="form-error">Link inválido. Solicite um novo link de recuperação.</div> : <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
              <div className="field">
                <label htmlFor="password">Nova senha:</label>
                <input id="password" type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
                <span className="hint">Mínimo de 8 caracteres, com letras e números.</span>
              </div>
              <div className="field">
                <label htmlFor="confirmPassword">Confirme a nova senha:</label>
                <input id="confirmPassword" type="password" className="input" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
              {error ? <div className="form-error">{error}</div> : null}
              <button type="submit" className="btn btn--navy btn--block" disabled={loading}>
                {loading ? "Salvando\u2026" : "Redefinir senha"}
              </button>
            </form>}
          <p className="auth-alt">
            <Link href="/esqueci-senha">Pedir outro link</Link>
          </p>
        </div>
      </div>
    </section>;
}
export {
  RedefinirSenha as default
};
