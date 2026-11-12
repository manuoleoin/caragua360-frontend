import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Loader, PageLoader, ProtectedRoute } from "@/components/ui-bits";
const emptyPlace = () => ({
  localId: null,
  placeName: "",
  comments: "",
  knewPlace: null,
  visitDate: "",
  visitTime: "",
  visitDuration: "",
  rating: 0,
  photos: []
});
const emptyDay = () => ({ notes: "", places: [emptyPlace()] });
function Builder({ editId }) {
  const [, navigate] = useLocation();
  const [locals, setLocals] = useState([]);
  const [loading, setLoading] = useState(Boolean(editId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("DRAFT");
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    daysCount: 1
  });
  const [days, setDays] = useState([emptyDay()]);
  useEffect(() => {
    api.get("/locals").then((result) => setLocals(result.locals)).catch(() => setLocals([]));
  }, []);
  useEffect(() => {
    if (!editId) return;
    api.get(`/itineraries/${editId}`).then(({ itinerary }) => {
      setForm({
        title: itinerary.title,
        description: itinerary.description,
        startDate: itinerary.startDate ? itinerary.startDate.slice(0, 10) : "",
        endDate: itinerary.endDate ? itinerary.endDate.slice(0, 10) : "",
        daysCount: itinerary.daysCount
      });
      setStatus(itinerary.status);
      setDays(
        itinerary.days.length > 0 ? itinerary.days.map((day) => ({
          notes: day.notes ?? "",
          places: day.places.length > 0 ? day.places.map((place) => ({
            localId: place.localId,
            placeName: place.placeName,
            comments: place.comments ?? "",
            knewPlace: place.knewPlace,
            visitDate: place.visitDate ? place.visitDate.slice(0, 10) : "",
            visitTime: place.visitTime ?? "",
            visitDuration: place.visitDuration ?? "",
            rating: place.rating ?? 0,
            photos: place.photos.map((photo) => ({ url: photo.url, caption: photo.caption }))
          })) : [emptyPlace()]
        })) : [emptyDay()]
      );
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [editId]);
  const placesCount = useMemo(() => days.reduce((total, day) => total + day.places.length, 0), [days]);
  function changeDaysCount(value) {
    const count = Math.max(1, Math.min(30, value || 1));
    setForm((current) => ({ ...current, daysCount: count }));
    setDays((current) => {
      const next = [...current];
      while (next.length < count) next.push(emptyDay());
      while (next.length > count) next.pop();
      return next;
    });
  }
  function updateDay(index, patch) {
    setDays((current) => current.map((day, position) => position === index ? { ...day, ...patch } : day));
  }
  function updatePlace(dayIndex, placeIndex, patch) {
    setDays(
      (current) => current.map(
        (day, position) => position === dayIndex ? { ...day, places: day.places.map((place, index) => index === placeIndex ? { ...place, ...patch } : place) } : day
      )
    );
  }
  function addPlace(dayIndex) {
    setDays((current) => current.map((day, position) => position === dayIndex ? { ...day, places: [...day.places, emptyPlace()] } : day));
  }
  function removePlace(dayIndex, placeIndex) {
    setDays(
      (current) => current.map(
        (day, position) => position === dayIndex ? { ...day, places: day.places.filter((_, index) => index !== placeIndex) } : day
      )
    );
  }
  async function uploadPhoto(dayIndex, placeIndex, file) {
    try {
      const result = await api.upload("/uploads", file, "roteiros");
      const place = days[dayIndex].places[placeIndex];
      updatePlace(dayIndex, placeIndex, { photos: [...place.photos, { url: result.url }] });
      toast.success("Foto adicionada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel enviar a foto.");
    }
  }
  function payload() {
    return {
      title: form.title,
      description: form.description,
      daysCount: form.daysCount,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      days: days.map((day, index) => ({
        dayNumber: index + 1,
        notes: day.notes || null,
        places: day.places.filter((place) => place.placeName.trim().length > 0).map((place) => ({
          localId: place.localId,
          placeName: place.placeName,
          comments: place.comments || null,
          knewPlace: place.knewPlace,
          visitDate: place.visitDate || null,
          visitTime: place.visitTime || null,
          visitDuration: place.visitDuration || null,
          rating: place.rating > 0 ? place.rating : null,
          photos: place.photos.map((photo) => ({ url: photo.url, caption: photo.caption ?? null }))
        }))
      }))
    };
  }
  async function save(submitForReview) {
    setSaving(true);
    setError(null);
    try {
      const body = payload();
      const result = editId ? await api.put(`/itineraries/${editId}`, body) : await api.post("/itineraries", body);
      const itinerary = result.itinerary;
      if (submitForReview) {
        await api.post(`/itineraries/${itinerary.id}/submit`);
        toast.success("Roteiro enviado para an\xE1lise.");
      } else {
        toast.success("Rascunho salvo.");
      }
      navigate("/perfil");
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel salvar o roteiro.");
    } finally {
      setSaving(false);
    }
  }
  if (loading) return <Loader label="Carregando roteiro…" />;
  return <div className="section" style={{ paddingTop: 0 }}>
      <div className="container narrow" style={{ maxWidth: 980 }}>
        <div className="page-head">
          <p className="eyebrow">Planejador</p>
          <h1>{editId ? "EDITAR ROTEIRO" : "DIVIDA SEU ROTEIRO COM N\xD3S"}</h1>
          <p>Organize seus dias, adicione locais, avaliações e fotos. Ao enviar, a equipe do Caragua360 analisa antes de publicar.</p>
        </div>

        {status !== "DRAFT" && editId ? <div className="form-success" style={{ marginBottom: 18 }}>
            Status atual: {status === "PENDING" ? "em an\xE1lise" : status === "APPROVED" ? "aprovado e publicado" : "rejeitado"}.{" "}
            {status === "APPROVED" ? "Editar o roteiro far\xE1 com que ele volte a rascunho." : ""}
          </div> : null}

        <div className="builder-card">
          <h2>Informações do roteiro</h2>
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="title">Título</label>
              <input id="title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="field">
              <label htmlFor="daysCount">Quantidade de dias</label>
              <input id="daysCount" type="number" min={1} max={30} className="input" value={form.daysCount} onChange={(e) => changeDaysCount(Number(e.target.value))} />
            </div>
            <div className="field">
              <label htmlFor="startDate">Dia de início</label>
              <input id="startDate" type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="endDate">Dia final</label>
              <input id="endDate" type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div className="field span-2">
              <label htmlFor="description">Descrição</label>
              <textarea id="description" className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required minLength={10} />
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 18 }}>
            <button type="button" className="btn btn--navy btn--sm" onClick={() => addPlace(days.length - 1)}>
              + Adicionar local
            </button>
            <span className="muted" style={{ fontFamily: "var(--font-ui)", fontSize: 12.5 }}>
              {placesCount} local(is) em {days.length} dia(s)
            </span>
          </div>
        </div>

        {days.map((day, dayIndex) => <div key={dayIndex} className="day-block">
            <div className="day-head">
              <h3>Dia {dayIndex + 1}</h3>
              <div className="form-actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => addPlace(dayIndex)}>
                  + Adicionar local neste dia
                </button>
              </div>
            </div>
            <div className="field" style={{ marginBottom: 16 }}>
              <label htmlFor={`day-notes-${dayIndex}`}>Observações do dia (opcional)</label>
              <input
    id={`day-notes-${dayIndex}`}
    className="input"
    value={day.notes}
    onChange={(e) => updateDay(dayIndex, { notes: e.target.value })}
    placeholder="Ex.: sair cedo para evitar trânsito na SP-55"
  />
            </div>

            {day.places.map((place, placeIndex) => <div key={placeIndex} className="place-card">
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--navy)", letterSpacing: "0.02em", marginBottom: 14 }}>
                  Informações do local
                </h4>
                <div className="place-columns">
                  <div style={{ display: "grid", gap: 14 }}>
                    <div className="field">
                      <label htmlFor={`place-local-${dayIndex}-${placeIndex}`}>Destino do Caragua360 (opcional)</label>
                      <select
    id={`place-local-${dayIndex}-${placeIndex}`}
    className="select"
    value={place.localId ?? ""}
    onChange={(e) => {
      const localId = e.target.value ? Number(e.target.value) : null;
      const local = locals.find((item) => item.id === localId);
      updatePlace(dayIndex, placeIndex, { localId, placeName: local?.name ?? place.placeName });
    }}
  >
                        <option value="">Local livre</option>
                        {locals.map((local) => <option key={local.id} value={local.id}>
                            {local.name}
                          </option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor={`place-name-${dayIndex}-${placeIndex}`}>Nome do local</label>
                      <input
    id={`place-name-${dayIndex}-${placeIndex}`}
    className="input"
    value={place.placeName}
    onChange={(e) => updatePlace(dayIndex, placeIndex, { placeName: e.target.value })}
    required
  />
                    </div>
                    <div className="field">
                      <label htmlFor={`place-comments-${dayIndex}-${placeIndex}`}>Comentários</label>
                      <textarea
    id={`place-comments-${dayIndex}-${placeIndex}`}
    className="textarea"
    value={place.comments}
    onChange={(e) => updatePlace(dayIndex, placeIndex, { comments: e.target.value })}
  />
                    </div>
                    <div className="field">
                      <label>Já conhecia?</label>
                      <div className="radio-row">
                        <label>
                          <input type="radio" name={`knew-${dayIndex}-${placeIndex}`} checked={place.knewPlace === true} onChange={() => updatePlace(dayIndex, placeIndex, { knewPlace: true })} /> Sim
                        </label>
                        <label>
                          <input type="radio" name={`knew-${dayIndex}-${placeIndex}`} checked={place.knewPlace === false} onChange={() => updatePlace(dayIndex, placeIndex, { knewPlace: false })} /> Não
                        </label>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 14 }}>
                    <div className="field">
                      <label htmlFor={`place-date-${dayIndex}-${placeIndex}`}>Data de visita</label>
                      <input
    id={`place-date-${dayIndex}-${placeIndex}`}
    type="date"
    className="input"
    value={place.visitDate}
    onChange={(e) => updatePlace(dayIndex, placeIndex, { visitDate: e.target.value })}
  />
                    </div>
                    <div className="field">
                      <label htmlFor={`place-time-${dayIndex}-${placeIndex}`}>Horário da visita</label>
                      <input
    id={`place-time-${dayIndex}-${placeIndex}`}
    type="time"
    className="input"
    value={place.visitTime}
    onChange={(e) => updatePlace(dayIndex, placeIndex, { visitTime: e.target.value })}
  />
                    </div>
                    <div className="field">
                      <label htmlFor={`place-duration-${dayIndex}-${placeIndex}`}>Tempo de visita</label>
                      <input
    id={`place-duration-${dayIndex}-${placeIndex}`}
    className="input"
    placeholder="Ex.: 2 horas"
    value={place.visitDuration}
    onChange={(e) => updatePlace(dayIndex, placeIndex, { visitDuration: e.target.value })}
  />
                    </div>
                    <div className="field">
                      <label>Avalie</label>
                      <div className="star-picker">
                        {[1, 2, 3, 4, 5].map((value) => <button
    key={value}
    type="button"
    className={value <= place.rating ? "is-on" : ""}
    onClick={() => updatePlace(dayIndex, placeIndex, { rating: value })}
    aria-label={`${value} estrelas`}
  >
                            ★
                          </button>)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="place-footer">
                  <div>
                    <label className="btn btn--ghost btn--sm file-button">
                      + Adicionar foto
                      <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) void uploadPhoto(dayIndex, placeIndex, file);
      e.target.value = "";
    }}
  />
                    </label>
                    <div className="photo-chips">
                      {place.photos.map((photo, photoIndex) => <div key={photo.url} className="photo-chip">
                          <img src={photo.url} alt="Foto do local" />
                          <button
    type="button"
    aria-label="Remover foto"
    onClick={() => updatePlace(dayIndex, placeIndex, { photos: place.photos.filter((_, index) => index !== photoIndex) })}
  >
                            ×
                          </button>
                        </div>)}
                    </div>
                  </div>
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => removePlace(dayIndex, placeIndex)}>
                    Excluir
                  </button>
                </div>
              </div>)}
          </div>)}

        {error ? <div className="form-error" style={{ marginBottom: 16 }}>{error}</div> : null}

        <div className="form-actions" style={{ marginBottom: 70 }}>
          <button type="button" className="btn btn--ghost" onClick={() => save(false)} disabled={saving}>
            Salvar rascunho
          </button>
          <button type="button" className="btn btn--navy" onClick={() => save(true)} disabled={saving}>
            {saving ? "Salvando\u2026" : "Enviar para an\xE1lise"}
          </button>
          <Link href="/perfil" className="btn btn--ghost">
            Cancelar
          </Link>
        </div>
      </div>
    </div>;
}
function CriarRoteiro() {
  const params = useParams();
  const editId = params.id ? Number(params.id) : void 0;
  return <ProtectedRoute>
      {editId && (!Number.isInteger(editId) || editId <= 0) ? <PageLoader /> : <Builder editId={editId} />}
    </ProtectedRoute>;
}
export {
  CriarRoteiro as default
};
