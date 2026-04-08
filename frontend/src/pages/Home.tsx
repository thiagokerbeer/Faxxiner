import { useState } from "react";
import { Link } from "react-router-dom";

function HeroIllustration() {
  return (
    <div className="land-illus" aria-hidden>
      <svg viewBox="0 0 440 280" className="land-illus-svg" role="img">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff0f7" />
            <stop offset="100%" stopColor="#fce7f3" />
          </linearGradient>
        </defs>
        <rect width="440" height="280" rx="24" fill="url(#g1)" />
        <circle cx="120" cy="140" r="36" fill="#fff" stroke="#db2777" strokeWidth="2" />
        <circle cx="280" cy="130" r="40" fill="#fff" stroke="#f472b6" strokeWidth="2" />
        <path
          d="M156 140 Q200 100 244 130"
          fill="none"
          stroke="#9d6b85"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect x="88" y="188" width="64" height="8" rx="4" fill="#fbcfe8" />
        <rect x="248" y="182" width="72" height="8" rx="4" fill="#fbcfe8" />
        <text x="220" y="48" textAnchor="middle" fill="#be185d" fontSize="14" fontWeight="700" fontFamily="system-ui">
          conexão
        </text>
      </svg>
    </div>
  );
}

export function Home() {
  const [diaristaActionsOpen, setDiaristaActionsOpen] = useState(false);

  return (
    <div className="land-home">
      <section className="land-hero">
        <div className="container land-hero-inner">
          <div className="land-hero-text">
            <h1 className="land-title">Diaristas e clientes se encontram aqui</h1>
            <p className="land-subtitle">
              No Faxxiner, quem busca diarista ou faxineira e quem oferece o trabalho se conectam de forma
              simples — perfis, valores e agendamentos em um só lugar.
            </p>
          </div>
          <HeroIllustration />
        </div>
      </section>

      <section className="land-split-section">
        <div className="container">
          <div className="land-split">
            <article className="land-path-card land-path-client">
              <span className="land-path-icon" aria-hidden>
                🏠
              </span>
              <h2>Procura diarista ou faxineira?</h2>
              <p>
                Busque profissionais por cidade e orçamento, veja experiência e serviços, e envie seu pedido com
                data e endereço.
              </p>
              <Link to="/profissionais" className="btn btn-cta-client btn-lg btn-block">
                Busco diarista
              </Link>
            </article>
            <article className="land-path-card land-path-worker">
              <span className="land-path-icon" aria-hidden>
                ✨
              </span>
              <h2>É diarista ou faxineira?</h2>
              <p>
                Cadastre seu perfil, informe bairros e valor por hora, e receba solicitações de famílias da sua
                região.
              </p>
              <div
                className="land-path-disclosure"
                onBlurCapture={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDiaristaActionsOpen(false);
                }}
              >
                <button
                  type="button"
                  id="land-diarista-trigger"
                  className="btn btn-cta-pro btn-lg btn-block"
                  aria-expanded={diaristaActionsOpen}
                  aria-controls="land-diarista-actions"
                  onClick={() => setDiaristaActionsOpen((o) => !o)}
                >
                  Sou diarista
                </button>
                <div
                  id="land-diarista-actions"
                  className="land-path-disclosure-panel"
                  role="region"
                  aria-labelledby="land-diarista-trigger"
                  hidden={!diaristaActionsOpen}
                >
                  <Link
                    to="/cadastro?role=DIARISTA"
                    className="btn btn-outline-brand btn-lg btn-block"
                    onClick={() => setDiaristaActionsOpen(false)}
                  >
                    Cadastrar
                  </Link>
                  <Link to="/entrar" className="btn btn-ghost btn-lg btn-block" onClick={() => setDiaristaActionsOpen(false)}>
                    Entrar
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section land-strip">
        <div className="container land-strip-inner">
          <p>
            <strong>Portfólio de demonstração</strong> — use o login rápido na página Entrar para testar como
            cliente ou como profissional.
          </p>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container land-faq">
          <h2 className="land-faq-title">Perguntas frequentes</h2>
          <dl className="faq-list">
            <div className="faq-item">
              <dt>É gratuito usar o Faxxiner?</dt>
              <dd>
                Este projeto é uma demonstração técnica. Em um produto real, políticas de preço e taxas seriam
                definidas pelo negócio.
              </dd>
            </div>
            <div className="faq-item">
              <dt>Como faço para contratar alguém?</dt>
              <dd>
                Crie uma conta como cliente, explore a lista de profissionais, abra um perfil e envie uma
                solicitação com data e observações.
              </dd>
            </div>
            <div className="faq-item">
              <dt>Sou diarista: como apareço na busca?</dt>
              <dd>
                Cadastre-se como profissional, preencha &quot;Meu perfil&quot; com bio, cidade, bairros e valor,
                e mantenha o perfil ativo.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
