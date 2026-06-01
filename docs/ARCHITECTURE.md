# Arquitetura do ProtoFácil

O ProtoFácil usa monorepo npm workspaces:

```txt
apps/api      Express + Inertia + MariaDB
apps/web      Vue 3 + Vite + TailwindCSS
packages/ui   Componentes Vue acessíveis
packages/shared Tipos compartilhados
packages/editor Núcleo de editor SVG acessível
```

## Backend

Fluxo obrigatório:

```txt
Route → Controller → Service → Repository → MariaDB
```

Controllers lidam com HTTP/Inertia. Services concentram regras de negócio. Repositories são os únicos responsáveis por SQL.

## Frontend

Fluxo principal:

```txt
Inertia Page → Layout/Components → Pinia Store → packages/editor
```

Todo componente Vue usa Composition API e `<script setup lang="ts">`.
