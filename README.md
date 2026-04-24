# ProtoFácil

Ferramenta de prototipagem acessível para codesigners idosos.

## Objetivo

ProtoFácil é uma aplicação web de prototipagem diseñada especificamente para pessoas idosas que atuam como codesigners. A ferramenta atende às necessidades de acessibilidade sensoriais, cognitivas e motoras desse público-alvo.

## Funcionalidades Principais

- **Editor Visual de Protótipos**: Criação de telas com elementos básicos (retângulos, círculos, textos, botões, campos de input)
- **Operações de Elementos**: Adicionar, mover, redimensionar, deletar, duplicar
- **Propriedades Editáveis**: Cor de fundo, borda, texto, tamanho de fonte
- **Histórico de Ações**: Desfazer (Ctrl+Z) e refazer (Ctrl+Y)
- **Snap-to-Grid**: Alinhamento automático para facilitar precisas
- **Autosave**: Salvamento automático a cada 30 segundos
- **Acessibilidade**: Navegação completa por teclado e suporte a leitores de tela

## Tecnologias

### Frontend
- Next.js 14 (App Router)
- React Konva (canvas)
- Tailwind CSS
- Zustand (state management)
- Socket.IO (colaboração em tempo real)
- Yjs (sincronização)

### Backend
- NestJS
- Prisma + PostgreSQL
- Socket.IO
- JWT (autenticação)

### Tools
- TypeScript
- ESLint

## Instalação

### Pré-requisitos
- Node.js 20+
- PostgreSQL 14+

### Passo 1: Clone e instale dependências

```bash
git clone https://github.com/protofacil/protofacil.git
cd protofacil
npm install
```

### Passo 2: Configure o banco de dados

1. Inicie o PostgreSQL:
```bash
# Linux
sudo service postgresql start

# ou Docker
docker start postgres
```

2. Crie o usuário e banco de dados:
```bash
sudo -u postgres psql
```

No prompt do psql, execute:
```sql
CREATE USER "protouser" WITH PASSWORD '123123';
CREATE DATABASE protofacil OWNER "protouser";
GRANT ALL PRIVILEGES ON DATABASE protofacil TO "protouser";
\q
```

3. Configure as variáveis de ambiente:
```bash
cd apps/api
# Edite o arquivo .env com as configurações
```

### Passo 3: Sincronize o banco de dados

```bash
cd apps/api
npm run prisma:push
```

### Passo 4: Execute as migrações de permissões

```bash
sudo -u postgres psql -d protofacil -c 'GRANT ALL ON SCHEMA public TO "protouser"; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "protouser"; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "protouser";'
```

### Passo 5: Inicie os servidores

```bash
# Terminal 1 - Backend (porta 4000)
cd apps/api
npm run start:dev

# Terminal 2 - Frontend (porta 3000)
cd apps/web
npm run dev
```

Acesse:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Documentação: http://localhost:4000/api/docs

## Estrutura do Projeto

```
/apps/web          # Frontend Next.js (porta 3000)
/apps/api         # Backend NestJS (porta 4000)
```

## Componentes Disponíveis

O projeto inclui componentes acessívels:

- **Button**: Botões com tamanho mínimo 48x48px
- **Input**: Campos com label e estados de erro
- **Dialog**: Modais com focus trap
- **Toast**: Notificações com aria-live
- **Tooltip**: tooltips com delay 300ms

Todos os componentes seguem as diretrizes WCAG 2.1 nível AA.

## Critérios de Acessibilidade

- Tamanho de fonte mínimo: 18px para labels
- Área de clique: mínimo 44px (WCAG 2.5.5)
- Contraste mínimo: 4.5:1 para texto
- Focus visible: outline de 3px
- Suporte a prefers-reduced-motion
- Navegação por teclado completa

## Contribuição

Projeto acadêmico (TCC UESB 2025/2026). Para contribuições, abra uma issue primeiro.

## Licença

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
