import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { api, resolveApiPath } from "@/api";
import { useAuth } from "@/context/AuthContext";

/**
 * Portabilidade e exclusão de conta (LGPD) — disponível para qualquer papel logado.
 */
export function LgpdAccountSection() {
  const { logout, accessToken } = useAuth();
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onExport() {
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch(resolveApiPath("/api/me/data-export"), {
        credentials: "include",
        headers: { Authorization: accessToken ? `Bearer ${accessToken}` : "" },
      });
      if (!res.ok) {
        const text = await res.text();
        let err = `Erro ${res.status}`;
        try {
          const j = JSON.parse(text) as { error?: string };
          if (j.error) err = j.error;
        } catch {
          /* ignore */
        }
        setMsg(err);
        return;
      }
      const blob = await res.blob();
      const dl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dl;
      a.download = "faxxiner-meus-dados.json";
      a.click();
      URL.revokeObjectURL(dl);
    } catch {
      setMsg("Não foi possível baixar o arquivo.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!pwd.trim()) {
      setMsg("Informe sua senha para confirmar.");
      return;
    }
    setBusy(true);
    try {
      await api("/api/me/account", { method: "DELETE", json: { password: pwd } });
      await logout();
      window.location.href = "/";
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao encerrar conta");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card dash-section lgpd-card">
      <h2>Seus dados (LGPD)</h2>
      <p className="muted small">
        Você pode baixar uma cópia dos dados que tratamos ou solicitar o encerramento da conta (com anonimização).
        Saiba mais na{" "}
        <Link to="/privacidade">página de privacidade</Link>.
      </p>
      <div className="lgpd-actions">
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void onExport()}>
          Baixar meus dados (JSON)
        </button>
      </div>
      <form className="lgpd-delete-form" onSubmit={(ev) => void onDelete(ev)}>
        <p className="small">
          <strong>Encerrar conta:</strong> seus dados de identificação serão anonimizados; agendamentos podem
          permanecer vinculados de forma pseudonimizada quando necessário às outras partes.
        </p>
        <label className="lgpd-delete-label">
          Confirme com sua senha
          <input
            type="password"
            autoComplete="current-password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Senha atual"
          />
        </label>
        <button type="submit" className="btn btn-danger-outline btn-block" disabled={busy}>
          {busy ? "Processando…" : "Encerrar minha conta"}
        </button>
      </form>
      {msg && <p className="form-error lgpd-msg">{msg}</p>}
    </section>
  );
}
