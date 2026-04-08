import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import type { BookingRow, BookingStatus } from "@/types";

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceito",
  REJECTED: "Recusado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function Agendamentos() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api<BookingRow[]>("/api/bookings")
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro"))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: BookingStatus) {
    try {
      const updated = await api<BookingRow>(`/api/bookings/${id}/status`, {
        method: "PATCH",
        json: { status },
      });
      setRows((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atualizar");
    }
  }

  if (authLoading) {
    return (
      <div className="container section">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container narrow section">
        <h1>Agendamentos</h1>
        <p className="muted">
          <Link to="/entrar">Entre</Link> para ver seus pedidos.
        </p>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="container section">
      <h1>Agendamentos</h1>
      <p className="muted">
        {isAdmin
          ? "Todos os agendamentos da plataforma (visão do administrador)."
          : user.role === "CLIENT"
            ? "Pedidos que você fez a profissionais."
            : "Solicitações recebidas das famílias."}
      </p>
      {isAdmin && (
        <p className="dash-readonly-note">
          Como admin, você só visualiza aqui — alterações de status são feitas pelos clientes e profissionais.
        </p>
      )}

      {loading && <p className="muted">Carregando…</p>}
      {error && (
        <p className="form-alert form-alert-error" role="alert">
          {error}
        </p>
      )}

      {!loading && rows.length === 0 && <p className="muted">Nenhum agendamento ainda.</p>}

      <ul className="booking-list">
        {rows.map((b) => {
          const other = user.role === "CLIENT" ? b.diarist : b.client;
          return (
            <li key={b.id} className="card booking-card">
              <div className="booking-top">
                <span className={`status-pill status-${b.status.toLowerCase()}`}>
                  {STATUS_LABEL[b.status]}
                </span>
                <time dateTime={b.scheduledAt}>{formatWhen(b.scheduledAt)}</time>
              </div>
              {isAdmin ? (
                <>
                  <p className="booking-with small">
                    <strong>Cliente:</strong> {b.client?.name ?? "—"}
                    {b.client?.phone && <span className="muted"> · {b.client.phone}</span>}
                    {b.client?.email && <span className="muted"> · {b.client.email}</span>}
                  </p>
                  <p className="booking-with small">
                    <strong>Profissional:</strong> {b.diarist?.name ?? "—"}
                    {b.diarist?.phone && <span className="muted"> · {b.diarist.phone}</span>}
                    {b.diarist?.email && <span className="muted"> · {b.diarist.email}</span>}
                  </p>
                </>
              ) : (
                <p className="booking-with">
                  <strong>{user.role === "CLIENT" ? "Profissional" : "Cliente"}:</strong>{" "}
                  {other?.name ?? "—"}
                  {other?.phone && <span className="muted"> · {other.phone}</span>}
                </p>
              )}
              {b.address && (
                <p className="small">
                  <strong>Endereço:</strong> {b.address}
                </p>
              )}
              {b.notes && (
                <p className="small">
                  <strong>Obs.:</strong> {b.notes}
                </p>
              )}
              {!isAdmin && (
                <div className="booking-actions">
                  {user.role === "CLIENT" && b.status === "PENDING" && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => void setStatus(b.id, "CANCELLED")}
                    >
                      Cancelar
                    </button>
                  )}
                  {user.role === "CLIENT" && b.status === "ACCEPTED" && (
                    <>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => void setStatus(b.id, "CANCELLED")}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => void setStatus(b.id, "COMPLETED")}
                      >
                        Marcar concluído
                      </button>
                    </>
                  )}
                  {user.role === "DIARISTA" && b.status === "PENDING" && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => void setStatus(b.id, "ACCEPTED")}
                      >
                        Aceitar
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => void setStatus(b.id, "REJECTED")}
                      >
                        Recusar
                      </button>
                    </>
                  )}
                  {user.role === "DIARISTA" && b.status === "ACCEPTED" && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => void setStatus(b.id, "COMPLETED")}
                    >
                      Marcar concluído
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
