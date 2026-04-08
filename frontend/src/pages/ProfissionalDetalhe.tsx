import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/FormField";
import type { DiaristProfilePublic } from "@/types";

function formatHourly(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function minDatetimeLocalValue(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function ProfissionalDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<DiaristProfilePublic | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoadError(null);
    api<DiaristProfilePublic>(`/api/diaristas/${id}`)
      .then(setProfile)
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Erro"));
  }, [id]);

  async function onBook(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSubmitError(null);
    setSubmitOk(false);
    if (user?.role !== "CLIENT") {
      navigate("/entrar", { state: { from: `/profissionais/${id}` } });
      return;
    }
    setPending(true);
    try {
      await api("/api/bookings", {
        method: "POST",
        json: {
          diaristUserId: profile.user.id,
          scheduledAt: new Date(scheduledAt).toISOString(),
          notes: notes.trim() || undefined,
          address: address.trim() || undefined,
        },
      });
      setSubmitOk(true);
      setScheduledAt("");
      setNotes("");
      setAddress("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao agendar");
    } finally {
      setPending(false);
    }
  }

  if (loadError) {
    return (
      <div className="container narrow section">
        <p className="form-error">{loadError}</p>
        <Link to="/profissionais">Voltar à lista</Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container section">
        <p className="muted">Carregando perfil…</p>
      </div>
    );
  }

  return (
    <div className="container section detail-layout">
      <Link to="/profissionais" className="back-link">
        ← Voltar
      </Link>
      <article className="card detail-card">
        <div className="detail-head">
          <div className="avatar large" aria-hidden>
            {profile.user.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1>{profile.user.name}</h1>
            <p className="muted">{profile.city}</p>
            <p className="price-lg">{formatHourly(profile.hourlyRateCents)} por hora</p>
            {profile.user.phone && (
              <p className="small">
                <strong>Telefone:</strong> {profile.user.phone}
              </p>
            )}
          </div>
        </div>
        <p className="detail-bio">{profile.bio}</p>
        <p>
          <strong>Bairros atendidos:</strong> {profile.neighborhoods}
        </p>
        <p>
          <strong>Serviços:</strong> {profile.servicesOffered}
        </p>
      </article>

      <aside className="card book-card">
        <h2>Solicitar serviço</h2>
        {!authLoading && !user && (
          <p className="muted">
            <Link to="/entrar" state={{ from: `/profissionais/${id}` }}>
              Entre
            </Link>{" "}
            como cliente para enviar um pedido.
          </p>
        )}
        {(user?.role === "DIARISTA" || user?.role === "ADMIN") && (
          <p className="muted">
            {user?.role === "ADMIN"
              ? "Gestor do site: use a conta demo de cliente para testar solicitações."
              : "Contas de profissional não criam pedidos aqui — use uma conta de cliente (demo)."}
          </p>
        )}
        {user?.role === "CLIENT" && (
          <form onSubmit={onBook} className="book-form" noValidate>
            {submitOk && (
              <p className="form-alert form-alert-success" role="status">
                Pedido enviado. Acompanhe a resposta em <Link to="/agendamentos">Agendamentos</Link>.
              </p>
            )}
            {submitError && (
              <p className="form-alert form-alert-error" role="alert">
                {submitError}
              </p>
            )}
            <FormField
              id="book-when"
              label="Data e hora do serviço"
              hint="Escolha um horário em que você estiver no local ou disponível para receber a profissional."
            >
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={minDatetimeLocalValue()}
                required
              />
            </FormField>
            <FormField
              id="book-address"
              label="Endereço do serviço"
              optional
              hint="Rua, número, complemento e referência ajudam a evitar atrasos."
            >
              <input
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, bairro"
              />
            </FormField>
            <FormField
              id="book-notes"
              label="Observações"
              optional
              hint="Tamanho do imóvel, materiais disponíveis ou preferências."
            >
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Ex.: apartamento 2 quartos, tem vassoura e balde."
              />
            </FormField>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={pending}>
              {pending ? "Enviando…" : "Enviar solicitação"}
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}
