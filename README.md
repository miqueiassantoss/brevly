# Brevly — Encurtador de URLs

Aplicação full-stack de encurtamento de URLs. Os usuários criam slugs personalizados para URLs longas, acompanham o número de acessos e são redirecionados automaticamente pelo link curto.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | Node.js 22, TypeScript, Fastify, Drizzle ORM |
| Banco de dados | PostgreSQL 16 (Docker) |
| Armazenamento | Cloudflare R2 (exportação de CSV) |
| Frontend | React 19, TypeScript, Vite, TailwindCSS v4 |

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose — para o backend e o banco de dados
- [Node.js 22+](https://nodejs.org/) e npm — para o servidor de desenvolvimento do frontend

---

## Como executar o projeto

### 1 — Backend (Docker Compose)

A API e o banco de dados Postgres sobem juntos via Docker.

```bash
cd server

# Copie o arquivo de variáveis de ambiente
cp .env.example .env
# → Preencha as variáveis do Cloudflare R2 no arquivo .env criado
#   (veja a seção "Modo de Avaliação" abaixo para instruções detalhadas)

# Suba a API e o Postgres
docker compose up --build

# Em um segundo terminal, execute as migrações do banco (apenas na primeira vez)
npm install
npm run db:migrate
```

A API ficará disponível em **http://localhost:3333**.

### 2 — Frontend (Vite)

```bash
cd web

# O arquivo web/.env já está incluso no repositório com os valores padrão para desenvolvimento local
npm install
npm run dev
```

A aplicação ficará disponível em **http://localhost:5173**.

---

## Modo de Avaliação — Configuração do Cloudflare R2

> Esta seção é dedicada ao avaliador do projeto.

Por boas práticas de segurança, **as credenciais pessoais do Cloudflare R2 não estão commitadas no repositório**. O arquivo `server/.env.example` documenta todas as variáveis necessárias com seus respectivos comentários.

### O que funciona sem configurar o R2

As funcionalidades principais do encurtador funcionam normalmente **sem nenhuma credencial do R2**, utilizando apenas o Docker e o Postgres:

- ✅ Criar link encurtado
- ✅ Listar links cadastrados
- ✅ Redirecionar pelo link curto (com contagem de acessos)
- ✅ Excluir link

### O que requer o R2

- ⚙️ **Exportar CSV** — gera um arquivo com todos os links e faz upload para o R2

### Como configurar o R2 para testar a exportação

1. Acesse [https://dash.cloudflare.com](https://dash.cloudflare.com) e faça login (conta gratuita é suficiente).
2. No menu lateral, acesse **R2 Object Storage** e crie um novo bucket.
3. Vá em **Manage R2 API Tokens** e gere um token com permissão de **Object Read & Write** para o bucket criado.
4. Preencha as variáveis abaixo no arquivo `server/.env`:

```env
CLOUDFLARE_ACCOUNT_ID=""      # ID da sua conta Cloudflare
CLOUDFLARE_ACCESS_KEY_ID=""   # Key ID do token gerado
CLOUDFLARE_SECRET_ACCESS_KEY="" # Secret do token gerado
CLOUDFLARE_BUCKET=""          # Nome do bucket criado
```

5. Reinicie os containers com `docker compose up --build`.

### Por que URLs pré-assinadas (Presigned URLs)?

Optamos por **não tornar o bucket público**. Em vez disso, após o upload do CSV, a API gera uma URL pré-assinada com validade de 5 minutos e a retorna ao frontend, que inicia o download diretamente no navegador. Essa abordagem é mais segura e é uma prática padrão da indústria, pois garante que os arquivos exportados só sejam acessíveis por quem solicitou a exportação.

A variável `CLOUDFLARE_PUBLIC_URL` está presente no `docker-compose.yml` por completude, mas não é consumida pela aplicação.

---

## Variáveis de ambiente

### `server/.env`

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PORT` | Não | Porta da API (padrão: `3333`) |
| `DATABASE_URL` | Sim | String de conexão com o PostgreSQL |
| `CLOUDFLARE_ACCOUNT_ID` | Para CSV | ID da conta Cloudflare |
| `CLOUDFLARE_ACCESS_KEY_ID` | Para CSV | Key ID do token R2 |
| `CLOUDFLARE_SECRET_ACCESS_KEY` | Para CSV | Secret do token R2 |
| `CLOUDFLARE_BUCKET` | Para CSV | Nome do bucket R2 |
| `CLOUDFLARE_PUBLIC_URL` | Não | URL pública do bucket (não utilizada pela aplicação) |
| `POSTGRES_USER` | Sim | Usuário do Postgres (usado pelo Docker Compose) |
| `POSTGRES_PASSWORD` | Sim | Senha do Postgres (usado pelo Docker Compose) |
| `POSTGRES_DB` | Sim | Nome do banco de dados (usado pelo Docker Compose) |
| `FRONTEND_URL` | Não | Origem permitida pelo CORS (padrão: todas as origens) |

### `web/.env`

| Variável | Descrição |
|---|---|
| `VITE_FRONTEND_URL` | URL pública do frontend (usada para montar os links curtos na interface) |
| `VITE_BACKEND_URL` | URL base da API |

---

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/links` | Cria um link encurtado |
| `GET` | `/links` | Lista todos os links (ordenados por data de criação, mais recente primeiro) |
| `GET` | `/links/:shortenedUrl` | Redireciona (302) para a URL original e incrementa o contador de acessos |
| `DELETE` | `/links/:id` | Remove um link pelo UUID |
| `GET` | `/links/export` | Gera o CSV, faz upload para o R2 e retorna uma URL pré-assinada para download |
| `GET` | `/health` | Verificação de saúde da API |
