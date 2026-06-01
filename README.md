# ProtoFácil

Ferramenta de prototipagem acessível para codesigners idosos (60+), construída com Vue 3, Inertia.js, Express e MySQL.

## Stack

- Vue 3 + TypeScript + Inertia.js + Vite + TailwindCSS + Pinia
- Node.js + Express + TypeScript
- MariaDB/MySQL com mysql2
- Sessão com cookie httpOnly

## Configuração rápida

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Ajuste as variáveis do banco no `.env`

4. Crie o banco configurado em `DB_NAME`:

```bash
mariadb -u seu-usuario -p -e "CREATE DATABASE protofacil"
```

5. Rode as migrações:

```bash
npm run db:migrate -w apps/api
```

6. Inicie o projeto:

```bash
npm run dev
```
