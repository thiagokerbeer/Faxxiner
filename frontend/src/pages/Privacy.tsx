import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api";

type LgpdSummary = {
  document: string;
  version: string;
  updatedAt: string;
  controller: { product: string; contactEmail: string | null };
  dpo: { email: string | null; note?: string };
  purposes: Array<{
    purpose: string;
    dataCategories: string[];
    legalBasis: string;
  }>;
  rights: string[];
  retention: { principle: string; accounts: string };
  securityMeasures: string[];
};

export function Privacy() {
  const [data, setData] = useState<LgpdSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<LgpdSummary>("/api/legal/lgpd")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar"));
  }, []);

  if (error) {
    return (
      <div className="container section privacy-page">
        <p className="form-error">{error}</p>
        <Link to="/">Voltar ao início</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container section privacy-page">
        <p className="muted">Carregando informações…</p>
      </div>
    );
  }

  return (
    <div className="container section privacy-page">
      <h1>Privacidade e proteção de dados (LGPD)</h1>
      <p className="muted small">
        Resumo para titulares — versão {data.version}, atualizado em {data.updatedAt}. Este texto é informativo;
        ajuste os contatos no ambiente de produção (variáveis{" "}
        <code>LGPD_CONTROLLER_EMAIL</code> / <code>LGPD_DPO_EMAIL</code>).
      </p>

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h2>Controlador</h2>
        <p>
          <strong>{data.controller.product}</strong>
          {data.controller.contactEmail && (
            <>
              <br />
              Contato:{" "}
              <a href={`mailto:${data.controller.contactEmail}`}>{data.controller.contactEmail}</a>
            </>
          )}
        </p>
        <h3>Encarregado (DPO)</h3>
        <p>
          {data.dpo.email ? (
            <a href={`mailto:${data.dpo.email}`}>{data.dpo.email}</a>
          ) : (
            <span className="muted">Não configurado neste ambiente.</span>
          )}
          {data.dpo.note && (
            <>
              <br />
              <span className="muted small">{data.dpo.note}</span>
            </>
          )}
        </p>
      </section>

      <h2>Finalidades do tratamento</h2>
      {data.purposes.map((p, i) => (
        <div key={i} className="privacy-purpose">
          <p>
            <strong>{p.purpose}</strong>
          </p>
          <p className="muted small">Categorias: {p.dataCategories.join(", ")}</p>
          <p className="small">{p.legalBasis}</p>
        </div>
      ))}

      <h2>Seus direitos</h2>
      <ul className="privacy-rights">
        {data.rights.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
      <p className="muted small">
        No app, usuários logados podem <strong>baixar uma cópia dos dados</strong> e{" "}
        <strong>solicitar o encerramento da conta</strong> nos painéis (área “Seus dados”).
      </p>

      <h2>Retenção</h2>
      <p>{data.retention.principle}</p>
      <p className="muted small">{data.retention.accounts}</p>

      <h2>Medidas de segurança</h2>
      <ul className="privacy-rights">
        {data.securityMeasures.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      <p className="muted small" style={{ marginTop: "2rem" }}>
        <Link to="/">← Voltar ao início</Link>
        {" · "}
        <Link to="/cadastro">Criar conta</Link>
      </p>
    </div>
  );
}
