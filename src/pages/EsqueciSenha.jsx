import { useState } from "react";
import { Link } from "wouter";
import { api } from "@/lib/api";
function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel enviar o link.");
    } finally {
      setLoading(false);
    }
  }
  return <section className="auth-page">
      <img className="auth-bg" src="/images/login-folhas.jpg" alt="Folhas tropicais" />
      <div className="auth-inner">
        <h1 className="auth-title">RECUPERAR ACESSO</h1>
        <div className="auth-box">
          <h2>Esqueci a senha:</h2>
          {result ? <div style={{ display: "grid", gap: 14 }}>
              <div className="form-success">
                Se houver uma conta com este e-mail, enviamos um link de redefinição válido por 24 horas.
              </div>
              {result.devLink ? <p className="auth-note">
                  Servidor sem SMTP configurado. Para testes, use o link:{" "}
                  <a href={result.devLink} className="auth-link">
                    redefinir senha
                  </a>
                </p> : null}
              <Link href="/login" className="btn btn--navy btn--block">
                Voltar ao login
              </Link>
            </div> : <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
              <div className="field">
                <label htmlFor="email">Email cadastrado:</label>
                <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {error ? <div className="form-error">{error}</div> : null}
              <button type="submit" className="btn btn--navy btn--block" disabled={loading}>
                {loading ? "Enviando\u2026" : "Enviar link"}
              </button>
              <p className="auth-alt" style={{ marginTop: 0 }}>
                <Link href="/login">Voltar ao login</Link>
              </p>
            </form>}
        </div>
      </div>
    </section>;
}
export {
  EsqueciSenha as default
};
