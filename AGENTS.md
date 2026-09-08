figma-make-app

## Mandatory Wiki Preflight

Regra inegociável do projeto: QUALQUER agente de IA, assistente de código, agente de documentação, agente de design, agente de testes, agente acadêmico ou agente de manutenção que trabalhar no Sorting Station DEVE consultar a Wiki antes de tomar decisões ou realizar alterações.

Todo agente que trabalhar no Sorting Station deve realizar obrigatoriamente o seguinte pre-flight antes de iniciar uma tarefa:

1. Ler `AGENTS.md`.
2. Ler `docs/wiki/SUMMARY.md`, quando existir.
3. Ler `docs/wiki/README.md`, quando existir.
4. Ler as páginas da Wiki diretamente relacionadas à tarefa.
5. Ler ADRs relacionados (`docs/adr/`), quando existirem.
6. Confirmar no código atual o estado real da funcionalidade antes de alterá-la.

Se `docs/wiki/SUMMARY.md` ainda não existir no momento da consulta, o agente deve consultar diretamente as páginas disponíveis em `docs/wiki/`.

## Hierarquia de Fonte de Verdade

1. **Instrução explícita atual do usuário:**
   Define a intenção e objetivo da tarefa.
2. **`AGENTS.md`:**
   Contém regras obrigatórias do projeto e restrições de trabalho.
3. **Código-fonte e arquivos de configuração atuais:**
   Representam a verdade sobre o que está efetivamente implementado.
4. **ADRs e páginas detalhadas da Wiki:**
   Representam decisões arquiteturais, contexto de produto, planejamento e documentação técnica.
5. **`docs/wiki/SUMMARY.md`:**
   Funciona como índice operacional e mapa de navegação, mas NÃO substitui a leitura da página detalhada relevante.

## Conflitos entre Código e Wiki

Se o agente encontrar divergência entre a Wiki e o código:
- Não deve ignorar a divergência;
- Não deve escolher silenciosamente um dos lados;
- Deve verificar qual estado é o atual no código e configuração;
- Deve executar a tarefa com base no estado confirmado;
- Deve atualizar a documentação afetada quando o escopo da tarefa permitir;
- Se não puder resolver a divergência de imediato, deve registrá-la claramente para o usuário.

## Regra Obrigatória Pós-Tarefa (Documentation Check)

Uma tarefa que altere:
- gameplay;
- comportamento;
- arquitetura;
- componentes;
- UX;
- design system;
- dependências;
- persistência;
- backend futuro;
- testes;
- build/deploy;
- roadmap;
- decisões de produto;
- documentação acadêmica/pedagógica;

NÃO deve ser considerada concluída até que o agente verifique se a Wiki precisa ser atualizada.

Após qualquer mudança relevante, o agente deve:
1. Revisar as páginas da Wiki afetadas;
2. Atualizar a documentação quando necessário;
3. Atualizar `docs/wiki/SUMMARY.md` se a mudança afetar estado atual, arquitetura, prioridades, riscos, roadmap ou funcionalidades implementadas;
4. Criar ou atualizar um ADR em `docs/adr/` quando houver decisão arquitetural relevante;
5. Informar explicitamente ao usuário quais arquivos de código e documentação foram alterados.

**Princípio operacional contínuo:**
$$\text{LER A WIKI} \longrightarrow \text{ENTENDER O CONTEXTO} \longrightarrow \text{VERIFICAR O CÓDIGO} \longrightarrow \text{EXECUTAR} \longrightarrow \text{ATUALIZAR A WIKI}$$

React + Vite + Tailwind CSS project running inside Figma Make.

Development Server

A Vite development server is already running on $PORT (default 8443). You don't need to start it manually.

Preview URL: The user can access the running app through the preview panel

Hot reload: Changes to source files are reflected immediately

Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

src/main.tsx - React entrypoint; imports src/index.css and mounts src/App.tsx into the #root element

src/App.tsx - Primary application component and the usual starting point for UI work

src/index.css - Global CSS entrypoint and Tailwind CSS v4 import

index.html - Vite HTML shell containing the #root element and loading src/main.tsx

package.json - Project dependencies and the Vite build, development, preview, and formatting scripts

vite.config.ts - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the @ alias for src

.mise.toml - Toolchain versions for Node.js and pnpm

Dependencies

Runtime: React 19 and React DOM 19

Styling: Tailwind CSS v4 with the @tailwindcss/vite plugin

Build tooling: Vite 8, TypeScript 5.7, and @vitejs/plugin-react

Formatting: oxfmt

Styling

This project uses Tailwind CSS v4 through the @tailwindcss/vite plugin configured in vite.config.ts. src/index.css imports Tailwind with @import 'tailwindcss';. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in src/index.css. This scaffold does not need a Tailwind config file or PostCSS config.

src/main.tsx imports src/index.css, so global font wiring belongs in src/index.css. Keep CSS @import statements first, then add any @font-face rules and font-family defaults there.

Code quality

Use double quotes for strings containing apostrophes ("We're here to help"), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.

Ensure JSX tags are closed and braces are balanced.

Export components as default exports.