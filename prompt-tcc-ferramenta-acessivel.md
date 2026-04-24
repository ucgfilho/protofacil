## MISSÃO

Você é um Engenheiro Full Stack Sênior. Sua tarefa é construir do zero uma aplicação web de prototipagem acessível voltada para codesigners idosos, conforme especificado no TCC "Desenvolvimento de uma Ferramenta de Prototipagem Acessível para Codesigners Idosos" (UESB, 2025).

Você tem autonomia total para escolher as melhores tecnologias disponíveis, desde que justifique cada decisão com base nos requisitos de acessibilidade, usabilidade e público-alvo.

O nome da aplicação será ProtoFácil.

---

## CONTEXTO DO PROBLEMA

O público-alvo são pessoas idosas (60+ anos) atuando como codesigners. Elas apresentam:

- **Limitações sensoriais:** visão reduzida, dificuldade com toque fino
- **Limitações cognitivas:** memória de trabalho reduzida, sobrecarga por excesso de UI
- **Limitações motoras:** menor precisão em cliques, drag-and-drop, gestos complexos

Ferramentas atuais (Figma, Adobe XD, Sketch, Axure RP) falham para esse público por: interfaces densas, ícones pequenos, curva de aprendizado alta e ausência de adaptações sensoriais/cognitivas.

---

## STACK TECNOLÓGICA — DECIDA VOCÊ

Analise os requisitos abaixo e selecione a stack mais adequada. Considere obrigatoriamente:

**Frontend:**

- Deve ser baseado em componentes (React, Next.js, ou Svelte)
- Área de canvas: avalie Konva.js, Fabric.js, React Flow, ou SVG nativo (priorize DOM-based para compatibilidade com screen readers)
- Styling: Tailwind CSS ou CSS Modules com design tokens de acessibilidade
- State management: Zustand, Jotai ou Redux Toolkit (escolha o mais simples)
- Real-time collaboration: avalie Yjs (CRDT) + WebSocket ou PartyKit

**Backend:**

- Node.js obrigatório (justificado no TCC: unificação JS + performance)
- Framework: Express, Fastify ou Hono — escolha o mais performático
- Banco de dados: avalie PostgreSQL + Prisma, ou PocketBase (self-hosted BaaS)
- Autenticação: NextAuth, Lucia Auth, ou JWT manual

**Infra/Dev:**

- Monorepo com Turborepo ou estrutura simples de workspace npm
- Testes: Vitest (unit), Playwright (E2E acessibilidade)
- Linting: ESLint + Prettier + eslint-plugin-jsx-a11y (obrigatório)

Documente a stack escolhida em `ARCHITECTURE.md` com a justificativa técnica de cada decisão antes de iniciar o código.

---

## REQUISITOS FUNCIONAIS

Implemente exatamente estes requisitos, nesta ordem de prioridade:

### RF001 — Autenticação

- Cadastro com: nome, e-mail, senha
- Validação em tempo real com mensagens claras (não apenas cor vermelha)
- Login/logout seguro
- Recuperação de senha por e-mail

### RF002 — Editor de Protótipos (core da aplicação)

- Canvas para criação de telas de protótipo
- Elementos disponíveis: retângulos, círculos, textos, botões, campos de input, imagens (upload), ícones básicos
- Operações: adicionar, mover, redimensionar, deletar, duplicar elementos
- Propriedades editáveis: cor de fundo, cor de borda, cor de texto, tamanho de fonte
- Histórico de ações: desfazer (Ctrl+Z) e refazer (Ctrl+Y) — RNF008
- Snap-to-grid para facilitar alinhamento (auxilia limitações motoras)
- Área de clique/toque mínima de 44x44px em todos os elementos interativos (WCAG 2.5.5)

### RF003 — Colaboração em Tempo Real

- Múltiplos usuários no mesmo projeto simultaneamente
- Cursores dos colaboradores visíveis com nome/cor identificadora
- Sincronização de estado do canvas em tempo real

### RF004 — Acessibilidade do Editor

- Navegação completa por teclado (Tab, Arrow keys, Enter, Escape)
- Suporte a leitores de tela (VoiceOver, NVDA, JAWS)
- Todos os elementos do canvas devem ter `role` e `aria-label` apropriados
- Anúncios de ações via `aria-live` regions

### RF005 — Gestão de Projetos

- Criar, renomear, duplicar e deletar projetos
- Salvar automaticamente (autosave a cada 30 segundos)
- Exportar protótipo como PNG ou PDF
- Importar imagens (PNG, JPG, SVG)

### RF006 — Feedback Visual e Sonoro

- Toast notifications para confirmação de ações (salvo, copiado, erro)
- Sons opcionais para ações críticas (deletar, salvar) — toggle no perfil
- Animações de loading e transição suaves (respeitar `prefers-reduced-motion`)

### RF007 — Mensagens de Erro

- Mensagens em linguagem simples, sem jargão técnico
- Sempre acompanhadas de sugestão de resolução
- Persistentes até o usuário dispensar (não desaparecem automaticamente)

---

## REQUISITOS NÃO FUNCIONAIS — REGRAS ABSOLUTAS

### RNF001 — Simplicidade Cognitiva

- Máximo 5 ações visíveis por vez na toolbar principal
- Funcionalidades avançadas agrupadas em menus secundários
- Onboarding com tour guiado na primeira sessão (max 5 passos)

### RNF002 — Tipografia e Iconografia

- Tamanho de fonte mínimo: 18px para labels, 16px para textos auxiliares
- Ícones sempre acompanhados de label textual (nunca ícone sozinho)
- Tooltips em todos os botões de ação com delay de 300ms

### RNF003 — Performance

- First Contentful Paint < 2s em conexão 3G
- Operações no canvas < 16ms (60fps)
- Bundle size < 500KB gzipped para o chunk inicial

### RNF004 — Responsividade

- Breakpoints: mobile (360px+), tablet (768px+), desktop (1024px+)
- Editor funcional no tablet (touch events com área de hit mínima 44x44px)

### RNF005 — Multiplataforma

- Funciona em Chrome, Firefox, Safari, Edge (últimas 2 versões)
- PWA com suporte a instalação e uso offline básico (visualização de projetos)

### RNF006 e RNF007 — Tecnologias Assistivas e WCAG

- Conformidade WCAG 2.1 nível AA obrigatória
- Executar axe-core em CI e bloquear build se score de acessibilidade < 90
- Contraste mínimo: 4.5:1 para texto normal, 3:1 para texto grande
- Focus visible em todos os elementos interativos (outline de no mínimo 3px)

### RNF009 — Design Visual

- Paleta de cores: alto contraste, máximo 4 cores primárias
- Espaçamento generoso entre elementos (mínimo 12px de gap)
- Sem animações de distração. Motion apenas para feedback de ação.

---

## ARQUITETURA DA APLICAÇÃO

```
/
├── apps/
│   ├── web/          # Frontend (Next.js ou Vite+React)
│   └── api/          # Backend (Node.js)
├── packages/
│   ├── ui/           # Design system de componentes acessíveis
│   ├── shared/       # Types, utils, constantes compartilhadas
│   └── canvas/       # Lógica do editor isolada e testável
├── ARCHITECTURE.md   # Documente aqui antes de codar
└── README.md
```

---

## DESIGN SYSTEM — IMPLEMENTE ANTES DO EDITOR

Crie o design system em `packages/ui` com estes componentes acessíveis antes de construir qualquer tela:

| Componente    | Especificação                                                                         |
| ------------- | ------------------------------------------------------------------------------------- |
| `Button`      | Variantes: primary, secondary, danger, ghost. Tamanho mínimo 48x48px, com ícone+label |
| `Input`       | Com label obrigatório, helper text, error state                                       |
| `Modal`       | Focus trap, Escape para fechar, aria-modal                                            |
| `Toast`       | aria-live="polite", auto-dismiss opcional                                             |
| `Tooltip`     | Delay 300ms, aria-describedby                                                         |
| `Toolbar`     | Navegação por arrow keys (roving tabindex)                                            |
| `ColorPicker` | Com input hexadecimal alternativo                                                     |
| `Slider`      | Com input numérico alternativo (para idosos com tremor)                               |

Cada componente deve:

1. Ter `data-testid` para automação
2. Exportar tipos TypeScript
3. Ter Storybook story (opcional, mas recomendado)
4. Passar no axe-core sem violations

---

## MODELO DE DADOS

Defina o schema com base nesta estrutura mínima:

```typescript
User {
  id, name, email, passwordHash,
  createdAt, preferences: UserPreferences
}

UserPreferences {
  fontSize: 'normal' | 'large' | 'extra-large',
  soundEnabled: boolean,
  reducedMotion: boolean,
  highContrast: boolean
}

Project {
  id, name, ownerId, collaborators: string[],
  createdAt, updatedAt, thumbnail: string
}

Canvas {
  id, projectId,
  elements: CanvasElement[],
  version: number  // para CRDT/OT
}

CanvasElement {
  id, type: ElementType, x, y, width, height,
  rotation, zIndex, locked,
  style: ElementStyle,
  content?: string,  // para Text e Button
  src?: string       // para Image
}

ElementType = 'rect' | 'circle' | 'text' | 'button' |
              'input' | 'image' | 'icon' | 'container'
```

---

## ORDEM DE IMPLEMENTAÇÃO — SIGA ESTA SEQUÊNCIA

Execute na seguinte ordem. Não pule etapas.

### FASE 1 — Fundação (não produza UI antes disso)

- [ ] 1. Definir e documentar stack em `ARCHITECTURE.md`
- [ ] 2. Configurar monorepo, ESLint, Prettier, TypeScript strict
- [ ] 3. Configurar eslint-plugin-jsx-a11y e axe-core no CI
- [ ] 4. Definir design tokens (cores, tipografia, espaçamento, breakpoints)
- [ ] 5. Implementar componentes do design system com testes

### FASE 2 — Backend

- [ ] 6. Setup do servidor com roteamento modular
- [ ] 7. Schema do banco + migrations
- [ ] 8. Autenticação (RF001)
- [ ] 9. CRUD de projetos (RF005)
- [ ] 10. API do canvas (salvar/carregar elementos)
- [ ] 11. WebSocket para colaboração (RF003)

### FASE 3 — Frontend Core

- [ ] 12. Layout base: sidebar + canvas area + toolbar
- [ ] 13. Autenticação (páginas login/cadastro)
- [ ] 14. Dashboard de projetos
- [ ] 15. Editor: renderização do canvas
- [ ] 16. Editor: adição de elementos
- [ ] 17. Editor: seleção, move, resize com teclado e mouse
- [ ] 18. Editor: painel de propriedades
- [ ] 19. Editor: histórico (undo/redo)
- [ ] 20. Autosave + exportação

### FASE 4 — Acessibilidade e Qualidade

- [ ] 21. Auditoria axe-core em todas as telas
- [ ] 22. Testes de navegação por teclado (Playwright)
- [ ] 23. Onboarding tour
- [ ] 24. Preferências de acessibilidade no perfil
- [ ] 25. PWA manifest + service worker

### FASE 5 — Testes

- [ ] 26. Testes unitários (Vitest): lógica do canvas, utils
- [ ] 27. Testes E2E (Playwright): fluxos críticos
- [ ] 28. Testes de acessibilidade automatizados (axe-playwright)

---

## PADRÕES DE CÓDIGO — NÃO NEGOCIÁVEIS

```typescript
// ✅ CORRETO — componente acessível com data-testid
interface ButtonProps {
  label: string;        // sempre label, nunca só ícone
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  'data-testid'?: string;
}

export const Button = ({
  label,
  icon,
  onClick,
  variant = 'primary',
  disabled = false,
  'data-testid': testId,
}: ButtonProps) => (
  <button
    className={styles[variant]}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    data-testid={testId}
    // mínimo 48px garantido via CSS
  >
    {icon && <span aria-hidden="true">{icon}</span>}
    <span>{label}</span>
  </button>
);

// ✅ CORRETO — elemento do canvas com aria
<div
  role="figure"
  aria-label={`${element.type}: ${element.content ?? 'sem texto'}, posição ${element.x}, ${element.y}`}
  aria-selected={isSelected}
  tabIndex={0}
  data-testid={`canvas-element-${element.id}`}
  onKeyDown={handleKeyboardInteraction}
/>

// ❌ PROIBIDO
<div onClick={...} />           // sem role
<button><Icon /></button>       // sem label
<img src={...} />               // sem alt
const x = e.clientX - rect.left // hardcoded sem considerar zoom/scroll
```

---

## CRITÉRIOS DE ACEITE — DEFINIÇÃO DE PRONTO

Uma feature só está pronta quando:

1. **Funcional:** implementa 100% do requisito descrito
2. **Acessível:** passa no axe-core sem violations críticas ou sérias
3. **Navegável por teclado:** fluxo completo sem uso de mouse
4. **Testado:** tem ao menos 1 teste unitário ou E2E cobrindo o happy path
5. **Responsivo:** funciona em 360px, 768px e 1280px de largura
6. **Performático:** não causa jank no canvas (use React DevTools Profiler)

---

## ENTREGÁVEIS FINAIS

Ao concluir, entregue:

| Arquivo/Diretório  | Conteúdo                              |
| ------------------ | ------------------------------------- |
| `ARCHITECTURE.md`  | Decisões técnicas justificadas        |
| `README.md`        | Setup, como rodar, como testar        |
| `ACCESSIBILITY.md` | Relatório de conformidade WCAG 2.1 AA |
| `/apps/web`        | Frontend completo e funcional         |
| `/apps/api`        | Backend completo e funcional          |
| `/packages/ui`     | Design system documentado             |

---

## RESTRIÇÃO FINAL

Esta é uma aplicação acadêmica com foco em pesquisa aplicada. O código deve ser legível e bem comentado em **português brasileiro**, pois será lido por pesquisadores e avaliadores acadêmicos.

Comentários em blocos críticos (lógica do canvas, algoritmo de colaboração, cálculos de acessibilidade) são obrigatórios.

> **Inicie pela criação de `ARCHITECTURE.md` com a stack escolhida e justificativas. Só então prossiga para a FASE 1.**
