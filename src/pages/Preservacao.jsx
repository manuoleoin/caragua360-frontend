import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/ui-bits";
function Preservacao() {
  const { user } = useAuth();
  const [contents, setContents] = useState(null);
  const [suggestion, setSuggestion] = useState({ type: "DICA", title: "", description: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    api.get("/sustainability").then((result) => setContents(result.contents)).catch(() => setContents([]));
  }, []);
  async function sendSuggestion(event) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      await api.post("/suggestions", suggestion);
      toast.success("Sugest\xE3o enviada! A equipe do Caragua360 vai analisar.");
      setSuggestion({ type: "DICA", title: "", description: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "N\xE3o foi poss\xEDvel enviar.");
    } finally {
      setSending(false);
    }
  }
  return <div>
      <section className="preserve-hero">
        <img src="/images/preservacao-floresta.jpg" alt="Mata Atlântica com neblina na Serra do Mar" />
        <div className="preserve-content">
          <h1>PRESERVAÇÃO</h1>
          <p className="subtitle">A beleza de Caraguatatuba depende de como cuidamos dela.</p>
          <div className="glass-box">
            Caraguatatuba é uma Estância Balneária cercada por Mata Atlântica, manguezais e restingas. O turismo sustenta
            parte importante da economia local, mas também pressiona praias, trilhas e rios. Preservar é uma escolha
            cotidiana: recolher o próprio lixo, respeitar a fauna, não retirar plantas e acompanhar a qualidade da água
            antes de entrar no mar. Cada visitante tem um papel na saúde da costa.
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container split">
          <div className="consequences-media">
            <img src="/images/preservacao-ave-lixo.jpg" alt="Ave em contato com resíduos plásticos em área urbana" />
          </div>
          <div>
            <p className="eyebrow">O outro lado</p>
            <h2 style={{ fontSize: "clamp(40px, 4.6vw, 64px)", color: "var(--navy)", marginBottom: 20 }}>
              QUAIS AS CONSEQUÊNCIAS?
            </h2>
            <p className="lead" style={{ color: "var(--muted)" }}>
              Lixo na areia e no mar mata aves, tartarugas e peixes que confundem plástico com alimento. Bitucas e
              embalagens contaminam a água e chegam à cadeia alimentar. A remoção de vegetação de restinga aumenta a erosão
              da orla; trilhas fora do caminho sinalizado degradam o solo e afastam a fauna. Na alta temporada, o excesso de
              visitantes sem cuidado acelera esses impactos — e a balneabilidade das praias é o termômetro mais direto
              disso.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--cream" style={{ paddingTop: 0 }}>
        <div className="container">
          <p className="eyebrow" style={{ textAlign: "center" }}>
            Atitudes simples
          </p>
          <h2 className="section-title section-title--center" style={{ color: "var(--navy)", marginBottom: 10 }}>
            COMO CUIDAR?
          </h2>
          <p style={{ textAlign: "center", maxWidth: 720, margin: "0 auto", color: "var(--muted)" }}>
            Pequenas escolhas durante a viagem reduzem o impacto e ajudam a manter Caraguatatuba bonita para quem vem
            depois.
          </p>
          <div className="care-grid">
            <div className="care-item">
              <div className="care-circle">
                <img src="/images/cuidar-descarte.jpg" alt="Voluntários recolhendo lixo em uma praia" />
              </div>
              <div className="care-number">01</div>
              <p>Descarte seu lixo corretamente e leve seus resíduos de volta.</p>
            </div>
            <div className="care-item">
              <div className="care-circle">
                <img src="/images/cuidar-natureza.jpg" alt="Ave marinha em área natural" />
              </div>
              <div className="care-number">02</div>
              <p>Respeite a natureza e seus recursos: não alimente animais nem retire plantas.</p>
            </div>
            <div className="care-item">
              <div className="care-circle">
                <img src="/images/cuidar-reciclaveis.jpg" alt="Materiais recicláveis separados" />
              </div>
              <div className="care-number">03</div>
              <p>Priorize matérias recicláveis e reutilizáveis no seu dia a dia.</p>
            </div>
            <div className="care-item">
              <div className="care-circle">
                <img src="/images/cuidar-trilhas.jpg" alt="Trilha em Mata Atlântica" />
              </div>
              <div className="care-number">04</div>
              <p>Preserve as trilhas e áreas naturais: fique no caminho e agende sua visita.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--navy">
        <div className="container">
          <p className="eyebrow">Guia prático</p>
          <h2 className="section-title" style={{ marginBottom: 30 }}>
            ORIENTAÇÕES DO CARAGUA360
          </h2>
          {!contents ? <Loader label="Carregando orientações…" /> : null}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 22 }}>
            {contents?.map((content) => <article key={content.id} style={{ background: "rgba(246,240,225,0.07)", border: "1px solid rgba(246,240,225,0.15)", borderRadius: 18, overflow: "hidden" }}>
                {content.imageUrl ? <img src={content.imageUrl} alt={content.title} style={{ width: "100%", height: 170, objectFit: "cover" }} /> : null}
                <div style={{ padding: "18px 20px 22px" }}>
                  <span className="badge badge--yellow">{content.category}</span>
                  <h3 style={{ fontSize: 28, margin: "12px 0 8px", color: "var(--cream)" }}>{content.title}</h3>
                  <p style={{ color: "rgba(246,240,225,0.85)", fontSize: 14.5 }}>{content.summary}</p>
                  <p style={{ color: "rgba(246,240,225,0.7)", fontSize: 13.5, marginBottom: 0 }}>{content.content}</p>
                </div>
              </article>)}
          </div>
        </div>
      </section>

      {(user?.role === "RESIDENT" || user?.role === "ADMIN") && <section className="section section--cream">
          <div className="container narrow">
            <div className="builder-card">
              <p className="eyebrow">Morador colaborador</p>
              <h2>Sugerir um ponto ou correção</h2>
              <p className="muted">Sua sugestão será analisada pela administração antes de ser publicada.</p>
              <form onSubmit={sendSuggestion} style={{ display: "grid", gap: 14 }}>
                <div className="field">
                  <label htmlFor="sug-type">Tipo de sugestão</label>
                  <select id="sug-type" className="select" value={suggestion.type} onChange={(e) => setSuggestion({ ...suggestion, type: e.target.value })}>
                    <option value="NOVO_PONTO">Novo ponto</option>
                    <option value="CORRECAO">Correção</option>
                    <option value="DICA">Dica</option>
                    <option value="RECOMENDACAO">Recomendação</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="sug-title">Título</label>
                  <input id="sug-title" className="input" value={suggestion.title} onChange={(e) => setSuggestion({ ...suggestion, title: e.target.value })} required minLength={3} />
                </div>
                <div className="field">
                  <label htmlFor="sug-desc">Descrição</label>
                  <textarea id="sug-desc" className="textarea" value={suggestion.description} onChange={(e) => setSuggestion({ ...suggestion, description: e.target.value })} required minLength={10} />
                </div>
                {error ? <div className="form-error">{error}</div> : null}
                <button type="submit" className="btn btn--navy" disabled={sending}>
                  {sending ? "Enviando\u2026" : "Enviar sugest\xE3o"}
                </button>
              </form>
            </div>
          </div>
        </section>}
    </div>;
}
export {
  Preservacao as default
};
