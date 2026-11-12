import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { api, formatDate } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, Loader, Stars } from "@/components/ui-bits";
import { ReviewSection } from "@/components/ReviewSection";
function RoteiroDetalhe() {
  const params = useParams();
  const id = Number(params.id);
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    try {
      const result = await api.get(`/itineraries/${id}`);
      setItinerary(result.itinerary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Roteiro n\xE3o encontrado.");
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  async function toggleLike() {
    if (!user) {
      toast.info("Fa\xE7a login para curtir o roteiro.");
      return;
    }
    try {
      await api.post(`/itineraries/${id}/like`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel curtir.");
    }
  }
  async function addFavorite() {
    if (!itinerary) return;
    try {
      await api.post("/favorites", { itineraryId: itinerary.id });
      toast.success("Roteiro salvo nos favoritos.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel favoritar.");
    }
  }
  if (error) {
    return <div className="container" style={{ padding: "70px 0" }}>
        <div className="form-error">{error}</div>
        <Link href="/roteiros" className="btn btn--navy" style={{ marginTop: 16 }}>
          Voltar aos roteiros
        </Link>
      </div>;
  }
  if (!itinerary) return <Loader />;
  const placesCount = itinerary.days.reduce((total, day) => total + day.places.length, 0);
  return <div>
      <section className="banner" style={{ minHeight: 380 }}>
        <img src={itinerary.coverPhoto ?? itinerary.coverPhotoUrl ?? "/images/destino-tamandua.jpg"} alt={itinerary.title} />
        <div className="banner-content" style={{ maxWidth: 1e3 }}>
          <p className="eyebrow">Roteiro de {itinerary.daysCount} dia(s)</p>
          <h2 style={{ fontSize: "clamp(44px, 7vw, 92px)", marginBottom: 16 }}>{itinerary.title}</h2>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <Avatar name={itinerary.user.fullName} photo={itinerary.user.photoUrl} size={38} />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 13 }}>por {itinerary.user.fullName}</span>
            <Stars value={itinerary.rating} />
          </div>
        </div>
      </section>

      <section className="section section--cream" style={{ paddingTop: 54 }}>
        <div className="container">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 30 }}>
            <Link href="/roteiros" className="btn btn--ghost btn--sm">
              ← Roteiros
            </Link>
            {user && <button type="button" className="btn btn--ghost btn--sm" onClick={toggleLike}>
                ♥ {itinerary.likedByMe ? "Curtido" : "Curtir"} ({itinerary.likesCount})
              </button>}
            {user && <button type="button" className="btn btn--ghost btn--sm" onClick={addFavorite}>
                Salvar nos favoritos
              </button>}
            {(user?.id === itinerary.userId || user?.role === "ADMIN") && <Link href={`/roteiros/${itinerary.id}/editar`} className="btn btn--navy btn--sm">
                Editar roteiro
              </Link>}
          </div>

          <div className="split" style={{ alignItems: "start" }}>
            <div>
              <h2 className="section-title" style={{ color: "var(--navy)", fontSize: "clamp(36px, 4vw, 54px)" }}>
                SOBRE O ROTEIRO
              </h2>
              <p className="lead" style={{ color: "var(--muted)", whiteSpace: "pre-line" }}>
                {itinerary.description}
              </p>
            </div>
            <div className="builder-card" style={{ marginBottom: 0 }}>
              <h2 style={{ fontSize: 30 }}>Resumo</h2>
              <dl className="info-list" style={{ borderTop: 0 }}>
                <dt style={{ color: "var(--blue)" }}>Duração</dt>
                <dd style={{ color: "var(--navy)" }}>{itinerary.daysCount} dia(s)</dd>
                <dt style={{ color: "var(--blue)" }}>Locais</dt>
                <dd style={{ color: "var(--navy)" }}>{placesCount} paradas</dd>
                <dt style={{ color: "var(--blue)" }}>Início</dt>
                <dd style={{ color: "var(--navy)" }}>{formatDate(itinerary.startDate)}</dd>
                <dt style={{ color: "var(--blue)" }}>Fim</dt>
                <dd style={{ color: "var(--navy)" }}>{formatDate(itinerary.endDate)}</dd>
                <dt style={{ color: "var(--blue)" }}>Avaliações</dt>
                <dd style={{ color: "var(--navy)" }}>{itinerary.reviewsCount}</dd>
              </dl>
            </div>
          </div>

          {itinerary.days.map((day) => <div key={day.id} className="builder-card" style={{ marginTop: 28 }}>
              <div className="day-head">
                <h3>Dia {day.dayNumber}</h3>
                <span className="badge badge--blue">{day.places.length} parada(s)</span>
              </div>
              {day.notes ? <p className="muted">{day.notes}</p> : null}
              <div style={{ display: "grid", gap: 16 }}>
                {day.places.map((place) => <article key={place.id} className="place-card">
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {place.photos[0] ? <img src={place.photos[0].url} alt={place.placeName} style={{ width: 150, height: 110, objectFit: "cover", borderRadius: 12 }} /> : null}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <h4 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--navy)", textTransform: "uppercase", letterSpacing: "0.02em" }}>{place.placeName}</h4>
                        <div className="tile-meta" style={{ marginBottom: 6 }}>
                          {place.local ? <Link href={`/destino/${place.local.id}`} className="auth-link">Ver destino</Link> : null}
                          {place.visitDate ? <span>Visita em {formatDate(place.visitDate)}</span> : null}
                          {place.visitTime ? <span>às {place.visitTime}</span> : null}
                          {place.visitDuration ? <span>· {place.visitDuration}</span> : null}
                        </div>
                        {place.rating ? <Stars value={place.rating} /> : null}
                        {place.comments ? <p className="muted" style={{ marginTop: 8 }}>{place.comments}</p> : null}
                        {place.knewPlace === true ? <span className="badge badge--green">Já conhecia</span> : null}
                      </div>
                    </div>
                    {place.photos.length > 1 ? <div className="photo-chips">
                        {place.photos.slice(1).map((photo) => <div key={photo.id ?? photo.url} className="photo-chip">
                            <img src={photo.url} alt={place.placeName} />
                          </div>)}
                      </div> : null}
                  </article>)}
              </div>
            </div>)}

          <div className="builder-card" style={{ marginTop: 30 }}>
            <h2>Avaliações do roteiro</h2>
            <ReviewSection target={{ itineraryId: itinerary.id }} reviews={itinerary.reviews} onChanged={load} />
          </div>
        </div>
      </section>
    </div>;
}
export {
  RoteiroDetalhe as default
};
