import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FaxxinerMark } from "@/components/FaxxinerMark";

export function Layout() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo logo-with-mark" aria-label="Faxxiner — início">
            <FaxxinerMark className="logo-mark-svg" size="md" />
            <span className="logo-text-brand">faxxiner</span>
          </Link>
          <nav className="nav nav-main">
            {!loading && user && user.role !== "ADMIN" && (
              <NavLink to="/profissionais" className="nav-link">
                Buscar profissionais
              </NavLink>
            )}
            {!loading && user && (
              <>
                <NavLink to="/painel" className="nav-link">
                  Painel
                </NavLink>
                <NavLink to="/agendamentos" className="nav-link">
                  {user.role === "ADMIN" ? "Agenda geral" : "Agendamentos"}
                </NavLink>
                {user.role === "DIARISTA" && (
                  <NavLink to="/perfil" className="nav-link">
                    Meu perfil
                  </NavLink>
                )}
                <span className="nav-user">{user.name}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
                  Sair
                </button>
              </>
            )}
            {!loading && !user && (
              <>
                <details className="nav-dropdown">
                  <summary className="nav-dropdown-summary">Sou diarista</summary>
                  <div className="nav-dropdown-panel">
                    <Link to="/cadastro?role=DIARISTA" className="nav-dropdown-link">
                      Cadastrar
                    </Link>
                    <Link to="/entrar" className="nav-dropdown-link">
                      Entrar
                    </Link>
                  </div>
                </details>
                <Link to="/cadastro?role=CLIENT" className="btn btn-ghost btn-sm">
                  Sou cliente
                </Link>
                <Link to="/entrar" className="btn btn-outline-brand btn-sm">
                  Entrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="site-main">
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
            <a href="mailto:contato@exemplo.com" className="footer-link">
              Contato
            </a>
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
    </div>
  );
}
