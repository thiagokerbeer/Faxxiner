import { useState } from "react";
import { Link } from "react-router-dom";

function HeroIllustration() {
  return (
    <div className="land-illus" aria-hidden>
      <svg viewBox="0 0 440 300" className="land-illus-svg" role="img" aria-label="Ilustração do app Faxxiner">
        <defs>
          <linearGradient id="hero-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff5fa" />
            <stop offset="100%" stopColor="#fce7f3" />
          </linearGradient>
          <linearGradient id="hero-card" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fff9fc" />
          </linearGradient>
          <filter id="card-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#db2777" floodOpacity="0.1" />
          </filter>
        </defs>

        <rect width="440" height="300" rx="20" fill="url(#hero-bg)" />

        {/* Profile card */}
        <rect x="24" y="32" width="190" height="150" rx="14" fill="url(#hero-card)" stroke="#f5d0e6" strokeWidth="1" filter="url(#card-shadow)" />
        {/* Avatar circle */}
        <circle cx="64" cy="72" r="22" fill="#fce7f3" stroke="#db2777" strokeWidth="1.5" />
        <text x="64" y="78" textAnchor="middle" fill="#db2777" fontSize="16" fontWeight="700" fontFamily="system-ui">M</text>
        {/* Name & city */}
        <rect x="96" y="58" width="96" height="10" rx="5" fill="#3d1f35" opacity="0.85" />
        <rect x="96" y="74" width="68" height="7" rx="3.5" fill="#9d6b85" opacity="0.6" />
        {/* Price tag */}
        <rect x="142" y="44" width="62" height="22" rx="10" fill="#fce7f3" />
        <text x="173" y="59" textAnchor="middle" fill="#db2777" fontSize="11" fontWeight="700" fontFamily="system-ui">R$55/h</text>
        {/* Divider */}
        <line x1="40" y1="108" x2="198" y2="108" stroke="#f5d0e6" strokeWidth="1" />
        {/* Services chips */}
        <rect x="40" y="118" width="64" height="18" rx="9" fill="#fce7f3" />
        <text x="72" y="131" textAnchor="middle" fill="#be185d" fontSize="9" fontFamily="system-ui">Residencial</text>
        <rect x="112" y="118" width="52" height="18" rx="9" fill="#fce7f3" />
        <text x="138" y="131" textAnchor="middle" fill="#be185d" fontSize="9" fontFamily="system-ui">Pós-obra</text>
        {/* CTA button */}
        <rect x="40" y="150" width="158" height="22" rx="10" fill="#db2777" />
        <text x="119" y="165" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="system-ui">Ver perfil e solicitar</text>

        {/* Connection arrow */}
        <path d="M222 130 Q240 110 258 120" fill="none" stroke="#db2777" strokeWidth="2" strokeDasharray="5,4" strokeLinecap="round" opacity="0.6" />
        <circle cx="259" cy="120" r="3.5" fill="#db2777" opacity="0.7" />

        {/* Booking request card */}
        <rect x="230" y="32" width="186" height="148" rx="14" fill="url(#hero-card)" stroke="#f5d0e6" strokeWidth="1" filter="url(#card-shadow)" />
        <text x="323" y="56" textAnchor="middle" fill="#3d1f35" fontSize="11" fontWeight="700" fontFamily="system-ui">Solicitar serviço</text>
        <line x1="246" y1="63" x2="400" y2="63" stroke="#f5d0e6" strokeWidth="1" />
        {/* Form rows */}
        <rect x="246" y="72" width="60" height="7" rx="3.5" fill="#9d6b85" opacity="0.55" />
        <rect x="246" y="84" width="154" height="18" rx="8" fill="#fff" stroke="#f5d0e6" strokeWidth="1" />
        <rect x="246" y="110" width="60" height="7" rx="3.5" fill="#9d6b85" opacity="0.55" />
        <rect x="246" y="122" width="154" height="18" rx="8" fill="#fff" stroke="#f5d0e6" strokeWidth="1" />
        {/* Status badge */}
        <rect x="246" y="150" width="72" height="18" rx="9" fill="#d1fae5" />
        <text x="282" y="163" textAnchor="middle" fill="#047857" fontSize="9" fontWeight="700" fontFamily="system-ui">Aceito ✓</text>

        {/* How it works steps at bottom */}
        <rect x="24" y="204" width="100" height="70" rx="12" fill="#fff" stroke="#f5d0e6" strokeWidth="1" opacity="0.9" />
        <circle cx="54" cy="226" r="12" fill="#fce7f3" />
        <text x="54" y="231" textAnchor="middle" fill="#db2777" fontSize="12" fontFamily="system-ui">🔍</text>
        <rect x="38" y="244" width="72" height="6" rx="3" fill="#3d1f35" opacity="0.6" />
        <rect x="45" y="256" width="58" height="5" rx="2.5" fill="#9d6b85" opacity="0.45" />
        <rect x="38" y="266" width="50" height="5" rx="2.5" fill="#9d6b85" opacity="0.35" />

        <rect x="170" y="204" width="100" height="70" rx="12" fill="#fff" stroke="#f5d0e6" strokeWidth="1" opacity="0.9" />
        <circle cx="200" cy="226" r="12" fill="#fce7f3" />
        <text x="200" y="231" textAnchor="middle" fill="#db2777" fontSize="12" fontFamily="system-ui">📅</text>
        <rect x="184" y="244" width="72" height="6" rx="3" fill="#3d1f35" opacity="0.6" />
        <rect x="191" y="256" width="58" height="5" rx="2.5" fill="#9d6b85" opacity="0.45" />
        <rect x="191" y="266" width="50" height="5" rx="2.5" fill="#9d6b85" opacity="0.35" />

        <rect x="316" y="204" width="100" height="70" rx="12" fill="#fff" stroke="#f5d0e6" strokeWidth="1" opacity="0.9" />
        <circle cx="346" cy="226" r="12" fill="#d1fae5" />
        <text x="346" y="231" textAnchor="middle" fill="#047857" fontSize="12" fontFamily="system-ui">✅</text>
        <rect x="330" y="244" width="72" height="6" rx="3" fill="#3d1f35" opacity="0.6" />
        <rect x="337" y="256" width="58" height="5" rx="2.5" fill="#9d6b85" opacity="0.45" />
        <rect x="337" y="266" width="50" height="5" rx="2.5" fill="#9d6b85" opacity="0.35" />

        {/* Step connectors */}
        <path d="M124 239 L170 239" fill="none" stroke="#f5d0e6" strokeWidth="1.5" strokeDasharray="4,3" />
        <path d="M270 239 L316 239" fill="none" stroke="#f5d0e6" strokeWidth="1.5" strokeDasharray="4,3" />
      </svg>
    </div>
  );
}

const TECH_ITEMS = [
  { label: "React 19", icon: "⚛️", detail: "SPA com React Router v7" },
  { label: "TypeScript", icon: "🔷", detail: "Frontend e backend tipados" },
  { label: "Node + Express", icon: "🟢", detail: "REST API com middlewares" },
  { label: "Prisma + PostgreSQL", icon: "🗄️", detail: "ORM com migrações versionadas" },
  { label: "JWT + Refresh", icon: "🔐", detail: "Tokens rotativos via cookie httpOnly" },
  { label: "LGPD", icon: "🛡️", detail: "Exportação de dados e exclusão de conta" },
];

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
            <div className="land-hero-badges" aria-label="Stack principal">
              <span className="land-badge">React</span>
              <span className="land-badge">TypeScript</span>
              <span className="land-badge">Node.js</span>
              <span className="land-badge">PostgreSQL</span>
            </div>
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

      <section className="section land-steps-section">
        <div className="container">
          <h2 className="land-section-title">Como funciona</h2>
          <ol className="land-steps" aria-label="Passos para usar o Faxxiner">
            <li className="land-step">
              <span className="land-step-num" aria-hidden>1</span>
              <div>
                <strong>Crie sua conta</strong>
                <p>Cadastro rápido como cliente ou profissional — com confirmação de aceite dos termos de dados (LGPD).</p>
              </div>
            </li>
            <li className="land-step">
              <span className="land-step-num" aria-hidden>2</span>
              <div>
                <strong>Encontre ou seja encontrado</strong>
                <p>Clientes filtram por cidade e teto de valor; profissionais preenchem perfil com bio, bairros e serviços.</p>
              </div>
            </li>
            <li className="land-step">
              <span className="land-step-num" aria-hidden>3</span>
              <div>
                <strong>Agende e acompanhe</strong>
                <p>Envie solicitação com data e endereço; a profissional aceita ou recusa; ambos acompanham pelo painel.</p>
              </div>
            </li>
          </ol>
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

      <section className="section land-tech-section" id="tech">
        <div className="container">
          <h2 className="land-section-title">Destaques técnicos</h2>
          <p className="land-section-sub">
            Projeto full stack construído com foco em boas práticas — segurança, tipagem, LGPD e deploy real.
          </p>
          <ul className="land-tech-grid" aria-label="Destaques técnicos do projeto">
            {TECH_ITEMS.map((item) => (
              <li key={item.label} className="land-tech-card">
                <span className="land-tech-icon" aria-hidden>{item.icon}</span>
                <div>
                  <strong className="land-tech-label">{item.label}</strong>
                  <span className="land-tech-detail">{item.detail}</span>
                </div>
              </li>
            ))}
          </ul>
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
            <div className="faq-item">
              <dt>Quais papéis de usuário existem?</dt>
              <dd>
                Três: <strong>cliente</strong> (solicita serviços), <strong>profissional</strong> (recebe e gerencia
                pedidos) e <strong>gestor</strong> (painel admin com visão geral). Use o login rápido para explorar cada um.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
