## Como rodar

1. Clone o repositório e acesse a pasta raiz:
   ```bash
   git clone https://github.com/ucgfilho/protofacil.git
   cd protofacil
   ```

2. Crie o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

3. Suba o ambiente com o Docker Compose:
   ```bash
   docker compose up -d --build
   ```

4. Acesse os serviços no navegador:
   - **ProtoFácil (Aplicação Web)**: [http://localhost:8000](http://localhost:8000)
   - **Vite HMR (Servidor de Assets)**: [http://localhost:5174](http://localhost:5174)
   - **Adminer (Gerenciador do MySQL)**: [http://localhost:8080](http://localhost:8080)

## Scripts Disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia a API Express e o Vite em modo de desenvolvimento |
| `npm run build` | Compila todos os pacotes e aplicações do monorepo |
| `npm run typecheck --ws` | Executa a validação de tipos TypeScript em todos os workspaces |
| `npm run test -w apps/api` | Executa a suíte de testes unitários da API |
| `npm run db:check -w apps/api` | Valida a conectividade com o banco de dados |
| `npm run db:migrate -w apps/api` | Executa as migrações SQL pendentes |

---

## Acessibilidade

Consulte [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) para diretrizes de acessibilidade e [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalhes arquiteturais do projeto.
