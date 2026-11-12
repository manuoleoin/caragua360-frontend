import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { api, formatDate } from "@/lib/api";
import { Loader, PageLoader, ProtectedRoute, Stars } from "@/components/ui-bits";
import { CommentSection, ReviewSection } from "@/components/ReviewSection";
const CATEGORY_LABEL = {
  PRAIA: "Praia",
  PONTO: "Ponto tur\xEDstico",
  TRILHA: "Trilha",
  CACHOEIRA: "Cachoeira"
};
function BalneabilityBadge({ local }) {
  const record = local.balneability;
  if (!record || record.status === "NAO_AVALIADA") {
    return <div style={{ marginTop: 14, display: "grid", gap: 6 }}>
        <span className="badge badge--blue">Balneabilidade indisponível</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, color: "rgba(246,240,225,0.65)" }}>
          Nenhuma medição recente foi importada. Consulte o boletim oficial da CETESB antes da visita.
        </span>
      </div>;
  }
  const label = record.status === "PROPRIA" ? "Pr\xF3pria para banho" : "Impr\xF3pria para banho";
  return <div style={{ marginTop: 14, display: "grid", gap: 6 }}>
      <span className={`badge ${record.status === "PROPRIA" ? "badge--green" : "badge--red"}`}>{label}</span>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, color: "rgba(246,240,225,0.65)" }}>
        Fonte: {record.source} · medição de {formatDate(record.measuredAt)}. Confira o boletim atualizado antes da visita.
      </span>
    </div>;
}
function DestinoContent({ id }) {
  const [local, setLocal] = useState(null);
  const [error, setError] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [favoriteId, setFavoriteId] = useState(null);
  const load = useCallback(async () => {
    try {
      const result = await api.get(`/locals/${id}`);
      setLocal(result.local);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Destino n\xE3o encontrado.");
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  async function toggleFavorite() {
    if (!local) return;
    try {
      if (favoriteId) {
        await api.delete(`/favorites/${favoriteId}`);
        setFavoriteId(null);
        toast.success("Removido dos favoritos.");
      } else if (local.isFavorite) {
        const result = await api.get("/favorites");
        const found = result.favorites.find((favorite) => favorite.local?.id === local.id);
        if (found) await api.delete(`/favorites/${found.id}`);
        setLocal({ ...local, isFavorite: false });
        toast.success("Removido dos favoritos.");
      } else {
        const result = await api.post("/favorites", { localId: local.id });
        setFavoriteId(result.favorite.id);
        setLocal({ ...local, isFavorite: true });
        toast.success("Salvo nos favoritos.");
      }
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel atualizar o favorito.");
    }
  }
  if (error) {
    return <div className="container" style={{ padding: "70px 0" }}>
        <div className="form-error">{error}</div>
        <Link href="/explore" className="btn btn--navy" style={{ marginTop: 16 }}>
          Voltar ao Explore
        </Link>
      </div>;
  }
  if (!local) return <Loader label="Carregando destino…" />;
  const photos = local.photos.length > 0 ? local.photos : [{ url: "/images/cat-praias.jpg" }];
  const mainPhoto = photos[Math.min(photoIndex, photos.length - 1)]?.url;
  const mapUrl = local.latitude && local.longitude ? `https://www.openstreetmap.org/?mlat=${local.latitude}&mlon=${local.longitude}#map=16/${local.latitude}/${local.longitude}` : null;
  return <div className="detail-page">
      <div className="container">
        <Link href="/explore" className="link-arrow" style={{ marginBottom: 26, display: "inline-flex" }}>
          ← Voltar ao Explore
        </Link>

        <div className="detail-top">
          <div>
            <img className="detail-gallery-main" src={mainPhoto} alt={local.name} />
            {photos.length > 1 ? <div className="detail-thumbs">
                {photos.map((photo, index) => <button key={photo.id ?? photo.url} type="button" className={index === photoIndex ? "is-active" : ""} onClick={() => setPhotoIndex(index)}>
                    <img src={photo.url} alt={`${local.name} \u2014 foto ${index + 1}`} />
                  </button>)}
              </div> : null}
          </div>

          <div>
            <p className="detail-kicker">
              {CATEGORY_LABEL[local.category]} · {local.neighborhood ?? "Caraguatatuba"}
            </p>
            <h1 className="detail-title">{local.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Stars value={local.rating} />
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "rgba(246,240,225,0.65)" }}>
                {local.reviewsCount} avaliação(ões)
              </span>
            </div>
            <BalneabilityBadge local={local} />

            <dl className="info-list">
              {local.access ? <>
                  <dt>Acesso</dt>
                  <dd>{local.access}</dd>
                </> : null}
              {local.capacity ? <>
                  <dt>Lotação</dt>
                  <dd>{local.capacity}</dd>
                </> : null}
              {local.sea ? <>
                  <dt>Mar</dt>
                  <dd>{local.sea}</dd>
                </> : null}
              {local.structure ? <>
                  <dt>Estrutura</dt>
                  <dd>{local.structure}</dd>
                </> : null}
              {local.profile ? <>
                  <dt>Perfil</dt>
                  <dd>{local.profile}</dd>
                </> : null}
              {local.accessibility ? <>
                  <dt>Acessibilidade</dt>
                  <dd>{local.accessibility}</dd>
                </> : null}
              {local.address ? <>
                  <dt>Endereço</dt>
                  <dd>{local.address}</dd>
                </> : null}
            </dl>

            <div className="detail-actions">
              <button type="button" className={`favorite-btn ${local.isFavorite || favoriteId ? "is-active" : ""}`} onClick={toggleFavorite}>
                ♥ {local.isFavorite || favoriteId ? "Favoritado" : "Favoritar"}
              </button>
              {mapUrl ? <a href={mapUrl} target="_blank" rel="noreferrer" className="btn btn--outline btn--sm">
                  Ver no mapa
                </a> : null}
            </div>
          </div>
        </div>

        <section className="detail-section">
          <h2>Sobre o destino</h2>
          <p style={{ whiteSpace: "pre-line" }}>{local.description}</p>
        </section>

        {local.photos.length > 1 ? <section className="detail-section">
            <h2>Fotos</h2>
            <div className="photo-grid">
              {local.photos.map((photo) => <img key={photo.id ?? photo.url} src={photo.url} alt={`${local.name} \u2014 foto`} loading="lazy" />)}
            </div>
          </section> : null}

        <section className="detail-section">
          <h2>Avaliações</h2>
          <ReviewSection target={{ localId: local.id }} reviews={local.reviews} onChanged={load} />
        </section>

        <section className="detail-section">
          <h2>Comentários</h2>
          <CommentSection target={{ localId: local.id }} comments={local.comments} onChanged={load} />
        </section>
      </div>
    </div>;
}
function Destino() {
  const params = useParams();
  const id = Number(params.id);
  return <ProtectedRoute>
      {Number.isInteger(id) && id > 0 ? <DestinoContent id={id} /> : <PageLoader />}
    </ProtectedRoute>;
}
export {
  Destino as default
};
