import { useState } from "react";
import { Link, useLocation } from "wouter";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
function Home() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [surprising, setSurprising] = useState(false);
  async function surprise() {
    setSurprising(true);
    try {
      const result = await api.get("/locals/random");
      if (result.local) navigate(`/destino/${result.local.id}`);
    } catch {
      navigate("/explore");
    } finally {
      setSurprising(false);
    }
  }
  const exploreHref = user ? "/explore" : "/login?redirect=%2Fexplore";
  return <div>
      <section className="hero">
        <img className="hero-bg" src="/images/hero-caraguatatuba.jpg" alt="Vista aérea de uma praia de Caraguatatuba com mar azul e montanhas" />
        <div className="hero-content fade-up">
          <h1>DESCUBRA CARAGUATATUBA</h1>
          <p className="hero-sub">
            Encontre as melhores praias, trilhas, eventos e experiências da cidade mais populosa do Litoral Norte de São
            Paulo. Explore. Preserve. Viva Caraguá.
          </p>
          <Link href={exploreHref} className="btn btn--yellow">
            Comece a explorar
          </Link>
        </div>
        <span className="hero-caption">Foto: Praia de Martim de Sá</span>
      </section>

      <section className="section section--navy">
        <div className="container split">
          <div>
            <p className="eyebrow">Litoral Norte de São Paulo</p>
            <h2 className="split-title">A CIDADE</h2>
            <p className="split-text">
              Caraguatatuba reúne 17 praias ao longo da orla, a Serra do Mar e o Núcleo Caraguatatuba do Parque Estadual
              da Serra do Mar, com trilhas e cachoeiras. É a cidade mais populosa do Litoral Norte e uma das 15 Estâncias
              Balneárias do estado, a cerca de 178 km da capital paulista. A história caiçara, a pesca artesanal e a Mata
              Atlântica convivem com uma orla urbana movimentada, quiosques, cultura e ecoturismo.
            </p>
            <div className="stat-row">
              <div>
                <div className="stat-value">17</div>
                <div className="stat-label">praias</div>
              </div>
              <div>
                <div className="stat-value">134,8 mil</div>
                <div className="stat-label">habitantes (Censo 2022)</div>
              </div>
              <div>
                <div className="stat-value">35.947 ha</div>
                <div className="stat-label">de Mata Atlântica no PESM</div>
              </div>
            </div>
          </div>
          <div className="split-media">
            <img src="/images/cidade-garca-barco.jpg" alt="Garça branca sobre um barco pesqueiro em Caraguatatuba" />
          </div>
        </div>
      </section>

      <section className="banner">
        <img src="/images/destino-tamandua.jpg" alt="Ilha do Tamanduá vista do mar, em Caraguatatuba" />
        <div className="banner-content">
          <h2>ENCONTRE UM NOVO DESTINO</h2>
          <button type="button" className="btn btn--navy" onClick={surprise} disabled={surprising}>
            {surprising ? "Procurando\u2026" : "Surpreenda-se"}
          </button>
        </div>
        <span className="caption">Foto: Ilha do Tamanduá</span>
      </section>

      <section className="section section--navy">
        <div className="container experience">
          <p className="eyebrow">Cultura e lazer</p>
          <h2>VIVA NOVAS EXPERIÊNCIAS</h2>
          <figure className="experience-figure">
            <img src="/images/macc-exposicao.jpg" alt="Exposição de arte no MACC, Museu de Arte e Cultura de Caraguatatuba" />
          </figure>
          <p className="experience-caption">Exposições no MACC — Museu de Arte e Cultura de Caraguatatuba</p>
          <Link href={user ? "/explore?categoria=pontos" : "/login?redirect=%2Fexplore%3Fcategoria%3Dpontos"} className="btn btn--cream">
            Conhecer
          </Link>
        </div>
      </section>
    </div>;
}
export {
  Home as default
};
