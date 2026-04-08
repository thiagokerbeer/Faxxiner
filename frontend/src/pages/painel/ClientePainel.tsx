import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { LgpdAccountSection } from "@/components/LgpdAccountSection";
import type { BookingRow, BookingStatus } from "@/types";

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceito",
  REJECTED: "Recusado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function ClientePainel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api<BookingRow[]>("/api/bookings")
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pendentes = rows.filter((b) => b.status === "PENDING").length;
  const aceitos = rows.filter((b) => b.status === "ACCEPTED").length;
  const recent = rows.slice(0, 4);

  return (
    <div className="container section dash-page">
      <header className="dash-header">
        <h1>Olá, {user?.name?.split(" ")[0] ?? "cliente"}</h1>
        <p className="muted">Encontre profissionais e acompanhe seus pedidos em um só lugar.</p>
      </header>

      <Link to="/profissionais" className="btn btn-cta-client btn-lg btn-block dash-cta-main">
        Buscar profissionais
      </Link>

      <div className="dash-stats">
        <div className="dash-stat-card">
          <span className="dash-stat-value">{pendentes}</span>
          <span className="dash-stat-label">Aguardando resposta</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{aceitos}</span>
          <span className="dash-stat-label">Confirmados</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{rows.length}</span>
          <span className="dash-stat-label">Total de pedidos</span>
        </div>
      </div>

      <section className="dash-section">
        <div className="dash-section-head">
          <h2>Seus últimos pedidos</h2>
          <Link to="/agendamentos" className="dash-link-all">
            Ver tudo
          </Link>
        </div>
        {loading && <p className="muted">Carregando…</p>}
        {!loading && recent.length === 0 && (
          <p className="muted dash-empty">
            Você ainda não fez nenhum pedido.{" "}
            <Link to="/profissionais">Busque alguém perto de você</Link>.
          </p>
        )}
        {!loading && recent.length > 0 && (
          <ul className="dash-mini-list">
            {recent.map((b) => (
              <li key={b.id} className="dash-mini-row">
                <div>
                  <strong>{b.diarist?.name ?? "Profissional"}</strong>
                  <span className="muted small"> · {formatWhen(b.scheduledAt)}</span>
                </div>
                <span className={`status-pill status-${b.status.toLowerCase()}`}>
                  {STATUS_LABEL[b.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <LgpdAccountSection />
    </div>
  );
}
