import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
function Cadastro() {
  const { register, refresh } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const redirect = new URLSearchParams(search).get("redirect") || "/perfil";
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "TOURIST",
    city: "",
    neighborhood: "",
    password: "",
    confirmPassword: ""
  });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      if (photo) {
        try {
          await api.upload("/users/me/photo", photo, "perfil");
          await refresh();
        } catch {
          toast.error("Conta criada, mas n\xE3o foi poss\xEDvel enviar a foto.");
        }
      }
      toast.success("Cadastro realizado. Bem-vindo ao Caragua360!");
      navigate(redirect.startsWith("/") ? redirect : "/perfil");
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  }
  return <section className="auth-page">
      <img className="auth-bg" src="/images/cadastro-vegetacao.jpg" alt="Vegetação tropical de Caraguatatuba" />
      <div className="auth-inner auth-inner--wide">
        <h1 className="auth-title">CRIE SUA CONTA</h1>
        <div className="auth-box">
          <h2>Cadastro:</h2>
          <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
            <div className="form-grid">
              <div className="field span-2">
                <label htmlFor="fullName">Nome completo:</label>
                <input id="fullName" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required minLength={3} />
              </div>
              <div className="field span-2">
                <label htmlFor="email">Email:</label>
                <input id="email" type="email" autoComplete="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="field">
                <label htmlFor="role">Perfil:</label>
                <select id="role" className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="TOURIST">Turista</option>
                  <option value="RESIDENT">Morador colaborador</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">Cidade:</label>
                <input id="city" className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Caraguatatuba" />
              </div>
              <div className="field">
                <label htmlFor="neighborhood">Bairro:</label>
                <input id="neighborhood" className="input" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="photo">Foto (opcional):</label>
                <input id="photo" type="file" accept="image/*" className="input" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
              </div>
              <div className="field">
                <label htmlFor="password">Senha:</label>
                <input id="password" type="password" autoComplete="new-password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
                <span className="hint">Mínimo de 8 caracteres, com letras e números.</span>
              </div>
              <div className="field">
                <label htmlFor="confirmPassword">Confirme sua senha:</label>
                <input id="confirmPassword" type="password" autoComplete="new-password" className="input" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
            </div>
            {error ? <div className="form-error">{error}</div> : null}
            <button type="submit" className="btn btn--navy btn--block" disabled={loading}>
              {loading ? "Criando conta\u2026" : "Cadastrar"}
            </button>
          </form>
          <p className="auth-alt">
            Já tem uma conta? <Link href="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </section>;
}
export {
  Cadastro as default
};
