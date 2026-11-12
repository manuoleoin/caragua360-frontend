import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { api } from "@/lib/api";
import { Loader, Stars } from "@/components/ui-bits";
const CATEGORY_CARDS = [
  { key: "praias", label: "PRAIAS", image: "/images/cat-praias.jpg", description: "8 praias da orla central ao norte" },
  { key: "pontos", label: "PONTOS", image: "/images/cat-pontos.jpg", description: "Mirantes, museus e parques" },
  { key: "atividades", label: "ATIVIDADES", image: "/images/cat-atividades.jpg", description: "Passeios, esportes e trilhas" },
  { key: "restaurantes", label: "ONDE COMER", image: "/images/cat-comer.jpg", description: "Frutos do mar e cozinha local" },
  { key: "hospedagens", label: "HOSPEDAGEM", image: "/images/cat-hospedagem.jpg", description: "Hot\xE9is e pousadas" }
];
function Tile({ image, kicker, title, meta, summary, href, rating }) {
  return <Link href={href} className="tile">
      <div className="tile-media">
        {image ? <img src={image} alt={title} loading="lazy" /> : null}
      </div>
      <div className="tile-body">
        <span className="tile-kicker">{kicker}</span>
        <span className="tile-title">{title}</span>
        {meta ? <span className="tile-meta">{meta}</span> : null}
        {summary ? <span className="tile-summary">{summary}</span> : null}
        <div className="tile-footer">
          {rating ? <Stars value={rating} /> : <span className="tile-meta">Ver detalhes</span>}
          <span className="tile-kicker">Abrir →</span>
        </div>
      </div>
    </Link>;
}
function Explore() {
  const search = useSearch();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const category = useMemo(() => new URLSearchParams(search).get("categoria"), [search]);
  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/locals"),
      api.get("/restaurants"),
      api.get("/accommodations"),
      api.get("/activities")
    ]).then(([locals, restaurants, accommodations, activities]) => {
      if (!active) return;
      setData({ locals: locals.locals, restaurants: restaurants.restaurants, accommodations: accommodations.accommodations, activities: activities.activities });
    }).catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!category || !data) return;
    const element = document.getElementById(category);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [category, data]);
  if (error) return <div className="container" style={{ padding: "60px 0" }}><div className="form-error">{error}</div></div>;
  if (!data) return <Loader label="Carregando destinos de Caraguatatuba…" />;
  const beaches = data.locals.filter((local) => local.category === "PRAIA");
  const points = data.locals.filter((local) => local.category === "PONTO");
  const trails = data.locals.filter((local) => local.category === "TRILHA" || local.category === "CACHOEIRA");
  return <div className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="page-head">
          <p className="eyebrow">Explore Caraguatatuba</p>
          <h1>QUAL SEU INTERESSE HOJE?</h1>
          <p>Escolha uma categoria para ver praias, pontos turísticos, atividades, restaurantes e hospedagens selecionadas na cidade.</p>
        </div>

        <div className="category-grid">
          {CATEGORY_CARDS.map((card) => <a key={card.key} href={`#${card.key}`} className="category-card">
              <img src={card.image} alt={card.label} loading="lazy" />
              <span>{card.label}</span>
            </a>)}
        </div>

        <section className="explore-section" id="praias">
          <div className="explore-section__head">
            <div>
              <p className="eyebrow">Mar e areia</p>
              <h2>PRAIAS</h2>
            </div>
            <p>{beaches.length} praias catalogadas · da Prainha a Tabatinga</p>
          </div>
          <div className="card-grid">
            {beaches.map((beach) => <Tile
    key={beach.id}
    image={beach.photo}
    kicker={beach.neighborhood ?? "Caraguatatuba"}
    title={beach.name}
    meta={beach.sea}
    summary={beach.summary}
    rating={beach.rating}
    href={`/destino/${beach.id}`}
  />)}
          </div>
        </section>

        <section className="explore-section" id="pontos">
          <div className="explore-section__head">
            <div>
              <p className="eyebrow">Cultura e paisagem</p>
              <h2>PONTOS TURÍSTICOS</h2>
            </div>
            <p>{points.length} pontos para visitar</p>
          </div>
          <div className="card-grid">
            {points.map((point) => <Tile
    key={point.id}
    image={point.photo}
    kicker={point.neighborhood ?? "Caraguatatuba"}
    title={point.name}
    meta={point.profile}
    summary={point.summary}
    rating={point.rating}
    href={`/destino/${point.id}`}
  />)}
          </div>
        </section>

        <section className="explore-section" id="atividades">
          <div className="explore-section__head">
            <div>
              <p className="eyebrow">Mar, vento e mata</p>
              <h2>ATIVIDADES</h2>
            </div>
            <p>{data.activities.length} experiências</p>
          </div>
          <div className="card-grid">
            {data.activities.map((activity) => <Tile
    key={activity.id}
    image={activity.photos?.[0]?.url ?? activity.photo ?? null}
    kicker={activity.schedule ?? "Consulte hor\xE1rios"}
    title={activity.name}
    meta={activity.location}
    summary={activity.description}
    href={`/detalhe/atividade/${activity.id}`}
  />)}
          </div>
        </section>

        <section className="explore-section" id="restaurantes">
          <div className="explore-section__head">
            <div>
              <p className="eyebrow">Sabores do litoral</p>
              <h2>ONDE COMER</h2>
            </div>
            <p>{data.restaurants.length} restaurantes</p>
          </div>
          <div className="card-grid">
            {data.restaurants.map((restaurant) => <Tile
    key={restaurant.id}
    image={restaurant.photos?.[0]?.url ?? restaurant.photo ?? null}
    kicker={restaurant.cuisine ?? "Restaurante"}
    title={restaurant.name}
    meta={[restaurant.neighborhood, restaurant.priceRange].filter(Boolean).join(" \xB7 ")}
    summary={restaurant.description}
    href={`/detalhe/restaurante/${restaurant.id}`}
  />)}
          </div>
        </section>

        <section className="explore-section" id="hospedagens">
          <div className="explore-section__head">
            <div>
              <p className="eyebrow">Onde ficar</p>
              <h2>HOSPEDAGEM</h2>
            </div>
            <p>{data.accommodations.length} hotéis e pousadas</p>
          </div>
          <div className="card-grid">
            {data.accommodations.map((accommodation) => <Tile
    key={accommodation.id}
    image={accommodation.photos?.[0]?.url ?? accommodation.photo ?? null}
    kicker={accommodation.category}
    title={accommodation.name}
    meta={[accommodation.neighborhood, accommodation.priceRange].filter(Boolean).join(" \xB7 ")}
    summary={accommodation.description}
    href={`/detalhe/hospedagem/${accommodation.id}`}
  />)}
          </div>
        </section>

        {trails.length > 0 && <section className="explore-section" id="trilhas">
            <div className="explore-section__head">
              <div>
                <p className="eyebrow">Mata Atlântica</p>
                <h2>TRILHAS E CACHOEIRAS</h2>
              </div>
              <p>Parque Estadual da Serra do Mar e Canta Galo</p>
            </div>
            <div className="card-grid">
              {trails.map((trail) => <Tile
    key={trail.id}
    image={trail.photo}
    kicker={trail.category === "CACHOEIRA" ? "Cachoeira" : "Trilha"}
    title={trail.name}
    meta={trail.neighborhood}
    summary={trail.summary}
    href={`/destino/${trail.id}`}
  />)}
            </div>
          </section>}
      </div>
    </div>;
}
export {
  Explore as default
};
