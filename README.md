# ProtoFácil

Ferramenta de prototipagem acessível para codesigners idosos (60+ anos).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

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
- ReactKonva (canvas)
- Tailwind CSS
- Zustand (state management)

### Backend
- Fastify
- Prisma + PostgreSQL

### Infra
- TypeScript strict
- ESLint + jsx-a11y

##Setup

### Pré-requisitos
- Node.js 20+
- PostgreSQL 14+

### Instalação

1. Clone o repositório:
```bash
cd protofacil
```

2. Instale as dependências:
```bash
npm install
```

3.Configure as variáveis de ambiente:
```bash
cp apps/api/.env.example apps/api/.env
# Edite o arquivo com suas configurações
```

4.Execute as migrações do banco de dados:
```bash
cd apps/api
npm run db:push
```

5.Inicie o servidor de desenvolvimento:
```bash
# Terminal 1 - Backend
cd apps/api
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

Acesse http://localhost:3000

## Estrutura do Projeto

```
/apps/web          # Frontend Next.js
/apps/api         # Backend Fastify
/packages/ui      # Design system
/packages/shared  # Types e constantes
/packages/canvas  # Lógica do editor
```

## Design System

O projeto inclui um design system acessível com os seguintes componentes:

- Button (botões acessíveis com mínima 48x48px)
- Input (com label, helper text, error state)
- Modal (focus trap, aria-modal)
- Toast (aria-live para notificações)
- Tooltip (delay 300ms)
- Slider (com input numérico alternativo)
- ColorPicker (com input hexadecimal)
- Toolbar (navegação por arrow keys)

Todos os componentes seguem as diretrizes WCAG 2.1 nível AA.

## Critérios de Acessibilidade

- Tamanho de fonte mínimo: 18px para labels
- Área de clique/toque mínima: 44x44px (WCAG 2.5.5)
- Contraste mínimo: 4.5:1 para texto normal
- Focus visible: outline de 3px mínimo
- Suporte a prefers-reduced-motion

## Contribuição

Este é um projeto acadêmico (TCC UESB 2025). Para contribuições, por favor, abra uma issue primeiro.

## Licença

MIT License - veja LICENSE para detalhes.