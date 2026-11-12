import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api, formatDate } from "@/lib/api";
import { Loader, Stars } from "@/components/ui-bits";
function Roteiros() {
  const [itineraries, setItineraries] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    api.get("/itineraries").then((result) => setItineraries(result.itineraries)).catch((err) => setError(err.message));
  }, []);
  const filtered = (itineraries ?? []).filter((item) => {
    const text = `${item.title} ${item.description} ${item.user.fullName}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });
  return <div className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="page-head">
          <p className="eyebrow">Compartilhe e inspire-se</p>
          <h1>ROTEIROS</h1>
          <p>Itinerários criados por visitantes e moradores e aprovados pela administração do Caragua360.</p>
          <div style={{ marginTop: 22, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/roteiros/novo" className="btn btn--navy">
              Criar roteiro
            </Link>
            <div className="search-box" style={{ minWidth: 260 }}>
              <input placeholder="Procurar…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Procurar roteiros" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </div>
          </div>
        </div>

        {error ? <div className="form-error">{error}</div> : null}
        {!itineraries && !error ? <Loader label="Carregando roteiros…" /> : null}

        {itineraries && filtered.length === 0 ? <div className="empty-state">Nenhum roteiro publicado ainda. Crie o primeiro!</div> : null}

        <div className="itinerary-grid">
          {filtered.map((itinerary) => <Link key={itinerary.id} href={`/roteiros/${itinerary.id}`} className="itinerary-card">
              <img src={itinerary.coverPhoto ?? itinerary.coverPhotoUrl ?? "/images/destino-tamandua.jpg"} alt={itinerary.title} loading="lazy" />
              <div className="itinerary-body">
                <span className="badge badge--blue">
                  {itinerary.daysCount} dia{itinerary.daysCount > 1 ? "s" : ""}
                </span>
                <h3>{itinerary.title}</h3>
                <span className="itinerary-author">por {itinerary.user.fullName}</span>
                <p className="tile-summary" style={{ WebkitLineClamp: 3 }}>
                  {itinerary.description}
                </p>
                <div className="tile-footer">
                  <Stars value={itinerary.rating} />
                  <span className="tile-kicker">♥ {itinerary.likesCount}</span>
                </div>
                {itinerary.startDate ? <span className="itinerary-author" style={{ fontSize: 11.5 }}>
                    Início previsto: {formatDate(itinerary.startDate)}
                  </span> : null}
              </div>
            </Link>)}
        </div>
      </div>
    </div>;
}
export {
  Roteiros as default
};
