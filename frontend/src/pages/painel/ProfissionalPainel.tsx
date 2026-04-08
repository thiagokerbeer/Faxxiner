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

type Profile = { bio: string; city: string; isActive: boolean } | null;

export function ProfissionalPainel() {
  const { user } = useAuth();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api<BookingRow[]>("/api/bookings"),
      api<Profile>("/api/diaristas/me/profile").catch(() => null),
    ])
      .then(([bookings, prof]) => {
        setRows(bookings);
        setProfile(prof);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pendentes = rows.filter((b) => b.status === "PENDING").length;
  const recent = rows.slice(0, 4);
  const profileOk =
    profile !== null && profile.bio.trim().length > 10 && Boolean(profile.city?.trim());

  return (
    <div className="container section dash-page">
      <header className="dash-header">
        <h1>Olá, {user?.name?.split(" ")[0] ?? "profissional"}</h1>
        <p className="muted">Responda pedidos e mantenha seu perfil atualizado para novas famílias te encontrarem.</p>
      </header>

      {!loading && !profileOk && (
        <div className="card dash-alert">
          <p>
            <strong>Complete seu perfil</strong> para aparecer na busca e receber contatos.
          </p>
          <Link to="/perfil" className="btn btn-cta-pro btn-sm">
            Ir para meu perfil
          </Link>
        </div>
      )}

      <div className="dash-stats">
        <div className="dash-stat-card dash-stat-highlight">
          <span className="dash-stat-value">{pendentes}</span>
          <span className="dash-stat-label">Novos pedidos</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{rows.filter((b) => b.status === "ACCEPTED").length}</span>
          <span className="dash-stat-label">Aceitos</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{profile?.isActive === false ? "Pausado" : "Ativo"}</span>
          <span className="dash-stat-label">Visibilidade</span>
        </div>
      </div>

      <div className="dash-actions-row">
        <Link to="/agendamentos" className="btn btn-primary btn-lg">
          Ver e responder pedidos
        </Link>
        <Link to="/perfil" className="btn btn-secondary btn-lg">
          Editar perfil
        </Link>
      </div>

      <section className="dash-section">
        <div className="dash-section-head">
          <h2>Últimas solicitações</h2>
          <Link to="/agendamentos" className="dash-link-all">
            Ver tudo
          </Link>
        </div>
        {loading && <p className="muted">Carregando…</p>}
        {!loading && recent.length === 0 && (
          <p className="muted dash-empty">Quando alguém solicitar seu serviço, aparece aqui.</p>
        )}
        {!loading && recent.length > 0 && (
          <ul className="dash-mini-list">
            {recent.map((b) => (
              <li key={b.id} className="dash-mini-row">
                <div>
                  <strong>{b.client?.name ?? "Cliente"}</strong>
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
