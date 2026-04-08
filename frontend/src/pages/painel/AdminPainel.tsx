import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api";
import { LgpdAccountSection } from "@/components/LgpdAccountSection";
import type { AdminOverview, BookingStatus } from "@/types";

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceito",
  REJECTED: "Recusado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const ROLE_LABEL: Record<string, string> = {
  CLIENT: "Cliente",
  DIARISTA: "Profissional",
  ADMIN: "Admin",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function AdminPainel() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AdminOverview>("/api/admin/overview")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container section">
        <p className="muted">Carregando painel…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container section">
        <h1>Admin</h1>
        <p className="form-error">{error ?? "Sem dados"}</p>
      </div>
    );
  }

  const bookingTotal = Object.values(data.bookingsByStatus).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <div className="container section dash-page">
      <header className="dash-header">
        <h1>Painel do site</h1>
        <p className="muted">
          Visão geral para o administrador — usuários, perfis ativos e movimento de agendamentos.
        </p>
      </header>

      <div className="dash-stats dash-stats-admin">
        <div className="dash-stat-card">
          <span className="dash-stat-value">{data.users.clients}</span>
          <span className="dash-stat-label">Clientes</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{data.users.diaristas}</span>
          <span className="dash-stat-label">Profissionais</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{data.users.activeDiaristProfiles}</span>
          <span className="dash-stat-label">Perfis ativos na busca</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{bookingTotal}</span>
          <span className="dash-stat-label">Agendamentos</span>
        </div>
      </div>

      <div className="card dash-admin-note">
        <p className="small muted" style={{ margin: 0 }}>
          <Link to="/agendamentos">Abrir lista completa de agendamentos</Link> (somente leitura para admin).
        </p>
      </div>

      <section className="dash-section">
        <h2>Agendamentos por status</h2>
        <ul className="dash-status-grid">
          {(Object.keys(STATUS_LABEL) as BookingStatus[]).map((st) => (
            <li key={st} className="dash-status-cell">
              <span className="dash-status-count">{data.bookingsByStatus[st] ?? 0}</span>
              <span className="muted small">{STATUS_LABEL[st]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dash-section">
        <h2>Últimos cadastros</h2>
        <div className="table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Papel</th>
                <th>Quando</th>
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td className="td-mono">{u.email}</td>
                  <td>{ROLE_LABEL[u.role] ?? u.role}</td>
                  <td className="muted small">{formatWhen(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dash-section">
        <h2>Últimos agendamentos</h2>
        <div className="table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Profissional</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentBookings.map((b) => (
                <tr key={b.id}>
                  <td className="small">{formatWhen(b.scheduledAt)}</td>
                  <td>{b.client?.name ?? "—"}</td>
                  <td>{b.diarist?.name ?? "—"}</td>
                  <td>
                    <span className={`status-pill status-${b.status.toLowerCase()}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <LgpdAccountSection />
    </div>
  );
}
