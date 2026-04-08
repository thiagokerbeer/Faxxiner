import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function PainelRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container section">
        <p className="muted">Carregando…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/entrar" replace state={{ from: "/painel" }} />;
  }
  if (user.role === "ADMIN") {
    return <Navigate to="/painel/admin" replace />;
  }
  if (user.role === "DIARISTA") {
    return <Navigate to="/painel/profissional" replace />;
  }
  return <Navigate to="/painel/cliente" replace />;
}
