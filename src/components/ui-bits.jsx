import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
function Loader({ label = "Carregando\u2026" }) {
  return <div className="loading-block" role="status">
      <div className="spinner" />
      {label}
    </div>;
}
function Stars({ value, size = 16 }) {
  const rounded = Math.round((value ?? 0) * 2) / 2;
  return <span className="rating" aria-label={`Avalia\xE7\xE3o ${value ?? 0} de 5`}>
      {[1, 2, 3, 4, 5].map((index) => <svg key={index} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path
    d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9L12 2.6z"
    fill={rounded >= index ? "currentColor" : rounded >= index - 0.5 ? "url(#half)" : "none"}
    stroke="currentColor"
    strokeWidth="1.4"
    className="star"
  />
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>)}
      {value ? <span>{value.toFixed(1)}</span> : null}
    </span>;
}
function Avatar({ name, photo, size }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return <span className="avatar" style={size ? { width: size, height: size } : void 0}>
      {photo ? <img src={photo} alt={name} /> : initials}
    </span>;
}
function PageLoader() {
  return <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
      <Loader />
    </div>;
}
function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();
  useEffect(() => {
    if (!loading && !user) {
      navigate(`/login?redirect=${encodeURIComponent(location)}`);
    }
  }, [loading, user, location, navigate]);
  if (loading) return <PageLoader />;
  if (!user) return <PageLoader />;
  if (admin && user.role !== "ADMIN") {
    return <div className="container" style={{ padding: "80px 0" }}>
        <div className="empty-state">Esta área é exclusiva da administração do Caragua360.</div>
      </div>;
  }
  return <>{children}</>;
}
function PageHead({ title, subtitle }) {
  return <div className="page-head">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>;
}
function ErrorBox({ message }) {
  if (!message) return null;
  return <div className="form-error">{message}</div>;
}
export {
  Avatar,
  ErrorBox,
  Loader,
  PageHead,
  PageLoader,
  ProtectedRoute,
  Stars
};
