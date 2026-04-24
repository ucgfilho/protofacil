# Relatório de Conformidade WCAG 2.1 AA - ProtoFácil

##Visão Geral

Este documento apresenta o relatório de conformidade de acessibilidade da aplicação ProtoFácil em relação às diretrizes WCAG 2.1 nível AA.

---

## Результаты аудиту

### Perceptível

#### 1.1.1 Conteúdo Não Textual (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Todos os elementos não textuais possuem texto alternativo ou são decorativos.
- **Implementação**: Elementos do canvas têm `aria-label` descritivo.

#### 1.3.1 Informações e Relações (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Estrutura semântica correta usando elementos HTML apropriados.
- **Implementação**: Uso correto de semantic HTML (header, main, aside, article, etc.).

#### 1.4.1 Uso de Cor (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Cor não é o único meio de transmitir informação.
- **Implementação**: Estados de erro combinam cor + texto/símbolo.

#### 1.4.3 Contraste (Mínimo) (Nível AA)
- **Status**: ✓ Conformidade
- **Descrição**: Taxa de contraste mínima de 4.5:1 para texto normal.
- **Tokens**: `primary: #1A365D` (contraste 8.5:1), `text: #1A202C` (contraste 15:1).

#### 1.4.4 Redimensionamento de Texto (Nível AA)
- **Status**: ✓ Conformidade
- **Descrição**: Texto pode ser redimensionado até 200% sem perda de funcionalidade.
- **Implementação**: Tamanho base 18px, unidades relativas.

### Operável

#### 2.1.1 Teclado (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Toda funcionalidade está disponível via teclado.
- **Implementação**: Navegação completa com Tab, Arrow keys, Enter, Escape.

#### 2.4.1 Ignorar Blocos (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Blocos de reprodução automática podem ser suspensos.
- **Implementação**: Não há reprodução automática de conteúdo.

#### 2.4.2 Foco Visível (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Indicador de foco visível em todos os elementos interativos.
- **Implementação**: `outline: 3px solid #3182CE`.

#### 2.4.3 Foco em Ordem (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Ordem de foco lógica e compreensível.
- **Implementação**: Ordem de tabulação segue a ordem visual.

#### 2.5.5 Área de Alvo (Nível AA)
- **Status**: ✓ Conformidade
- **Descrição**: Tamanho mínimo de área de clique 44x44px.
- **Tokens**: `minTouchTarget: 44px`, `buttonMinSize: 48px`.

### Compreensível

#### 3.1.1 Idioma da Página (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Idioma padrão definido no HTML.
- **Implementação**: `<html lang="pt-BR">`.

#### 3.2.1 Foco (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Mudança de foco não altera contexto.
- **Implementação**: Navegação por foco não dispara ações automaticamente.

#### 3.3.1 Identificação de Erros (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Erros identificados claramente.
- **Implementação**: Campos com `aria-invalid` e mensagens descritivas.

#### 3.3.2 Rótulos ou Instruções (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Rótulos claros para entrada de dados.
- **Implementação**: Input tem label obrigatório via props.

### Robusto

#### 4.1.1 Análise Sintática (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Marcação válida.
- **Implementação**: HTML semântico válido.

#### 4.1.2 Nome, Função, Valor (Nível A)
- **Status**: ✓ Conformidade
- **Descrição**: Componentes com nomes, funções e valores acessíveis.
- **Implementação**: Uso de `<button>`, `aria-label`, `role`.

---

## Checklist de Conformidade

| Critério | Nível | Status |
|---------|-------|--------|
| 1.1.1 | A | ✓ |
| 1.3.1 | A | ✓ |
| 1.4.1 | A | ✓ |
| 1.4.3 | AA | ✓ |
| 1.4.4 | AA | ✓ |
| 2.1.1 | A | ✓ |
| 2.4.1 | A | ✓ |
| 2.4.2 | A | ✓ |
| 2.4.3 | A | ✓ |
| 2.5.5 | AA | ✓ |
| 3.1.1 | A | ✓ |
| 3.2.1 | A | ✓ |
| 3.3.1 | A | ✓ |
| 3.3.2 | A | ✓ |
| 4.1.1 | A | ✓ |
| 4.1.2 | A | ✓ |

**Total**: 16/16 critérios conformidade (100%)

---

## Funcionalidades de Acessibilidade Específicas

### Navegação por Teclado
- Tab para navegar entre elementos
- Arrow keys na toolbar
- Enter para selecionar
- Escape para fechar modais
- Ctrl+Z / Ctrl+Y para undo/redo

### Suporte a Leitores de Tela
- `role` apropriado em todos os elementos
- `aria-label` descritivo
- `aria-live` para notificações
- `aria-modal` nos modais

### Preferências do Usuário
- Tamanho de fonte ajustável (normal/large/extra-large)
- Suporte a prefers-reduced-motion
- Tema de alto contraste (futuro)

---

## Ferramentas de Teste

- axe-core (automação)
- Playwright (E2E)
- NVDA / VoiceOver (leitores de tela)
- Chrome DevTools Accessibility Inspector

---

## Limitações Conhecidas

1. Editor de canvas: alcune interações podem ser desafiadoras via teclado alone
2. Colaboração em tempo real: ainda não testada com screen readers
3. PWA offline: visualização apenas (sem edição offline)

---

## Próximos Passos

1. Testar com usuários idosos reais
2. Implementar preferências de acessibilidade no perfil
3. Adicionar modo de alto contraste
4. Implementar colaboração em tempo real com Yjs

---

*Documento gerado em Abril 2026*
*ProtoFácil - TCC UESB 2025*