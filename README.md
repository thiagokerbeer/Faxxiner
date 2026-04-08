# Faxxiner

Hub para conectar **quem precisa de faxina** a **profissionais (diaristas)** — projeto de portfólio full stack.

## Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript
- **Banco:** PostgreSQL, Prisma ORM

## Rodar localmente

### 1. Banco PostgreSQL (Docker)

Na raiz do projeto:

```bash
docker compose up -d
```

Isso sobe Postgres em `localhost:5433` (porta externa para não conflitar com um Postgres local na 5432). Usuário e banco padrão: `faxxiner` / senha `faxxiner_local` (veja `backend/.env.example`).

**Se o login na API falhar com P1000 / “credentials for `faxxiner` are not valid”:** o volume do Docker foi criado antes com outro usuário/senha; o Postgres **não** reaplica `POSTGRES_USER` em dados já existentes. Ou você alinha o `DATABASE_URL` no `backend/.env` ao que o volume já tem, ou recria o volume (apaga o banco local):

```bash
docker compose down -v
docker compose up -d
```

Em seguida, no `backend`: `npx prisma migrate dev` e `npm run db:seed`.

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

API padrão: `http://localhost:4002`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

### Contas de demonstração (após seed)

| Papel        | E-mail              | Senha      |
|--------------|---------------------|------------|
| Cliente      | cliente@demo.com    | demo123456 |
| Profissional | maria@demo.com      | demo123456 |
| Profissional | ana@demo.com        | demo123456 |
| Gestor site  | admin@demo.com      | demo123456 |

## Segurança e LGPD (backend)

- **Helmet** — cabeçalhos HTTP mais seguros; **CORS** restrito a `FRONTEND_ORIGIN`; corpo JSON limitado (**256kb**); `x-powered-by` desligado.
- **Rate limit** — global na API; limites mais rígidos em **login** e **cadastro** (variáveis `RATE_LIMIT_*` no `.env`).
- **Senhas** — **bcrypt** com custo configurável (`BCRYPT_ROUNDS`, padrão **12**); cadastro exige **mínimo 8 caracteres** e confirmação explícita de tratamento de dados (`acceptLgpdTerms`).
- **JWT** — em **`NODE_ENV=production`**, `JWT_SECRET` com **≥ 32 caracteres** é obrigatório (falha ao subir a API). Duração: `JWT_EXPIRES_IN` (padrão `7d`).
- **Titulares** — `GET /api/legal/lgpd` (resumo para transparência); usuários autenticados: `GET /api/me/data-export` (portabilidade, JSON) e `DELETE /api/me/account` (anonimização com confirmação por senha). Contas encerradas ficam com `deletedAt` e não autenticam.
- **Deploy** — use **HTTPS**; defina `TRUST_PROXY=1` atrás de reverse proxy; preencha `LGPD_CONTROLLER_EMAIL` e, se houver, `LGPD_DPO_EMAIL`. Ajuste textos legais com seu advogado.

Após puxar estas alterações, rode no backend: `npx prisma migrate dev` (ou `migrate deploy` em produção).

## Deploy

### Opção gratuita (recomendada): Neon + Render + Vercel

Tudo com camadas **hobby / free** típicas (sujeitas a mudança pelos provedores):

| Parte | Onde | Custo |
|--------|------|--------|
| Frontend | [Vercel](https://vercel.com) (plano Hobby) | Grátis |
| API Node | [Render](https://render.com) Web Service **Free** | Grátis (hiberna ~15 min sem uso; 1º request pode demorar) |
| PostgreSQL | [Neon](https://neon.tech) (tier free) | Grátis (limites de armazenamento / compute) |

**Passos:**

1. **Git** — repo no GitHub (ou similar) com este projeto.
2. **Neon** — crie um projeto → copie a **connection string** PostgreSQL (costuma incluir `sslmode=require`; mantenha como veio).
3. **Render** → **New** → **Blueprint** → escolha o repo e o arquivo **`render.free.yaml`** (só a API, sem banco no Render).
   - Quando o painel pedir **`DATABASE_URL`**, cole a URL do Neon.
   - Preencha **`FRONTEND_ORIGIN`** depois que a Vercel existir (ex.: `https://xxx.vercel.app`), ou atualize no segundo deploy.
   - **`JWT_SECRET`**: o Blueprint pode gerar; se a API não subir por validação (mín. 32 caracteres), defina um segredo longo manualmente no painel.
4. **Vercel** → novo projeto → **Root Directory:** `frontend` → variável **`VITE_API_URL`** = URL da API Render (ex.: `https://faxxiner-api.onrender.com`, **sem** `/api` no final).
5. Volte ao Render e confirme **`FRONTEND_ORIGIN`** = URL exata do site na Vercel (com `https://`), senão o navegador bloqueia por CORS.

**Contas demo em produção** — e-mail `cliente@demo.com` ou `admin@demo.com`, senha **`demo123456`**. O Blueprint (`render.free.yaml` / `render.yaml`) roda **`npm run db:seed` no final do build**, para criar/atualizar esses usuários no Neon.

Se ainda não passou no login: faça um **novo deploy** no Render (push + deploy) ou rode o seed uma vez no seu PC com o Neon:

```bash
cd backend
# PowerShell: $env:DATABASE_URL="postgresql://..."
npx prisma db seed
```

#### Render: erros comuns no deploy

- **`preDeployCommand`** — no plano **Free** do Render isso **não existe**; o `render.free.yaml` roda `npx prisma migrate deploy` **no `buildCommand`**, depois do `npm run build`.
- **`DATABASE_URL` vazio no build** — defina **`DATABASE_URL`** (Neon) no painel **antes** do primeiro deploy bem-sucedido, senão o build falha na etapa de migrate. Prefira URL **direct** (sem `-pooler`); se der erro, tente remover `&channel_binding=require` da string.
- **`tsc: not found` / TypeScript** — `typescript` está em `dependencies` e o build usa `npm install --production=false` para garantir devDeps (`@types/*`) no Render.
- **`JWT_SECRET` / API não sobe** — em produção o código exige **≥ 32 caracteres**. Se o valor gerado pelo Blueprint for rejeitado, defina manualmente um segredo longo em **Environment**.

---

### Opção com Postgres no Render (`render.yaml`)

O arquivo **`render.yaml`** provisiona API + **PostgreSQL gerenciado** no Render. Esse banco **muitas vezes é pago**; use só se a sua conta/plano permitir.

Fluxo parecido ao acima, mas o Blueprint usa **`render.yaml`** e o `DATABASE_URL` vem do banco criado pelo Render. Demais variáveis (`FRONTEND_ORIGIN`, LGPD, etc.) igual.

### Repositório Git (qualquer opção)

```bash
git add .
git commit -m "chore: prepare deploy"
git push
```

### Arquivos de infra

| Arquivo | Uso |
|--------|-----|
| **`render.free.yaml`** | Deploy **grátis**: só API no Render; Postgres no **Neon** |
| `render.yaml` | API + Postgres no Render (banco pode ser pago) |
| `frontend/vercel.json` | SPA Vite + rewrites para `react-router` |

## Estrutura

```
faxxiner/
├── backend/          # API REST + Prisma
├── frontend/         # SPA React (+ vercel.json)
├── render.free.yaml  # Blueprint gratuito (API Render + Neon)
├── render.yaml       # Blueprint com Postgres no Render
├── docker-compose.yml
└── README.md
```

## Licença

Uso educacional / portfólio.
