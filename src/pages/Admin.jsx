import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, formatDate } from "@/lib/api";
import { Loader, ProtectedRoute } from "@/components/ui-bits";
const CONTENT_CONFIG = {
  locals: {
    label: "Praias, pontos, trilhas e cachoeiras",
    endpoint: "/locals",
    itemKey: "local",
    fields: [
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "category", label: "Categoria", type: "select", options: ["PRAIA", "PONTO", "TRILHA", "CACHOEIRA"], required: true },
      { key: "neighborhood", label: "Bairro", type: "text" },
      { key: "description", label: "Descri\xE7\xE3o", type: "textarea", required: true },
      { key: "access", label: "Acesso", type: "textarea" },
      { key: "capacity", label: "Lota\xE7\xE3o", type: "text" },
      { key: "sea", label: "Mar", type: "text" },
      { key: "structure", label: "Estrutura", type: "textarea" },
      { key: "profile", label: "Perfil", type: "text" },
      { key: "photos", label: "Fotos", type: "photos" }
    ]
  },
  events: {
    label: "Eventos",
    endpoint: "/events",
    itemKey: "event",
    fields: [
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "startDate", label: "In\xEDcio", type: "date", required: true },
      { key: "endDate", label: "Fim", type: "date" },
      { key: "time", label: "Hor\xE1rio", type: "text" },
      { key: "place", label: "Local", type: "text", required: true },
      { key: "address", label: "Endere\xE7o", type: "text" },
      { key: "entryInfo", label: "Entrada", type: "text" },
      { key: "description", label: "Descri\xE7\xE3o", type: "textarea", required: true },
      { key: "photos", label: "Fotos", type: "photos" }
    ]
  },
  accommodations: {
    label: "Hospedagens",
    endpoint: "/accommodations",
    itemKey: "accommodation",
    fields: [
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "category", label: "Tipo", type: "select", options: ["Hotel", "Pousada"] },
      { key: "neighborhood", label: "Bairro", type: "text" },
      { key: "address", label: "Endere\xE7o", type: "text" },
      { key: "contactPhone", label: "Telefone", type: "text" },
      { key: "priceRange", label: "Faixa de pre\xE7o", type: "text" },
      { key: "amenities", label: "Comodidades (separadas por v\xEDrgula)", type: "text" },
      { key: "description", label: "Descri\xE7\xE3o", type: "textarea", required: true },
      { key: "photos", label: "Fotos", type: "photos" }
    ]
  },
  restaurants: {
    label: "Restaurantes",
    endpoint: "/restaurants",
    itemKey: "restaurant",
    fields: [
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "neighborhood", label: "Bairro", type: "text" },
      { key: "address", label: "Endere\xE7o", type: "text" },
      { key: "contact", label: "Contato", type: "text" },
      { key: "cuisine", label: "Cozinha", type: "text" },
      { key: "priceRange", label: "Faixa de pre\xE7o", type: "text" },
      { key: "openingHours", label: "Hor\xE1rios (uma linha por dia: Dia: hor\xE1rio)", type: "lines" },
      { key: "description", label: "Descri\xE7\xE3o", type: "textarea", required: true },
      { key: "photos", label: "Fotos", type: "photos" }
    ]
  },
  activities: {
    label: "Atividades",
    endpoint: "/activities",
    itemKey: "activity",
    fields: [
      { key: "name", label: "Nome", type: "text", required: true },
      { key: "location", label: "Local", type: "text" },
      { key: "contact", label: "Contato", type: "text" },
      { key: "schedule", label: "Hor\xE1rios", type: "text" },
      { key: "priceInfo", label: "Valores", type: "text" },
      { key: "description", label: "Descri\xE7\xE3o", type: "textarea", required: true },
      { key: "photos", label: "Fotos", type: "photos" }
    ]
  },
  sustainability: {
    label: "Preserva\xE7\xE3o",
    endpoint: "/sustainability",
    itemKey: "content",
    fields: [
      { key: "title", label: "T\xEDtulo", type: "text", required: true },
      { key: "category", label: "Categoria", type: "select", options: ["DICA", "ORIENTACAO", "CAMPANHA", "PROJETO", "DESCARTE"] },
      { key: "summary", label: "Resumo", type: "text", required: true },
      { key: "content", label: "Conte\xFAdo", type: "textarea", required: true },
      { key: "photos", label: "Imagem", type: "photos" },
      { key: "published", label: "Publicado", type: "checkbox" }
    ]
  }
};
function emptyForm(fields) {
  const base = {};
  for (const field of fields) {
    if (field.type === "photos") base[field.key] = [];
    else if (field.type === "checkbox") base[field.key] = true;
    else if (field.type === "select") base[field.key] = field.options?.[0] ?? "";
    else if (field.type === "number") base[field.key] = 0;
    else base[field.key] = "";
  }
  return base;
}
function ContentManager({ type }) {
  const config = CONTENT_CONFIG[type];
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(emptyForm(config.fields));
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    try {
      const endpoint = type === "sustainability" ? "/admin/sustainability" : config.endpoint;
      const result = await api.get(endpoint);
      const list = result[type === "sustainability" ? "contents" : type];
      setItems(list ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel carregar.");
    }
  }, [config.endpoint, type]);
  useEffect(() => {
    void load();
  }, [load]);
  function startCreate() {
    setForm(emptyForm(config.fields));
    setEditingId(null);
    setOpen(true);
    setError(null);
  }
  async function startEdit(id) {
    setError(null);
    try {
      const endpoint = type === "sustainability" ? "/admin/sustainability" : config.endpoint;
      const list = items ?? [];
      let item = list.find((entry) => entry.id === id);
      if (type !== "sustainability") {
        const detail = await api.get(`${config.endpoint}/${id}`);
        item = detail[config.itemKey];
      }
      if (!item) return;
      const next = emptyForm(config.fields);
      for (const field of config.fields) {
        if (field.type === "photos") {
          const photos = item.photos ?? [];
          next[field.key] = type === "sustainability" ? item.imageUrl ? [item.imageUrl] : [] : photos.map((photo) => photo.url);
        } else if (field.type === "date") {
          next[field.key] = item[field.key] ? String(item[field.key]).slice(0, 10) : "";
        } else if (field.type === "lines") {
          const hours = item[field.key];
          next[field.key] = hours ? Object.entries(hours).map(([day, value]) => `${day}: ${value}`).join("\n") : "";
        } else if (field.type === "checkbox") {
          next[field.key] = Boolean(item[field.key]);
        } else {
          next[field.key] = item[field.key] ?? "";
        }
      }
      setForm(next);
      setEditingId(id);
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel abrir o registro.");
    }
  }
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {};
      for (const field of config.fields) {
        let value = form[field.key];
        if (field.type === "photos") {
          const urls = value;
          if (type === "sustainability") payload.imageUrl = urls[0] ?? null;
          else payload.photos = urls;
          continue;
        }
        if (field.type === "lines") {
          const hours = {};
          for (const line of String(value ?? "").split("\n")) {
            const [day, ...rest] = line.split(":");
            if (day?.trim() && rest.length > 0) hours[day.trim()] = rest.join(":").trim();
          }
          payload[field.key] = Object.keys(hours).length > 0 ? hours : null;
          continue;
        }
        if (field.type === "number") value = Number(value);
        if (field.type === "date") value = value ? `${value}T12:00:00Z` : null;
        if (field.key === "amenities") {
          payload[field.key] = String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
          continue;
        }
        payload[field.key] = value === "" ? null : value;
      }
      if (type === "locals" && !payload.photos) payload.photos = [];
      if (type === "sustainability") delete payload.published_undefined;
      if (editingId) await api.put(`${config.endpoint}/${editingId}`, payload);
      else await api.post(config.endpoint, payload);
      toast.success(editingId ? "Registro atualizado." : "Registro criado.");
      setOpen(false);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel salvar.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(id) {
    if (!window.confirm("Inativar/excluir este registro?")) return;
    try {
      await api.delete(`${config.endpoint}/${id}`);
      toast.success("Registro removido.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel excluir.");
    }
  }
  return <div>
      <div className="form-actions" style={{ marginBottom: 16, justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 28, color: "var(--navy)" }}>{config.label}</h2>
        <button type="button" className="btn btn--navy btn--sm" onClick={startCreate}>
          + Novo registro
        </button>
      </div>
      {error && !open ? <div className="form-error" style={{ marginBottom: 12 }}>{error}</div> : null}
      {!items ? <Loader /> : null}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Nome/Título</th>
              <th>Informação</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => <tr key={String(item.id)}>
                <td style={{ fontWeight: 600 }}>{String(item.name ?? item.title ?? "")}</td>
                <td>{String(item.category ?? item.neighborhood ?? item.place ?? "")}</td>
                <td>{item.isActive === false || item.published === false ? "Inativo" : "Ativo"}</td>
                <td>
                  <div className="table-actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(Number(item.id))}>
                      Editar
                    </button>
                    <button type="button" className="btn btn--danger btn--sm" onClick={() => remove(Number(item.id))}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      {items && items.length === 0 ? <div className="empty-state" style={{ marginTop: 16 }}>Nenhum registro.</div> : null}

      {open ? <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal" onSubmit={submit}>
            <h2>{editingId ? "Editar registro" : "Novo registro"}</h2>
            <div className="form-grid">
              {config.fields.map((field) => <div key={field.key} className={`field ${field.type === "textarea" || field.type === "photos" || field.type === "lines" ? "span-2" : ""}`}>
                  <label htmlFor={`field-${field.key}`}>{field.label}</label>
                  {field.type === "textarea" || field.type === "lines" ? <textarea
    id={`field-${field.key}`}
    className="textarea"
    value={String(form[field.key] ?? "")}
    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
    required={field.required}
  /> : field.type === "select" ? <select id={`field-${field.key}`} className="select" value={String(form[field.key] ?? "")} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}>
                      {field.options?.map((option) => <option key={option} value={option}>
                          {option}
                        </option>)}
                    </select> : field.type === "photos" ? <div>
                      <div className="photo-chips">
                        {form[field.key].map((url, index) => <div key={url} className="photo-chip">
                            <img src={url} alt="Foto" />
                            <button
    type="button"
    aria-label="Remover foto"
    onClick={() => setForm({ ...form, [field.key]: form[field.key].filter((_, position) => position !== index) })}
  >
                              ×
                            </button>
                          </div>)}
                      </div>
                      <label className="btn btn--ghost btn--sm file-button" style={{ marginTop: 10 }}>
                        + Enviar foto
                        <input
    type="file"
    accept="image/*"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const result = await api.upload("/uploads", file, "roteiros");
        setForm({ ...form, [field.key]: [...form[field.key], result.url] });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha no envio.");
      }
      e.target.value = "";
    }}
  />
                      </label>
                    </div> : field.type === "checkbox" ? <input id={`field-${field.key}`} type="checkbox" checked={Boolean(form[field.key])} onChange={(e) => setForm({ ...form, [field.key]: e.target.checked })} /> : <input
    id={`field-${field.key}`}
    type={field.type}
    className="input"
    value={String(form[field.key] ?? "")}
    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
    required={field.required}
  />}
                </div>)}
            </div>
            {error ? <div className="form-error" style={{ marginTop: 14 }}>{error}</div> : null}
            <div className="form-actions" style={{ marginTop: 18 }}>
              <button type="submit" className="btn btn--navy btn--sm" disabled={saving}>
                {saving ? "Salvando\u2026" : "Salvar"}
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div> : null}
    </div>;
}
function AdminContent() {
  const [tab, setTab] = useState("visao");
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [balneability, setBalneability] = useState(null);
  const [users, setUsers] = useState(null);
  const [contentType, setContentType] = useState("locals");
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    try {
      const [statsResult, pendingResult, suggestionsResult, balneabilityResult, usersResult] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/itineraries/pending"),
        api.get("/admin/suggestions?status=PENDING"),
        api.get("/admin/balneabilidade"),
        api.get("/admin/users")
      ]);
      setStats(statsResult.stats);
      setPending(pendingResult.itineraries);
      setSuggestions(suggestionsResult.suggestions);
      setBalneability(balneabilityResult);
      setUsers(usersResult.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel carregar o painel.");
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function approve(id) {
    try {
      await api.patch(`/admin/itineraries/${id}/approve`);
      toast.success("Roteiro aprovado e publicado.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel aprovar.");
    }
  }
  async function reject(id) {
    const reason = window.prompt("Motivo da rejei\xE7\xE3o (o autor ver\xE1 esta mensagem):");
    if (!reason || reason.trim().length < 3) return;
    try {
      await api.patch(`/admin/itineraries/${id}/reject`, { reason });
      toast.success("Roteiro rejeitado.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel rejeitar.");
    }
  }
  async function reviewSuggestion(id, action) {
    try {
      await api.patch(`/admin/suggestions/${id}/${action}`, action === "reject" ? { note: "Revisado pela administra\xE7\xE3o" } : void 0);
      toast.success("Sugest\xE3o analisada.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel analisar.");
    }
  }
  async function syncBalneability() {
    try {
      await api.post("/admin/balneabilidade/sync");
      toast.success("Balneabilidade sincronizada.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Integra\xE7\xE3o indispon\xEDvel.");
      await load();
    }
  }
  async function updateUser(id, patch) {
    try {
      await api.patch(`/users/${id}`, patch);
      toast.success("Usu\xE1rio atualizado.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel atualizar.");
    }
  }
  return <div className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="admin-head">
          <p className="eyebrow">Administração Caragua360</p>
          <h1>PAINEL</h1>
        </div>

        {error ? <div className="form-error" style={{ marginBottom: 16 }}>{error}</div> : null}

        <div className="admin-tabs">
          {[
    ["visao", "Vis\xE3o geral"],
    ["roteiros", `Roteiros${stats?.pendingItineraries ? ` (${stats.pendingItineraries})` : ""}`],
    ["sugestoes", `Sugest\xF5es${stats?.pendingSuggestions ? ` (${stats.pendingSuggestions})` : ""}`],
    ["balneabilidade", "Balneabilidade"],
    ["conteudos", "Conte\xFAdos"],
    ["usuarios", "Usu\xE1rios"]
  ].map(([value, label]) => <button key={value} type="button" className={`tab ${tab === value ? "is-active" : ""}`} onClick={() => setTab(value)}>
              {label}
            </button>)}
        </div>

        {tab === "visao" && <div>
            {!stats ? <Loader /> : null}
            {stats ? <div className="stat-grid">
                <div className="stat-card">
                  <div className="value">{stats.users}</div>
                  <div className="label">usuários</div>
                </div>
                <div className="stat-card">
                  <div className="value">{stats.locals}</div>
                  <div className="label">destinos ativos</div>
                </div>
                <div className="stat-card">
                  <div className="value">{stats.pendingItineraries}</div>
                  <div className="label">roteiros em análise</div>
                </div>
                <div className="stat-card">
                  <div className="value">{stats.pendingSuggestions}</div>
                  <div className="label">sugestões pendentes</div>
                </div>
                <div className="stat-card">
                  <div className="value">{stats.events}</div>
                  <div className="label">eventos</div>
                </div>
                <div className="stat-card">
                  <div className="value">{stats.reviews}</div>
                  <div className="label">avaliações</div>
                </div>
                <div className="stat-card">
                  <div className="value">{stats.favorites}</div>
                  <div className="label">favoritos</div>
                </div>
                <div className="stat-card">
                  <div className="value">{stats.itineraries}</div>
                  <div className="label">roteiros no total</div>
                </div>
              </div> : null}
          </div>}

        {tab === "roteiros" && <div>
            {!pending ? <Loader /> : null}
            {pending && pending.length === 0 ? <div className="empty-state">Nenhum roteiro aguardando análise.</div> : null}
            {pending?.map((itinerary) => <div key={itinerary.id} className="admin-panel">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ marginBottom: 4 }}>{itinerary.title}</h2>
                    <p className="muted" style={{ marginBottom: 6 }}>
                      por {itinerary.user.fullName} · {itinerary.daysCount} dia(s) · enviado em {formatDate(itinerary.submittedAt ?? itinerary.updatedAt)}
                    </p>
                    <p style={{ maxWidth: 720 }}>{itinerary.description}</p>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn--yellow btn--sm" onClick={() => approve(itinerary.id)}>
                      Aprovar
                    </button>
                    <button type="button" className="btn btn--danger btn--sm" onClick={() => reject(itinerary.id)}>
                      Rejeitar
                    </button>
                  </div>
                </div>
                {itinerary.days.map((day) => <div key={day.id} style={{ marginTop: 10 }}>
                    <strong style={{ fontFamily: "var(--font-ui)", fontSize: 12.5 }}>Dia {day.dayNumber}</strong>
                    <ul style={{ margin: "4px 0 0", fontFamily: "var(--font-ui)", fontSize: 13 }}>
                      {day.places.map((place) => <li key={place.id}>
                          {place.placeName}
                          {place.rating ? ` \xB7 ${place.rating}\u2605` : ""}
                          {place.comments ? ` \u2014 ${place.comments}` : ""}
                        </li>)}
                    </ul>
                  </div>)}
              </div>)}
          </div>}

        {tab === "sugestoes" && <div>
            {!suggestions ? <Loader /> : null}
            {suggestions && suggestions.length === 0 ? <div className="empty-state">Nenhuma sugestão pendente.</div> : null}
            {suggestions?.map((suggestion) => <div key={suggestion.id} className="admin-panel">
                <h2 style={{ fontSize: 26 }}>{suggestion.title}</h2>
                <p className="muted" style={{ marginBottom: 6 }}>
                  {suggestion.type} · {formatDate(suggestion.createdAt)} {suggestion.local ? `\xB7 ${suggestion.local.name}` : ""}
                </p>
                <p>{suggestion.description}</p>
                <div className="form-actions">
                  <button type="button" className="btn btn--yellow btn--sm" onClick={() => reviewSuggestion(suggestion.id, "approve")}>
                    Aprovar
                  </button>
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => reviewSuggestion(suggestion.id, "reject")}>
                    Rejeitar
                  </button>
                </div>
              </div>)}
          </div>}

        {tab === "balneabilidade" && <div>
            {!balneability ? <Loader /> : null}
            {balneability ? <div className="admin-panel">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <h2 style={{ marginBottom: 6 }}>Integração de balneabilidade</h2>
                    <p className="muted" style={{ marginBottom: 4 }}>
                      Fonte: {balneability.source} · última medição conhecida: {formatDate(balneability.lastUpdated)} · status:{" "}
                      <strong>{balneability.available ? "atualizado" : "indispon\xEDvel"}</strong>
                    </p>
                    {!balneability.integrationConfigured ? <p className="muted">API não configurada (BALNEABILITY_API_URL). Os dados abaixo são históricos.</p> : null}
                    {balneability.lastError ? <p className="form-error">{balneability.lastError}</p> : null}
                  </div>
                  <button type="button" className="btn btn--navy btn--sm" onClick={syncBalneability}>
                    Sincronizar agora
                  </button>
                </div>
                <div className="table-wrap" style={{ marginTop: 18 }}>
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Ponto</th>
                        <th>Status</th>
                        <th>Medição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balneability.beaches.map((beach) => <tr key={beach.beachName}>
                          <td>{beach.beachName}</td>
                          <td>
                            <span className={`badge ${beach.status === "PROPRIA" ? "badge--green" : beach.status === "IMPROPRIA" ? "badge--red" : "badge--yellow"}`}>
                              {beach.status}
                            </span>
                          </td>
                          <td>{formatDate(beach.measuredAt)}</td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div> : null}
          </div>}

        {tab === "conteudos" && <div>
            <div className="admin-panel">
              <div className="field" style={{ maxWidth: 360 }}>
                <label htmlFor="content-type">Tipo de conteúdo</label>
                <select id="content-type" className="select" value={contentType} onChange={(e) => setContentType(e.target.value)}>
                  {Object.entries(CONTENT_CONFIG).map(([value, config]) => <option key={value} value={value}>
                      {config.label}
                    </option>)}
                </select>
              </div>
            </div>
            <div className="admin-panel">
              <ContentManager key={contentType} type={contentType} />
            </div>
          </div>}

        {tab === "usuarios" && <div className="admin-panel">
            {!users ? <Loader /> : null}
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Roteiros</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => <tr key={user.id}>
                      <td style={{ fontWeight: 600 }}>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
    className="select"
    value={user.role}
    onChange={(e) => updateUser(user.id, { role: e.target.value })}
    style={{ minWidth: 150 }}
  >
                          <option value="TOURIST">Turista</option>
                          <option value="RESIDENT">Morador colaborador</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                      </td>
                      <td>{user._count.itineraries}</td>
                      <td>
                        <span className={`badge ${user.isActive ? "badge--green" : "badge--red"}`}>{user.isActive ? "Ativo" : "Inativo"}</span>
                      </td>
                      <td>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => updateUser(user.id, { isActive: !user.isActive })}>
                          {user.isActive ? "Desativar" : "Ativar"}
                        </button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>}
      </div>
    </div>;
}
function Admin() {
  return <ProtectedRoute admin>
      <AdminContent />
    </ProtectedRoute>;
}
export {
  Admin as default
};
