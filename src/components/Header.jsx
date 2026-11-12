import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
function BrazilFlag() {
  return <svg className="brazil-flag" viewBox="0 0 720 504" role="img" aria-label="Bandeira do Brasil">
      <rect width="720" height="504" fill="#009c3b" />
      <polygon points="360,42 690,252 360,462 30,252" fill="#ffdf00" />
      <circle cx="360" cy="252" r="126" fill="#002776" />
      <path d="M238 222c70-30 175-26 244 18" stroke="#fff" strokeWidth="18" fill="none" />
    </svg>;
}
const EXPLORE_ITEMS = [
  { label: "Praias", href: "/explore?categoria=praias" },
  { label: "Pontos", href: "/explore?categoria=pontos" },
  { label: "Atividades", href: "/explore?categoria=atividades" },
  { label: "Onde comer", href: "/explore?categoria=restaurantes" },
  { label: "Hospedagem", href: "/explore?categoria=hospedagens" }
];
function Header() {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [location]);
  const isActive = (path) => path === "/" ? location === "/" : location.startsWith(path);
  const loginHref = `/login?redirect=${encodeURIComponent(location)}`;
  async function handleLogout() {
    await logout();
    toast.success("Sess\xE3o encerrada.");
    navigate("/");
  }
  return <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Caragua360 — página inicial">
          <span className="brand-word">
            CARAGUA360<span className="brand-dot">.</span>
          </span>
          <BrazilFlag />
        </Link>

        <button
    type="button"
    className="nav-toggle"
    aria-expanded={open}
    aria-label="Abrir menu"
    onClick={() => setOpen((value) => !value)}
  >
          Menu
        </button>

        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Navegação principal">
          <Link href="/" className={`nav-link ${isActive("/") ? "is-active" : ""}`}>
            Início
          </Link>
          <div className="nav-item">
            <Link href="/explore" className={`nav-link ${isActive("/explore") || isActive("/destino") || isActive("/detalhe") ? "is-active" : ""}`}>
              Explore<span className="nav-caret">▼</span>
            </Link>
            <div className="nav-dropdown">
              {EXPLORE_ITEMS.map((item) => <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>)}
            </div>
          </div>
          <Link href="/eventos" className={`nav-link ${isActive("/eventos") ? "is-active" : ""}`}>
            Eventos
          </Link>
          <Link href="/preservacao" className={`nav-link ${isActive("/preservacao") ? "is-active" : ""}`}>
            Preservação
          </Link>
          <Link href="/roteiros" className={`nav-link ${isActive("/roteiros") ? "is-active" : ""}`}>
            Roteiros
          </Link>
          {user?.role === "ADMIN" && <Link href="/admin" className={`nav-link ${isActive("/admin") ? "is-active" : ""}`}>
              Admin
            </Link>}
        </nav>

        <div className="header-auth">
          {user ? <>
              <Link href="/perfil" className="btn btn--cream btn--sm">
                Perfil
              </Link>
              <button type="button" className="logout-btn" onClick={handleLogout}>
                Sair
              </button>
            </> : <Link href={loginHref} className="btn btn--outline btn--sm">
              Entrar
            </Link>}
        </div>
      </div>
    </header>;
}
export {
  Header as default
};
