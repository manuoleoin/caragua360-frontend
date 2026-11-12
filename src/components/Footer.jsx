import { Link, useLocation } from "wouter";
const ICONS = {
  whatsapp: <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.37-.15-.19-1.18-1.57-1.18-3s.75-2.13 1.01-2.42c.27-.29.58-.36.78-.36l.56.01c.18 0 .42-.07.66.5.24.58.83 2.01.9 2.16.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.29 2.33 1.44.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.7-.17 1.38Z" />,
  instagram: <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </>,
  tiktok: <path d="M16.6 3c.3 2.2 1.7 3.7 3.9 3.9v3c-1.5.1-2.9-.4-3.9-1.2v6.1c0 3.6-2.5 6.2-6 6.2-3.2 0-5.6-2.4-5.6-5.5 0-3.3 2.7-5.8 6.1-5.5v3.1c-1.7-.4-3.1.7-3.1 2.3 0 1.4 1.1 2.5 2.5 2.5 1.5 0 2.6-1.1 2.6-2.8V3h3.5Z" />,
  facebook: <path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H8v3.3h2.6V21H14v-9.2h2.6l.4-3.3H14Z" />
};
function SocialIcon({ name, label, href }) {
  return <a className="social-icon" href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {ICONS[name]}
      </svg>
    </a>;
}
function Footer() {
  const [location] = useLocation();
  const loginHref = `/login?redirect=${encodeURIComponent(location)}`;
  return <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="footer-brand">CARAGUA360.</div>
          <p className="footer-text">
            Seu guia para descobrir os melhores roteiros. Explore. Preserve. Viva Caraguá.
          </p>
          <p className="footer-copy">© 2026 Caragua360. Todos os direitos reservados.</p>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">CONTATOS</h3>
          <ul className="footer-list">
            <li>
              <a href="mailto:caragua360@gmail.com">caragua360@gmail.com</a>
            </li>
            <li>
              <a href="tel:+551212345678">+55(12)1234-5678</a>
            </li>
          </ul>
          <h3 className="footer-title">REDES SOCIAIS</h3>
          <div className="social-row">
            <SocialIcon name="whatsapp" label="WhatsApp" href="https://wa.me/551212345678" />
            <SocialIcon name="instagram" label="Instagram" href="https://www.instagram.com/" />
            <SocialIcon name="tiktok" label="TikTok" href="https://www.tiktok.com/" />
            <SocialIcon name="facebook" label="Facebook" href="https://www.facebook.com/" />
          </div>
        </div>

        <div className="footer-col">
          <h3 className="footer-title">NAVEGUE</h3>
          <ul className="footer-list">
            <li>
              <Link href="/">Início</Link>
            </li>
            <li>
              <Link href="/explore">Explore</Link>
            </li>
            <li>
              <Link href="/eventos">Eventos</Link>
            </li>
            <li>
              <Link href="/preservacao">Preservação</Link>
            </li>
            <li>
              <Link href="/roteiros">Avaliações</Link>
            </li>
            <li>
              <Link href={loginHref}>Login</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>;
}
export {
  Footer as default
};
