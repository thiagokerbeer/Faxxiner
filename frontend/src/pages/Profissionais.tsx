import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api";
import { FormField } from "@/components/FormField";
import type { DiaristProfilePublic } from "@/types";

function formatHourly(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function Profissionais() {
  const [city, setCity] = useState("");
  const [maxHourly, setMaxHourly] = useState("");
  const [list, setList] = useState<DiaristProfilePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams();
    if (city.trim()) q.set("city", city.trim());
    if (maxHourly.trim()) {
      const n = parseInt(maxHourly, 10);
      if (Number.isFinite(n) && n > 0) q.set("maxHourly", String(n));
    }
    const path = `/api/diaristas${q.toString() ? `?${q}` : ""}`;
    setLoading(true);
    setError(null);
    api<DiaristProfilePublic[]>(path)
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, [city, maxHourly]);

  return (
    <div className="container section">
      <header className="page-header">
        <h1>Profissionais disponíveis</h1>
        <p className="muted">
          Diaristas e profissionais de trabalho doméstico com perfil ativo. Ajuste cidade e teto de valor por hora.
        </p>
      </header>

      <div className="filters card">
        <h2 className="filters-heading">Filtrar resultados</h2>
        <div className="fields-bar">
          <FormField
            id="filtro-cidade"
            label="Cidade"
            hint="Deixe em branco para ver todas as cidades cadastradas."
          >
            <input
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex.: São Paulo"
            />
          </FormField>
          <FormField
            id="filtro-preco"
            label="Preço máximo por hora"
            hint="Valor inteiro em reais (sem centavos). Ex.: 60 = até R$ 60/h."
          >
            <input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={maxHourly}
              onChange={(e) => setMaxHourly(e.target.value)}
              placeholder="Ex.: 60"
            />
          </FormField>
        </div>
      </div>

      {loading && <p className="muted">Carregando…</p>}
      {error && (
        <p className="form-alert form-alert-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && list.length === 0 && (
        <p className="muted">Nenhum perfil encontrado com esses filtros.</p>
      )}

      <ul className="pro-grid">
        {list.map((p) => (
          <li key={p.id}>
            <article className="card pro-card">
              <div className="pro-card-head">
                <div className="avatar" aria-hidden>
                  {p.user.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="pro-name">{p.user.name}</h2>
                  <p className="muted small">{p.city}</p>
                </div>
                <span className="price-tag">{formatHourly(p.hourlyRateCents)}/h</span>
              </div>
              <p className="pro-bio">{p.bio}</p>
              <p className="small">
                <strong>Bairros:</strong> {p.neighborhoods}
              </p>
              <p className="small">
                <strong>Serviços:</strong> {p.servicesOffered}
              </p>
              <Link to={`/profissionais/${p.id}`} className="btn btn-secondary btn-block">
                Ver perfil e solicitar
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
