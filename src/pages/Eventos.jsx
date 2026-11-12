import { useEffect, useState } from "react";
import { Link } from "wouter";
import { api, formatDate } from "@/lib/api";
import { Loader } from "@/components/ui-bits";
function Eventos() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    api.get("/events").then((result) => setEvents(result.events)).catch((err) => setError(err.message));
  }, []);
  return <div className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="page-head">
          <p className="eyebrow">Agenda cultural</p>
          <h1>EVENTOS</h1>
          <p>Festas tradicionais, festivais gastronômicos e programação cultural de Caraguatatuba.</p>
        </div>

        {error ? <div className="form-error">{error}</div> : null}
        {!events && !error ? <Loader label="Carregando a agenda…" /> : null}

        {events && <div className="events-grid">
            {events.map((event) => <Link key={event.id} href={`/eventos/${event.id}`} className="event-card">
                {event.photo ?? event.photos?.[0]?.url ? <img src={event.photo ?? event.photos?.[0]?.url} alt={event.name} loading="lazy" /> : null}
                <div className="event-body">
                  <span className="event-name">{event.name}</span>
                  <span className="event-meta">
                    <strong>{formatDate(event.startDate)}</strong>
                    {event.endDate ? ` \u2014 ${formatDate(event.endDate)}` : ""}
                  </span>
                  <span className="event-meta">{event.time ?? "Hor\xE1rio a confirmar"}</span>
                  <span className="event-meta">{event.place}</span>
                </div>
              </Link>)}
          </div>}

        {events && events.length === 0 ? <div className="empty-state">Nenhum evento cadastrado no momento.</div> : null}
      </div>
    </div>;
}
export {
  Eventos as default
};
