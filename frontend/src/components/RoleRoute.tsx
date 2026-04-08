import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

export function RoleRoute({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="container section">
        <p className="muted">Carregando…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/entrar" replace state={{ from: loc.pathname }} />;
  }
  if (!allow.includes(user.role)) {
    return <Navigate to="/painel" replace />;
  }
  return <>{children}</>;
}
