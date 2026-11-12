import { Link } from "wouter";
function NotFound() {
  return <div className="section section--cream" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
      <div className="container" style={{ textAlign: "center" }}>
        <p className="eyebrow">Erro 404</p>
        <h1 style={{ fontSize: "clamp(64px, 10vw, 130px)", color: "var(--navy)" }}>PÁGINA NÃO ENCONTRADA</h1>
        <p className="lead muted" style={{ maxWidth: 520, margin: "10px auto 26px" }}>
          O caminho que você tentou acessar não existe ou foi movido. Volte para a página inicial e continue explorando.
        </p>
        <Link href="/" className="btn btn--navy">
          Ir para o início
        </Link>
      </div>
    </div>;
}
export {
  NotFound as default
};
