# Faxxiner

> Marketplace de diaristas — projeto de portfólio full stack.

[![CI](https://github.com/tekerwhy/faxxiner/actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/licença-portfólio-pink)

Plataforma que conecta **clientes que precisam de faxina** a **diaristas que oferecem o serviço** — com perfis públicos, agendamentos, painéis por papel e conformidade LGPD.

---

## Demo ao vivo

| Parte       | URL                                      |
|-------------|------------------------------------------|
| Frontend    | [faxxiner.vercel.app](https://faxxiner.vercel.app) |
| API         | [faxxiner-api.onrender.com](https://faxxiner-api.onrender.com) |

> A API fica no plano gratuito do Render — o primeiro acesso pode demorar ~15 s para acordar.

**Contas de demonstração** (senha: `demo123456`):

| Papel            | E-mail              |
|------------------|---------------------|
| Cliente          | `cliente@demo.com`  |
| Profissional     | `maria@demo.com`    |
| Gestor (admin)   | `admin@demo.com`    |

Use o **login rápido** na página `/entrar` para entrar com um clique em qualquer papel.

---

## Funcionalidades

### Usuário final
- **Cadastro por papel**: cliente ou profissional, com aceite explícito de termos de dados (LGPD)
- **Busca de diaristas**: filtros por cidade e teto de valor por hora, com debounce
- **Perfil público**: bio, bairros atendidos, serviços e valor/hora
- **Agendamentos**: cliente cria pedido com data, endereço e observações; profissional aceita ou recusa
- **Painel por papel**: cliente vê pedidos e stats; profissional gerencia agenda; admin tem visão geral

### Técnicas / infraestrutura
- **Autenticação JWT + Refresh Rotation**: access token de curta duração (Bearer) + refresh token em cookie `httpOnly`; rotação a cada uso, revogação no banco
- **RBAC**: middleware de papel (`CLIENT`, `DIARISTA`, `ADMIN`) em todas as rotas protegidas
- **Segurança**: Helmet, CORS por allowlist (`FRONTEND_ORIGIN`), rate limit granular por rota, `bcrypt` com custo configurável, corpo JSON limitado
- **Validação**: schemas Zod no backend; erros tipados com mensagens em português
- **LGPD**: endpoint de portabilidade (`GET /api/me/data-export`), exclusão/anonimização de conta (`DELETE /api/me/account`), transparência (`GET /api/legal/lgpd`)
- **Health check**: `GET /health` (liveness) e `GET /health?deep=1` (readiness + banco), com proteção de secret em produção
- **CI/CD**: GitHub Actions (build + testes Vitest + Supertest), Dependabot semanal
- **Deploy gratuito**: Render (API) + Vercel (SPA) + Neon (PostgreSQL)

---

## Stack

| Camada      | Tecnologia                                       |
|-------------|--------------------------------------------------|
| Frontend    | React 19, TypeScript, Vite 6, React Router 7     |
| Backend     | Node.js ≥ 20, Express 4, TypeScript, ES Modules  |
| Banco       | PostgreSQL 16 via Prisma 6 ORM                   |
| Auth        | JWT (jsonwebtoken) + bcryptjs + cookie httpOnly  |
| Validação   | Zod 4                                            |
| Segurança   | Helmet, cors, express-rate-limit                 |
| Testes      | Vitest + Supertest                               |
| Dev local   | Docker Compose (Postgres), tsx watch             |
| Deploy      | Render (API) · Vercel (SPA) · Neon (DB)          |

---

## Arquitetura

```
faxxiner/
├── backend/                  # API REST (Node + Express + Prisma)
│   ├── src/
│   │   ├── app.ts            # Factory da aplicação Express
│   │   ├── index.ts          # Bootstrap + graceful shutdown
│   │   ├── routes/           # auth · diaristas · bookings · admin · legal · me
│   │   ├── middleware/       # auth · errorHandler · rateLimits · originAllowlist
│   │   ├── lib/              # prisma · env · JWT/cookies · state machine · logger
│   │   └── validation/       # Zod schemas
│   └── prisma/
│       ├── schema.prisma     # User · RefreshSession · DiaristProfile · Booking
│       ├── migrations/       # Migrações versionadas
│       └── seed.ts           # Dados demo (clientes, diaristas, admin)
│
├── frontend/                 # SPA React (Vite)
│   └── src/
│       ├── pages/            # Home · Profissionais · ProfissionalDetalhe
│       │                       Agendamentos · PerfilDiarista · Login · Register
│       │                       Privacy · painel/(Cliente|Profissional|Admin)
│       ├── components/       # Layout · RoleRoute · FormField · LgpdAccountSection
│       ├── context/          # AuthContext (token + refresh automático)
│       └── api.ts            # Fetch wrapper com refresh interceptor
│
├── docker-compose.yml        # PostgreSQL 16 local (porta 5433)
├── render.free.yaml          # Blueprint Render — API grátis (Neon externo)
├── render.yaml               # Blueprint Render — API + Postgres gerenciado
└── frontend/vercel.json      # Rewrites SPA para React Router
```

### Fluxo de autenticação

```
Login → POST /api/auth/login
         ├─ access token (JWT, 15 min) → resposta JSON
         └─ refresh token (random hex, 30 d) → cookie httpOnly

Acesso autenticado → Authorization: Bearer <access>

Expirou → POST /api/auth/refresh (cookie automático)
           ├─ revoga sessão antiga no banco
           ├─ cria nova sessão (rotation)
           └─ emite novo par (access + cookie)

Logout → POST /api/auth/logout
          └─ revoga sessão no banco + limpa cookie
```

### Modelo de dados

```
User (id, email, passwordHash, name, phone, role, deletedAt, privacyConsentAt)
 ├─ RefreshSession (tokenHash SHA-256, expiresAt, revokedAt)
 ├─ DiaristProfile (bio, city, neighborhoods, hourlyRateCents, servicesOffered, isActive)
 └─ Booking (scheduledAt, status, notes, address, clientUserId, diaristUserId)

Enum Role:          CLIENT | DIARISTA | ADMIN
Enum BookingStatus: PENDING | ACCEPTED | REJECTED | COMPLETED | CANCELLED
```

---

## Rodar localmente

### 1. Banco de dados (Docker)

```bash
docker compose up -d
```

Sobe PostgreSQL 16 em `localhost:5433`. Usuário e banco: `faxxiner`, senha: `faxxiner_local`.

> **Problema P1000?** O volume foi criado antes com outras credenciais. Recrie:
> ```bash
> docker compose down -v && docker compose up -d
> ```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

API disponível em `http://localhost:4002`. A raiz (`GET /`) retorna mapa de endpoints e stack.

#### Health checks

| Endpoint | Uso |
|----------|-----|
| `GET /health` | Liveness — processo vivo |
| `HEAD /health` | Mesma coisa sem corpo |
| `GET /health?deep=1` | Readiness — executa `SELECT 1` no banco |

```bash
curl http://localhost:4002/health
curl "http://localhost:4002/health?deep=1"
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App disponível em `http://localhost:5173`. O proxy do Vite encaminha `/api/*` para `localhost:4002`.

---

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Obrigatório em prod | Padrão dev | Descrição |
|----------|---------------------|-----------|-----------|
| `DATABASE_URL` | ✅ | — | Connection string PostgreSQL |
| `JWT_SECRET` | ✅ (≥ 32 chars) | `dev-insecure-secret` | Segredo dos access tokens |
| `FRONTEND_ORIGIN` | ✅ | `http://localhost:5173` | CORS allowlist (vírgulas para múltiplos) |
| `NODE_ENV` | ✅ | `development` | `production` habilita validações extras |
| `JWT_ACCESS_EXPIRES_IN` | — | `15m` | Duração do access token |
| `JWT_REFRESH_EXPIRES_IN` | — | `30d` | Duração do refresh token |
| `BCRYPT_ROUNDS` | — | `12` | Custo do hash de senha (10–15) |
| `PORT` | — | `4002` | Porta do servidor |
| `TRUST_PROXY` | recomendado | — | `1` atrás de reverse proxy |
| `LGPD_CONTROLLER_EMAIL` | recomendado | — | E-mail do controlador de dados |
| `LGPD_DPO_EMAIL` | — | — | Encarregado (DPO), se houver |
| `SKIP_DB_SEED` | — | — | `true` para não rodar seed no deploy |
| `HEALTH_DEEP_SECRET` | — | — | Chave para `/health?deep=1` em produção |

### Frontend (`frontend/.env`)

| Variável | Obrigatório em prod | Descrição |
|----------|---------------------|-----------|
| `VITE_API_URL` | ✅ | URL pública da API (sem `/api` no final) |
| `VITE_CONTACT_EMAIL` | — | E-mail de contato no rodapé |

---

## Deploy gratuito (Neon + Render + Vercel)

| Parte | Serviço | Custo |
|-------|---------|-------|
| Frontend SPA | [Vercel](https://vercel.com) Hobby | Grátis |
| API Node | [Render](https://render.com) Web Service Free | Grátis (hiberna ~15 min sem uso) |
| PostgreSQL | [Neon](https://neon.tech) free tier | Grátis |

**Passo a passo:**

1. Crie um banco no **Neon** → copie a connection string.
2. No **Render** → New → Blueprint → escolha `render.free.yaml`.
   - Cole `DATABASE_URL` (Neon), defina `JWT_SECRET` (≥ 32 chars) e `FRONTEND_ORIGIN`.
3. No **Vercel** → novo projeto → Root Directory: `frontend` → defina `VITE_API_URL` com a URL do Render.
4. Confirme `FRONTEND_ORIGIN` no Render = URL do Vercel (CORS).

> O Blueprint (`render.free.yaml`) roda `prisma migrate deploy` e `npm run db:seed` no build, criando os usuários demo automaticamente.

### Erros comuns no deploy

| Erro | Causa | Solução |
|------|-------|---------|
| `JWT_SECRET` rejeitado | Menos de 32 chars | Defina um segredo longo manualmente |
| `DATABASE_URL` vazio no build | Variável não definida antes do 1º deploy | Defina no painel Render antes de disparar |
| `P1000` / credenciais inválidas | Volume Docker criado com outras creds | `docker compose down -v && up -d` |
| `tsc: not found` | Render não instala devDeps | `typescript` está em `dependencies` — isso é intencional |

---

## Testes

```bash
cd backend
npm test
```

Vitest + Supertest cobrindo rotas de autenticação, agendamentos e integridade de middlewares.

```bash
# Build de verificação (TypeScript)
npm run build
```

---

## Troubleshooting

### `EPERM` / rename do Prisma engine (Windows + OneDrive)

Se `npx prisma generate` falhar ao renomear `query_engine-*.dll.node`:

```bash
# backend/
npm run db:generate:fresh
```

Remove `node_modules/.prisma` e regenera. Se persistir, mova o projeto para fora do OneDrive ou exclua `node_modules` do antivírus.

---

## Licença

Uso educacional / portfólio — não destinado a produção real sem revisão jurídica dos textos de LGPD.
