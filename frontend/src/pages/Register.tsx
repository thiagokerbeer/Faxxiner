import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/FormField";
import type { Role } from "@/types";

export function Register() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("CLIENT");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [acceptLgpd, setAcceptLgpd] = useState(false);

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "DIARISTA" || r === "CLIENT") setRole(r);
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "DIARISTA" ? "/perfil" : "/profissionais", { replace: true });
    }
  }, [loading, user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim() || undefined,
        role,
        acceptLgpdTerms: acceptLgpd,
      });
      navigate(role === "DIARISTA" ? "/perfil" : "/profissionais", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="container narrow auth-page">
      <h1>Criar conta</h1>
      <p className="muted auth-lead">
        Em poucos passos você começa a buscar profissionais ou a receber pedidos. Já tem conta?{" "}
        <Link to="/entrar">Entrar</Link>
      </p>
      <form className="card form-card" onSubmit={onSubmit} noValidate>
        {error && (
          <p className="form-alert form-alert-error" role="alert">
            {error}
          </p>
        )}
        <fieldset className="role-fieldset">
          <legend>Como você vai usar o Faxxiner?</legend>
          <div className="role-picker-grid" role="presentation">
            <label className={`role-card ${role === "CLIENT" ? "is-selected" : ""}`}>
              <input
                type="radio"
                name="role"
                checked={role === "CLIENT"}
                onChange={() => setRole("CLIENT")}
              />
              <span className="role-card-body">
                <span className="role-card-title">Sou cliente</span>
                <span className="role-card-desc">Quero contratar diarista ou faxineira para casa ou trabalho.</span>
              </span>
            </label>
            <label className={`role-card ${role === "DIARISTA" ? "is-selected" : ""}`}>
              <input
                type="radio"
                name="role"
                checked={role === "DIARISTA"}
                onChange={() => setRole("DIARISTA")}
              />
              <span className="role-card-body">
                <span className="role-card-title">Sou profissional</span>
                <span className="role-card-desc">Ofereço serviço de limpeza e quero aparecer na busca.</span>
              </span>
            </label>
          </div>
        </fieldset>
        <FormField
          id="reg-name"
          label="Nome completo"
          hint="Como você quer ser chamado(a) nos agendamentos."
        >
          <input
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            placeholder="Maria Silva"
          />
        </FormField>
        <FormField id="reg-email" label="E-mail" hint="Enviaremos confirmações neste endereço.">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="nome@email.com"
          />
        </FormField>
        <FormField
          id="reg-phone"
          label="Telefone"
          optional
          hint="Ajuda o profissional ou o cliente a falar com você com mais rapidez."
        >
          <input
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-0000"
          />
        </FormField>
        <FormField
          id="reg-password"
          label="Senha"
          hint="Mínimo de 8 caracteres. Use letras e números para ficar mais seguro."
        >
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Crie uma senha"
          />
        </FormField>
        <label className="checkbox-lgpd">
          <input
            type="checkbox"
            checked={acceptLgpd}
            onChange={(e) => setAcceptLgpd(e.target.checked)}
            required
          />
          <span>
            Li e aceito o tratamento dos meus dados pessoais conforme a{" "}
            <Link to="/privacidade" target="_blank" rel="noopener noreferrer">
              informação de privacidade (LGPD)
            </Link>
            .
          </span>
        </label>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={pending}>
          {pending ? "Criando conta…" : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
