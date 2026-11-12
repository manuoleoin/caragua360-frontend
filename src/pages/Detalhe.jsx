import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Loader, PageLoader, ProtectedRoute } from "@/components/ui-bits";
function DetalheContent({ tipo, id }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [favoriteId, setFavoriteId] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const endpoint = tipo === "hospedagem" ? "accommodations" : tipo === "restaurante" ? "restaurants" : "activities";
  const key = tipo === "hospedagem" ? "accommodation" : tipo === "restaurante" ? "restaurant" : "activity";
  async function load() {
    try {
      const result = await api.get(`/${endpoint}/${id}`);
      setData(result[key]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conte\xFAdo n\xE3o encontrado.");
    }
  }
  useEffect(() => {
    void load();
  }, [endpoint, id]);
  async function toggleFavorite() {
    if (!data || tipo === "atividade") return;
    const payload = tipo === "hospedagem" ? { accommodationId: data.id } : { restaurantId: data.id };
    const isFavorite2 = data.isFavorite;
    try {
      if (favoriteId) {
        await api.delete(`/favorites/${favoriteId}`);
        setFavoriteId(null);
      } else if (isFavorite2) {
        const result = await api.get("/favorites");
        const found = result.favorites.find(
          (favorite) => tipo === "hospedagem" ? favorite.accommodation?.id === data.id : favorite.restaurant?.id === data.id
        );
        if (found) await api.delete(`/favorites/${found.id}`);
      } else {
        const result = await api.post("/favorites", payload);
        setFavoriteId(result.favorite.id);
      }
      toast.success("Favoritos atualizados.");
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
  if (!data) return <Loader />;
  const photos = data.photos.length > 0 ? data.photos : [{ url: "/images/cat-comer.jpg" }];
  const isFavorite = Boolean(data.isFavorite) || Boolean(favoriteId);
  return <div className="detail-page">
      <div className="container">
        <Link href="/explore" className="link-arrow" style={{ marginBottom: 26, display: "inline-flex" }}>
          ← Voltar ao Explore
        </Link>
        <div className="detail-top">
          <div>
            <img className="detail-gallery-main" src={photos[Math.min(photoIndex, photos.length - 1)].url} alt={data.name} />
            {photos.length > 1 ? <div className="detail-thumbs">
                {photos.map((photo, index) => <button key={photo.id ?? photo.url} type="button" className={index === photoIndex ? "is-active" : ""} onClick={() => setPhotoIndex(index)}>
                    <img src={photo.url} alt={`${data.name} \u2014 foto ${index + 1}`} />
                  </button>)}
              </div> : null}
          </div>
          <div>
            <p className="detail-kicker">
              {tipo === "hospedagem" ? "Hospedagem" : tipo === "restaurante" ? "Onde comer" : "Atividade"} ·{" "}
              {data.neighborhood ?? "Caraguatatuba"}
            </p>
            <h1 className="detail-title">{data.name}</h1>
            <dl className="info-list">
              {tipo === "hospedagem" && data.address ? <>
                  <dt>Endereço</dt>
                  <dd>{data.address}</dd>
                </> : null}
              {tipo === "hospedagem" && data.amenities?.length ? <>
                  <dt>Comodidades</dt>
                  <dd>{data.amenities?.join(" \xB7 ")}</dd>
                </> : null}
              {tipo === "hospedagem" && data.contactPhone ? <>
                  <dt>Contato</dt>
                  <dd>{data.contactPhone}</dd>
                </> : null}
              {tipo === "restaurante" && data.address ? <>
                  <dt>Endereço</dt>
                  <dd>{data.address}</dd>
                </> : null}
              {tipo === "restaurante" && data.cuisine ? <>
                  <dt>Cozinha</dt>
                  <dd>{data.cuisine}</dd>
                </> : null}
              {tipo === "restaurante" && data.openingHours ? <>
                  <dt>Horários</dt>
                  <dd>
                    {Object.entries(data.openingHours ?? {}).map(([day, hours]) => <span key={day} style={{ display: "block" }}>
                        {day}: {hours}
                      </span>)}
                  </dd>
                </> : null}
              {tipo === "restaurante" && data.contact ? <>
                  <dt>Contato</dt>
                  <dd>{data.contact}</dd>
                </> : null}
              {tipo === "atividade" && data.location ? <>
                  <dt>Local</dt>
                  <dd>{data.location}</dd>
                </> : null}
              {tipo === "atividade" && data.schedule ? <>
                  <dt>Horários</dt>
                  <dd>{data.schedule}</dd>
                </> : null}
              {tipo === "atividade" && data.priceInfo ? <>
                  <dt>Valores</dt>
                  <dd>{data.priceInfo}</dd>
                </> : null}
              {tipo === "atividade" && data.contact ? <>
                  <dt>Contato</dt>
                  <dd>{data.contact}</dd>
                </> : null}
              {data.priceRange ? <>
                  <dt>Faixa de preço</dt>
                  <dd>{data.priceRange}</dd>
                </> : null}
            </dl>
            {tipo !== "atividade" ? <div className="detail-actions">
                <button type="button" className={`favorite-btn ${isFavorite ? "is-active" : ""}`} onClick={toggleFavorite}>
                  ♥ {isFavorite ? "Favoritado" : "Favoritar"}
                </button>
              </div> : null}
          </div>
        </div>

        <section className="detail-section">
          <h2>Sobre</h2>
          <p style={{ whiteSpace: "pre-line" }}>{data.description}</p>
        </section>

        {data.photos.length > 1 ? <section className="detail-section">
            <h2>Fotos</h2>
            <div className="photo-grid">
              {data.photos.map((photo) => <img key={photo.id ?? photo.url} src={photo.url} alt={data.name} loading="lazy" />)}
            </div>
          </section> : null}
      </div>
    </div>;
}
function Detalhe() {
  const params = useParams();
  const tipo = params.tipo;
  const id = Number(params.id);
  const valid = ["hospedagem", "restaurante", "atividade"].includes(tipo) && Number.isInteger(id);
  return <ProtectedRoute>
      {valid ? <DetalheContent tipo={tipo} id={id} /> : <PageLoader />}
    </ProtectedRoute>;
}
export {
  Detalhe as default
};
