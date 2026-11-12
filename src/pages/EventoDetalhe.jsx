import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { api, formatDate } from "@/lib/api";
import { Loader, PageLoader, ProtectedRoute } from "@/components/ui-bits";
function EventoContent({ id }) {
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    api.get(`/events/${id}`).then((result) => setEvent(result.event)).catch((err) => setError(err.message));
  }, [id]);
  if (error) {
    return <div className="container" style={{ padding: "70px 0" }}>
        <div className="form-error">{error}</div>
        <Link href="/eventos" className="btn btn--navy" style={{ marginTop: 16 }}>
          Voltar aos eventos
        </Link>
      </div>;
  }
  if (!event) return <Loader />;
  return <div className="detail-page">
      <div className="container">
        <Link href="/eventos" className="link-arrow" style={{ marginBottom: 26, display: "inline-flex" }}>
          ← Voltar aos eventos
        </Link>
        <div className="detail-top">
          <img className="detail-gallery-main" src={event.photos[0]?.url ?? "/images/evento-show.jpg"} alt={event.name} />
          <div>
            <p className="detail-kicker">Evento em Caraguatatuba</p>
            <h1 className="detail-title">{event.name}</h1>
            <dl className="info-list">
              <dt>Data</dt>
              <dd>
                {formatDate(event.startDate)}
                {event.endDate ? ` a ${formatDate(event.endDate)}` : ""}
              </dd>
              <dt>Horário</dt>
              <dd>{event.time ?? "A confirmar"}</dd>
              <dt>Local</dt>
              <dd>{event.place}</dd>
              {event.address ? <>
                  <dt>Endereço</dt>
                  <dd>{event.address}</dd>
                </> : null}
              <dt>Entrada</dt>
              <dd>{event.entryInfo ?? "Consulte a organiza\xE7\xE3o"}</dd>
            </dl>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "rgba(246,240,225,0.6)" }}>
              Programações podem mudar. Confirme datas e horários com a organização antes de se deslocar.
            </p>
          </div>
        </div>
        <section className="detail-section">
          <h2>Sobre o evento</h2>
          <p style={{ whiteSpace: "pre-line" }}>{event.description}</p>
        </section>
      </div>
    </div>;
}
function EventoDetalhe() {
  const params = useParams();
  const id = Number(params.id);
  return <ProtectedRoute>
      {Number.isInteger(id) && id > 0 ? <EventoContent id={id} /> : <PageLoader />}
    </ProtectedRoute>;
}
export {
  EventoDetalhe as default
};
