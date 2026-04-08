import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FaxxinerMark } from "@/components/FaxxinerMark";

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL?.trim();

export function Layout() {
  const { user, loading, logout, authNotice, clearAuthNotice } = useAuth();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [diaristaMenuOpen, setDiaristaMenuOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
    setDiaristaMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!navOpen && !diaristaMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNavOpen(false);
        setDiaristaMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen, diaristaMenuOpen]);

  const showBuscarProfissionais = !loading && (!user || user.role !== "ADMIN");

  function toggleNav() {
    setNavOpen((o) => {
      if (o) setDiaristaMenuOpen(false);
      return !o;
    });
  }

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-to-content">
        Ir para o conteúdo
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo logo-with-mark" aria-label="Faxxiner — início">
            <FaxxinerMark className="logo-mark-svg" size="md" />
            <span className="logo-text-brand">faxxiner</span>
          </Link>
          <button
            type="button"
            className="nav-menu-toggle"
            aria-expanded={navOpen}
            aria-controls="main-navigation"
            onClick={toggleNav}
          >
            <span className="visually-hidden">{navOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}</span>
            <span className="nav-menu-bars" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
          <nav
            id="main-navigation"
            className={`nav nav-main ${navOpen ? "nav-main-open" : ""}`}
            aria-label="Principal"
          >
            {showBuscarProfissionais && (
              <NavLink to="/profissionais" className="nav-link" onClick={() => setNavOpen(false)}>
                Buscar profissionais
              </NavLink>
            )}
            {!loading && user && (
              <>
                <NavLink to="/painel" className="nav-link" onClick={() => setNavOpen(false)}>
                  Painel
                </NavLink>
                <NavLink to="/agendamentos" className="nav-link" onClick={() => setNavOpen(false)}>
                  {user.role === "ADMIN" ? "Agenda geral" : "Agendamentos"}
                </NavLink>
                {user.role === "DIARISTA" && (
                  <NavLink to="/perfil" className="nav-link" onClick={() => setNavOpen(false)}>
                    Meu perfil
                  </NavLink>
                )}
                <span className="nav-user" title={user.name}>
                  {user.name}
                </span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => void logout()}>
                  Sair
                </button>
              </>
            )}
            {!loading && !user && (
              <>
                <div
                  className={`nav-dropdown nav-dropdown-a11y ${diaristaMenuOpen ? "is-open" : ""}`}
                  onBlurCapture={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDiaristaMenuOpen(false);
                  }}
                >
                  <button
                    type="button"
                    id="nav-diarista-trigger"
                    className="nav-dropdown-trigger"
                    aria-expanded={diaristaMenuOpen}
                    aria-controls="nav-diarista-panel"
                    aria-haspopup="true"
                    onClick={() => setDiaristaMenuOpen((o) => !o)}
                  >
                    Sou diarista
                  </button>
                  <div
                    id="nav-diarista-panel"
                    className="nav-dropdown-panel"
                    role="region"
                    aria-labelledby="nav-diarista-trigger"
                    hidden={!diaristaMenuOpen}
                  >
                    <Link
                      to="/cadastro?role=DIARISTA"
                      className="nav-dropdown-link"
                      onClick={() => {
                        setDiaristaMenuOpen(false);
                        setNavOpen(false);
                      }}
                    >
                      Cadastrar
                    </Link>
                    <Link
                      to="/entrar"
                      className="nav-dropdown-link"
                      onClick={() => {
                        setDiaristaMenuOpen(false);
                        setNavOpen(false);
                      }}
                    >
                      Entrar
                    </Link>
                  </div>
                </div>
                <Link to="/cadastro?role=CLIENT" className="btn btn-ghost btn-sm" onClick={() => setNavOpen(false)}>
                  Sou cliente
                </Link>
                <Link to="/entrar" className="btn btn-outline-brand btn-sm" onClick={() => setNavOpen(false)}>
                  Entrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="site-main" id="main-content">
        <Outlet />
      </main>
      <footer className="site-footer site-footer-extended">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-top">
              <FaxxinerMark className="footer-mark-svg" size="sm" />
              <strong className="footer-logo">faxxiner</strong>
            </div>
            <p className="muted small">
              Conectamos famílias a profissionais de trabalho doméstico — com perfil claro, valores visíveis e
              agendamento online.
            </p>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Ajuda</span>
            <Link to="/#faq" className="footer-link">
              Perguntas frequentes
            </Link>
            {CONTACT_EMAIL ? (
              <a href={`mailto:${CONTACT_EMAIL}`} className="footer-link">
                Contato
              </a>
            ) : (
              <Link to="/privacidade" className="footer-link">
                Contato (privacidade)
              </Link>
            )}
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Legal</span>
            <Link to="/privacidade" className="footer-link">
              Privacidade e LGPD
            </Link>
            <span className="footer-link muted">Termos de uso (em breve)</span>
          </div>
        </div>
        <div className="container footer-bottom">
          <p className="muted small">© {new Date().getFullYear()} Faxxiner · projeto de portfólio</p>
        </div>
      </footer>
      {authNotice ? (
        <div className="auth-notice" role="status" aria-live="polite">
          <p className="auth-notice-text">{authNotice}</p>
          <button type="button" className="auth-notice-dismiss" onClick={clearAuthNotice} aria-label="Fechar aviso">
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
