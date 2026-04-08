import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/FormField";

const DEMO_PASSWORD = "demo123456";

const DEMO_ACCOUNTS = [
  { id: "user" as const, label: "Cliente", email: "cliente@demo.com" },
  { id: "admin" as const, label: "Gestor do site", email: "admin@demo.com" },
];

export function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [loading, user, from, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setPending(false);
    }
  }

  async function loginDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setError(null);
    setPending(true);
    try {
      await login(account.email, DEMO_PASSWORD);
      navigate(from, { replace: true });
    } catch (err) {
      setEmail(account.email);
      setPassword(DEMO_PASSWORD);
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="container narrow auth-page auth-page-login">
      <h1>Entrar</h1>
      <p className="muted auth-lead auth-sub">
        Acesse sua conta para agendar ou responder pedidos. Novo por aqui?{" "}
        <Link to="/cadastro">Criar conta</Link>
      </p>

      <div className="card login-card-unified">
        <form className="form-card login-form-main" onSubmit={onSubmit} noValidate>
          {error && (
            <p className="form-alert form-alert-error" role="alert">
              {error}
            </p>
          )}
          <FormField id="login-email" label="E-mail" hint="Use o e-mail cadastrado na plataforma.">
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
            id="login-password"
            label="Senha"
            hint="Use a mesma senha do cadastro (mínimo 8 caracteres para contas criadas aqui)."
          >
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </FormField>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={pending}>
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="demo-login-compact">
          <p className="demo-login-label">Demonstração</p>
          <p className="demo-login-pass">
            Senha: <code>{DEMO_PASSWORD}</code>
          </p>
          <div className="demo-login-actions">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                type="button"
                className="demo-login-btn"
                disabled={pending}
                onClick={() => void loginDemo(acc)}
              >
                <span className="demo-login-btn-title">{acc.label}</span>
                <span className="demo-login-btn-mail">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
