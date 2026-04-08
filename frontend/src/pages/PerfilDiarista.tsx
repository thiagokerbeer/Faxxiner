import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/FormField";

type Profile = {
  id: string;
  userId: string;
  bio: string;
  city: string;
  neighborhoods: string;
  hourlyRateCents: number;
  servicesOffered: string;
  photoUrl: string | null;
  isActive: boolean;
};

export function PerfilDiarista() {
  const { user, loading: authLoading } = useAuth();
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [neighborhoods, setNeighborhoods] = useState("");
  const [hourlyReais, setHourlyReais] = useState("");
  const [servicesOffered, setServicesOffered] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "DIARISTA") return;
    api<Profile | null>("/api/diaristas/me/profile")
      .then((p) => {
        if (p) {
          setBio(p.bio);
          setCity(p.city);
          setNeighborhoods(p.neighborhoods);
          setHourlyReais(String(p.hourlyRateCents / 100));
          setServicesOffered(p.servicesOffered);
          setPhotoUrl(p.photoUrl ?? "");
          setIsActive(p.isActive);
        }
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Erro ao carregar"));
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const reais = parseFloat(hourlyReais.replace(",", "."));
    if (!Number.isFinite(reais) || reais <= 0) {
      setError("Informe um valor por hora válido (ex.: 45 ou 45,50).");
      return;
    }
    const hourlyRateCents = Math.round(reais * 100);
    setPending(true);
    try {
      await api<Profile>("/api/diaristas/me/profile", {
        method: "PUT",
        json: {
          bio: bio.trim(),
          city: city.trim(),
          neighborhoods: neighborhoods.trim(),
          hourlyRateCents,
          servicesOffered: servicesOffered.trim(),
          photoUrl: photoUrl.trim() || null,
          isActive,
        },
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setPending(false);
    }
  }

  if (authLoading) {
    return (
      <div className="container section">
        <p className="muted">Carregando…</p>
      </div>
    );
  }

  if (!user || user.role !== "DIARISTA") {
    return (
      <div className="container narrow section">
        <h1>Perfil da profissional</h1>
        <p className="muted">
          Esta área é só para contas de profissional.{" "}
          <Link to="/cadastro">Cadastre-se como profissional</Link> ou{" "}
          <Link to="/profissionais">veja a lista</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="container narrow section">
      <h1>Seu perfil público</h1>
      <p className="muted auth-lead">
        Clientes veem bio, região, serviços e valor por hora na busca. O valor em reais é guardado com precisão
        (centavos) no sistema.
      </p>
      {loadError && (
        <p className="form-alert form-alert-error" role="alert">
          {loadError}
        </p>
      )}
      <form className="card form-card stack" onSubmit={onSubmit} noValidate>
        {success && (
          <p className="form-alert form-alert-success" role="status">
            Alterações salvas. Sua página na lista já reflete o que você editou.
          </p>
        )}
        {error && (
          <p className="form-alert form-alert-error" role="alert">
            {error}
          </p>
        )}
        <FormField
          id="perfil-bio"
          label="Apresentação"
          hint="Conte sua experiência, tempo de atuação e o que diferencia seu trabalho."
        >
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} required rows={4} placeholder="Ex.: 8 anos em limpeza residencial..." />
        </FormField>
        <div className="fields-two-col">
          <FormField id="perfil-city" label="Cidade" hint="Onde você costuma atender.">
            <input
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              placeholder="São Paulo"
            />
          </FormField>
          <FormField
            id="perfil-bairros"
            label="Bairros atendidos"
            hint="Separe por vírgula. Ajuda quem busca na região."
          >
            <input
              value={neighborhoods}
              onChange={(e) => setNeighborhoods(e.target.value)}
              required
              placeholder="Pinheiros, Vila Madalena…"
            />
          </FormField>
        </div>
        <FormField
          id="perfil-valor"
          label="Valor por hora"
          hint="Digite em reais, usando vírgula ou ponto para centavos (ex.: 45 ou 45,50)."
        >
          <input
            type="text"
            inputMode="decimal"
            value={hourlyReais}
            onChange={(e) => setHourlyReais(e.target.value)}
            required
            placeholder="45,00"
          />
        </FormField>
        <FormField
          id="perfil-servicos"
          label="Serviços oferecidos"
          hint="Liste o que você faz: pós-obra, passar roupa, organização, etc."
        >
          <textarea
            value={servicesOffered}
            onChange={(e) => setServicesOffered(e.target.value)}
            required
            rows={3}
            placeholder="Limpeza geral, pós-reforma, vidros…"
          />
        </FormField>
        <FormField
          id="perfil-foto"
          label="Foto de perfil"
          optional
          hint="Cole o link de uma imagem (URL). Em um produto real, faríamos upload aqui."
        >
          <input
            type="url"
            autoComplete="off"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
          />
        </FormField>
        <label className="field-switch">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span>
            <strong>Perfil visível na busca</strong>
            <br />
            <span className="muted small field-switch-sub">
              Desmarque se quiser pausar novos contatos sem apagar seus dados.
            </span>
          </span>
        </label>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={pending}>
          {pending ? "Salvando…" : "Salvar perfil"}
        </button>
      </form>
    </div>
  );
}
