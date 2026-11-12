import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { api, formatDate } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader, ProtectedRoute } from "@/components/ui-bits";
const STATUS_LABEL = {
  DRAFT: { label: "Rascunho", className: "badge" },
  PENDING: { label: "Em an\xE1lise", className: "badge badge--yellow" },
  APPROVED: { label: "Aprovado", className: "badge badge--green" },
  REJECTED: { label: "Rejeitado", className: "badge badge--red" }
};
function ProfileContent() {
  const { user, setUser, refresh, logout } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState("roteiros");
  const [query, setQuery] = useState("");
  const [itineraries, setItineraries] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", city: "", neighborhood: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", password: "", confirmPassword: "" });
  const [modalError, setModalError] = useState(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    try {
      const [mine, favs] = await Promise.all([
        api.get("/itineraries/mine"),
        api.get("/favorites")
      ]);
      setItineraries(mine.itineraries);
      setFavorites(favs.favorites);
      if (user?.role === "RESIDENT" || user?.role === "ADMIN") {
        const sug = await api.get("/suggestions/mine");
        setSuggestions(sug.suggestions);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel carregar seus dados.");
    }
  }, [user?.role]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (user) setForm({ fullName: user.fullName, city: user.city ?? "", neighborhood: user.neighborhood ?? "" });
  }, [user]);
  async function uploadPhoto(file) {
    try {
      const result = await api.upload("/users/me/photo", file, "perfil");
      setUser({ ...user, ...result.user });
      toast.success("Foto atualizada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel enviar a foto.");
    }
  }
  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      const result = await api.put("/users/me", form);
      setUser({ ...user, ...result.user });
      toast.success("Perfil atualizado.");
      setEditing(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel salvar.");
    } finally {
      setSaving(false);
    }
  }
  async function changePassword(event) {
    event.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      await api.post("/auth/change-password", passwords);
      setPasswords({ currentPassword: "", password: "", confirmPassword: "" });
      toast.success("Senha alterada. As outras sess\xF5es foram encerradas.");
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel alterar a senha.");
    } finally {
      setSaving(false);
    }
  }
  async function deleteItinerary(id) {
    if (!window.confirm("Excluir este roteiro? Esta a\xE7\xE3o n\xE3o pode ser desfeita.")) return;
    try {
      await api.delete(`/itineraries/${id}`);
      toast.success("Roteiro exclu\xEDdo.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel excluir.");
    }
  }
  async function removeFavorite(id) {
    try {
      await api.delete(`/favorites/${id}`);
      toast.success("Removido dos favoritos.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel remover.");
    }
  }
  async function deleteAccount() {
    const confirmation = window.prompt(
      "Sua conta ser\xE1 exclu\xEDda e seus dados pessoais removidos. Roteiros, avalia\xE7\xF5es e coment\xE1rios ser\xE3o preservados sem identifica\xE7\xE3o. Digite EXCLUIR para confirmar."
    );
    if (confirmation !== "EXCLUIR") return;
    try {
      await api.delete("/users/me");
      await refresh();
      toast.success("Conta exclu\xEDda.");
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel excluir a conta.");
    }
  }
  const filteredItineraries = (itineraries ?? []).filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  const filteredFavorites = (favorites ?? []).filter((item) => {
    const name = item.local?.name ?? item.accommodation?.name ?? item.restaurant?.name ?? item.itinerary?.title ?? "";
    return name.toLowerCase().includes(query.toLowerCase());
  });
  if (!user) return <Loader />;
  return <div className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="profile-head">
          <div className="profile-photo">
            {user.photoUrl ? <img src={user.photoUrl} alt={user.fullName} /> : user.fullName.slice(0, 2).toUpperCase()}
            <label>
              Alterar
              <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) void uploadPhoto(file);
    }}
  />
            </label>
          </div>
          <div>
            <h1 className="profile-name">{user.fullName}</h1>
            <p className="profile-username">
              @{user.username} · {user.role === "ADMIN" ? "Administrador" : user.role === "RESIDENT" ? "Morador colaborador" : "Turista"}
              {user.city ? ` \xB7 ${user.city}` : ""}
            </p>
            <p className="profile-username">Na plataforma desde {formatDate(user.createdAt)}</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginLeft: "auto" }}>
            <button type="button" className="btn btn--navy btn--sm" onClick={() => setEditing(true)}>
              Editar perfil
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => logout().then(() => navigate("/"))}>
              Sair
            </button>
            <button type="button" className="btn btn--danger btn--sm" onClick={deleteAccount}>
              Excluir conta
            </button>
          </div>
        </div>

        <div className="profile-toolbar">
          <div className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === "roteiros"} className={`tab ${tab === "roteiros" ? "is-active" : ""}`} onClick={() => setTab("roteiros")}>
              Meus roteiros
            </button>
            <button type="button" role="tab" aria-selected={tab === "favoritos"} className={`tab ${tab === "favoritos" ? "is-active" : ""}`} onClick={() => setTab("favoritos")}>
              Favoritos
            </button>
            <button type="button" role="tab" aria-selected={tab === "excluir"} className={`tab ${tab === "excluir" ? "is-active" : ""}`} onClick={() => setTab("excluir")}>
              Excluir roteiro
            </button>
          </div>
          <div className="search-box">
            <input placeholder="Procurar…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Procurar" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </div>
        </div>

        <div className="profile-panel">
          {tab === "roteiros" && <div className="profile-list">
              <div className="form-actions" style={{ marginBottom: 8 }}>
                <Link href="/roteiros/novo" className="btn btn--navy btn--sm">
                  + Criar roteiro
                </Link>
              </div>
              {!itineraries ? <Loader /> : null}
              {itineraries && filteredItineraries.length === 0 ? <div className="empty-state">Você ainda não criou roteiros.</div> : null}
              {filteredItineraries.map((itinerary) => <div key={itinerary.id} className="list-card">
                  <img src={itinerary.coverPhoto ?? itinerary.coverPhotoUrl ?? "/images/destino-tamandua.jpg"} alt={itinerary.title} />
                  <div>
                    <h4>{itinerary.title}</h4>
                    <div className="meta">
                      {itinerary.daysCount} dia(s) · atualizado em {formatDate(itinerary.updatedAt)}
                    </div>
                    <span className={STATUS_LABEL[itinerary.status].className}>{STATUS_LABEL[itinerary.status].label}</span>
                    {itinerary.status === "REJECTED" && itinerary.rejectionReason ? <p className="meta" style={{ marginTop: 6 }}>Motivo: {itinerary.rejectionReason}</p> : null}
                  </div>
                  <div className="actions">
                    <Link href={`/roteiros/${itinerary.id}`} className="btn btn--ghost btn--sm">
                      Ver
                    </Link>
                    {itinerary.status !== "PENDING" ? <Link href={`/roteiros/${itinerary.id}/editar`} className="btn btn--navy btn--sm">
                        Editar
                      </Link> : null}
                    {itinerary.status === "DRAFT" || itinerary.status === "REJECTED" ? <button
    type="button"
    className="btn btn--yellow btn--sm"
    onClick={async () => {
      try {
        await api.post(`/itineraries/${itinerary.id}/submit`);
        toast.success("Roteiro enviado para an\xE1lise.");
        await load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel enviar.");
      }
    }}
  >
                        Enviar
                      </button> : null}
                  </div>
                </div>)}
            </div>}

          {tab === "favoritos" && <div className="profile-list">
              {!favorites ? <Loader /> : null}
              {favorites && filteredFavorites.length === 0 ? <div className="empty-state">Nenhum favorito salvo.</div> : null}
              {filteredFavorites.map((favorite) => {
    const item = favorite.local ?? favorite.accommodation ?? favorite.restaurant;
    const photo = favorite.local?.photos?.[0]?.url ?? favorite.accommodation?.photos?.[0]?.url ?? favorite.restaurant?.photos?.[0]?.url ?? favorite.itinerary?.coverPhotoUrl ?? "/images/cat-praias.jpg";
    const name = item?.name ?? favorite.itinerary?.title ?? "Roteiro";
    const href = favorite.local ? `/destino/${favorite.local.id}` : favorite.accommodation ? `/detalhe/hospedagem/${favorite.accommodation.id}` : favorite.restaurant ? `/detalhe/restaurante/${favorite.restaurant.id}` : `/roteiros/${favorite.itinerary?.id}`;
    return <div key={favorite.id} className="list-card">
                    <img src={photo} alt={name} />
                    <div>
                      <h4>{name}</h4>
                      <div className="meta">
                        {favorite.local?.neighborhood ?? favorite.accommodation?.neighborhood ?? favorite.restaurant?.neighborhood ?? "Roteiro publicado"}
                      </div>
                    </div>
                    <div className="actions">
                      <Link href={href} className="btn btn--ghost btn--sm">
                        Abrir
                      </Link>
                      <button type="button" className="btn btn--danger btn--sm" onClick={() => removeFavorite(favorite.id)}>
                        Remover
                      </button>
                    </div>
                  </div>;
  })}
            </div>}

          {tab === "excluir" && <div className="profile-list">
              {itineraries && filteredItineraries.length === 0 ? <div className="empty-state">Nenhum roteiro para excluir.</div> : null}
              {filteredItineraries.map((itinerary) => <div key={itinerary.id} className="list-card">
                  <img src={itinerary.coverPhoto ?? itinerary.coverPhotoUrl ?? "/images/destino-tamandua.jpg"} alt={itinerary.title} />
                  <div>
                    <h4>{itinerary.title}</h4>
                    <div className="meta">
                      {itinerary.daysCount} dia(s) · {STATUS_LABEL[itinerary.status].label}
                    </div>
                  </div>
                  <div className="actions">
                    <button type="button" className="btn btn--danger btn--sm" onClick={() => deleteItinerary(itinerary.id)}>
                      Excluir roteiro
                    </button>
                  </div>
                </div>)}
            </div>}

          {suggestions.length > 0 ? <div className="builder-card" style={{ marginTop: 30 }}>
              <h2 style={{ fontSize: 30 }}>Minhas sugestões</h2>
              <div className="profile-list">
                {suggestions.map((suggestion) => <div key={suggestion.id} className="list-card">
                    <div>
                      <h4>{suggestion.title}</h4>
                      <div className="meta">{formatDate(suggestion.createdAt)}</div>
                      <span className={`badge ${suggestion.status === "APPROVED" ? "badge--green" : suggestion.status === "REJECTED" ? "badge--red" : "badge--yellow"}`}>
                        {suggestion.status === "PENDING" ? "Em an\xE1lise" : suggestion.status === "APPROVED" ? "Aprovada" : "Rejeitada"}
                      </span>
                    </div>
                  </div>)}
              </div>
              <Link href="/preservacao" className="btn btn--ghost btn--sm" style={{ marginTop: 12 }}>
                Enviar nova sugestão
              </Link>
            </div> : null}
        </div>
      </div>

      {editing ? <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>Editar perfil</h2>
            <form onSubmit={saveProfile} style={{ display: "grid", gap: 14 }}>
              <div className="field">
                <label htmlFor="fullName">Nome completo</label>
                <input id="fullName" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="city">Cidade</label>
                  <input id="city" className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="neighborhood">Bairro</label>
                  <input id="neighborhood" className="input" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
                </div>
              </div>
              {modalError ? <div className="form-error">{modalError}</div> : null}
              <div className="form-actions">
                <button type="submit" className="btn btn--navy btn--sm" disabled={saving}>
                  Salvar perfil
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(false)}>
                  Fechar
                </button>
              </div>
            </form>

            <hr style={{ margin: "26px 0", border: 0, borderTop: "1px solid var(--line)" }} />

            <h2 style={{ fontSize: 28 }}>Alterar senha</h2>
            <form onSubmit={changePassword} style={{ display: "grid", gap: 14 }}>
              <div className="field">
                <label htmlFor="currentPassword">Senha atual</label>
                <input id="currentPassword" type="password" className="input" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="newPassword">Nova senha</label>
                  <input id="newPassword" type="password" className="input" value={passwords.password} onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} required minLength={8} />
                </div>
                <div className="field">
                  <label htmlFor="confirmNewPassword">Confirmar nova senha</label>
                  <input id="confirmNewPassword" type="password" className="input" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn--ghost btn--sm" disabled={saving}>
                  Alterar senha
                </button>
              </div>
            </form>
          </div>
        </div> : null}
    </div>;
}
function Perfil() {
  return <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>;
}
export {
  Perfil as default
};
