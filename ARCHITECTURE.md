# Arquitetura do ProtoFácil

## Visão Geral

Este documento define a arquitetura técnica da aplicação ProtoFácil, uma ferramenta de prototipagem acessível para codesigners idosos. Cada decisão de tecnologia é justificadacom base nos requisitos de acessibilidade, usabilidade e no público-alvo (60+ anos).

---

## Stack Tecnológica Escolhida

### Frontend

| Tecnologia | Escolha | Justificativa |
|------------|---------|---------------|
| Framework | **Next.js 14** (App Router) | SSR melhora FCP (RNF003), SEO para compartilhamento de protótipos, estrutura de roteamento intuitiva. Suporte a PWA nativo via service workers. |
| Canvas | **Konva.js + react-konva** | API declarativa (compatível com React), performance 60fps promised (RNF003), suporte nativo a acessibilidade via aria.labels. Alternativa mais leve que Fabric.js (~300KB vs ~500KB). |
| Styling | **Tailwind CSS** + Design Tokens | Utilitários facilitam responsividade (RNF004), design tokens centralizam cores/espacamentos acessíveis,tree-shaking optimiza bundle size (<500KB). |
| State | **Zustand** | API simples (reduz complexidade cognitiva - RNF001), performance comparável a Redux mas com menos boilerplate, soporte a persistência automática para autosave. |
| Realtime | **Yjs + PartyKit** | CRDT para colaboração多人 em tempo real (RF003), PartyKit simplifica WebSocket com fallbacks automática, baixo overhead para bundle. |

### Backend

| Tecnologia | Escolha | Justificativa |
|------------|---------|---------------|
| Runtime | **Node.js** (obrigatório) | Justificado no TCC: unificação JavaScript,performance comprovada, ecossistema maduro. |
| Framework | **Fastify** | 3x mais rápido que Express (benchmarks 2024), schema validation integrado, ecosistema de plugins leve. |
| Banco | **PostgreSQL + Prisma** | ACID para dados de projetos (RF005), Prisma oferece type-safety total, migrations automáticas. |
| Auth | **Lucia Auth** | Flexibilidade para customização (prefências de acessibilidade), suporte a sessões, não depende de provider externo. |

### Infra/Dev

| Tecnologia | Escolha | Justificativa |
|------------|---------|---------------|
| Monorepo | **npm workspaces** | Simplicidade (não requer Turborepo), suficiente para 2 apps + 3 packages, menos configuração inicial. |
| Testes | **Vitest** + **Playwright** | Vitest: API similar a Jest mas mais rápido, compatível com Vite. Playwright: melhor suporte a acessibilidade (axe-playwright integrado), cross-browser. |
| Linting | **ESLint + Prettier + jsx-a11y** | jsx-a11y obrigatório para catching deviolações de acessibilidade em tempo de desenvolvimento. |

---

## Estrutura de Diretórios

```
/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/      # App Router pages
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── stores/
│   │   └── public/       # Static assets + PWA
│   └── api/              # Fastify backend
│       └── src/
│           ├── routes/
│           ├── services/
│           ├── middleware/
│           └── db/
├── packages/
│   ├── ui/              # Design system
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── tokens/
│   │   │   └── hooks/
│   │   └── stories/
│   ├── shared/           # Types, utils
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── constants/
│   │   └── tsconfig.json
│   └── canvas/           # Lógica do editor
│       ├── src/
│       │   ├── elements/
│       │   ├── history/
│       │   └── utils/
│       └── tests/
├── ARCHITECTURE.md
├── README.md
├── package.json
└── tsconfig.json
```

---

## Design Tokens de Acessibilidade

### Cores (Alto Contraste - WCAG AA)

```typescript
const colors = {
  primary: '#1A365D',      // azul escuro (contraste 8.5:1)
  secondary: '#2D3748',     // cinza escuro
  success: '#276749',       // verde escuro
  danger: '#9B2C2C',        // vermelho escuro
  background: '#FAFAFA',   // branco suave
  surface: '#FFFFFF',
  text: '#1A202C',         // preto suave
  textSecondary: '#4A5568',
  border: '#CBD5E0',
  focus: '#3182CE',         // outline azul 3px
};
```

### Tipografia

```typescript
const typography = {
  fontSize: {
    base: '18px',        // labels (RNF002)
    small: '16px',        // auxiliares
    large: '20px',
    heading: '24px',
  },
  fontFamily: 'system-ui, -apple-system, sans-serif',
  lineHeight: '1.5',
};
```

### Espaçamento

```typescript
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',     // mínimo (RNF009)
  lg: '16px',
  xl: '24px',
  xxl: '32px',
};
```

### Hit Areas

```typescript
const interactions = {
  minTouchTarget: '44px',  // WCAG 2.5.5
  buttonMinSize: '48px',   // maior para idosos
  tooltipDelay: 300,      // RNF002
};
```

---

## Decisões de API

### Autenticação (RF001)

- JWT em cookies httpOnly (segurança)
- Refresh token rotativo
- Session persisted no DB

### Canvas State

- Estado normalizado com Yjs Document
- Undo/redo via Yjs UndoManager
- Autosave a cada 30s (RF005)

### Colaboração (RF003)

- WebSocket via PartyKit
- Awareness protocol para cursores
- Resync automático em desconexão

---

## Critérios de Performance

| Métrica | Target |
|--------|--------|
| FCP | < 2s (3G) |
| TTI | < 3s |
| Canvas FPS | 60fps |
| Bundle | < 500KB gzipped |
| Lighthouse A11y | > 90 |

---

## Referências

- WCAG 2.1 AA Guidelines
- Fastify Performance Benchmarks 2024
- Konva.js Accessibility Docs
- PartyKit Real-time Docs