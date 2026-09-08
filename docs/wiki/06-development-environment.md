# 06 — Ambiente de Desenvolvimento e Operação no Figma Make

> **Documento canônico:** Guia operacional, especificação de infraestrutura, ciclo de vida do servidor, scripts e regras de conformidade técnica do **Sorting Station**.  
> **Status:** Ativo / Base de Verdade da Wiki  
> **Data:** 08/09/2026  
> **Dependências:** [`AGENTS.md`](../../AGENTS.md), [`CLAUDE.md`](../../CLAUDE.md), [`package.json`](../../package.json), [`.mise.toml`](../../.mise.toml), [`vite.config.ts`](../../vite.config.ts), [`.figma/make/*`](../../.figma/make).

---

## 1. Visão Geral do Ambiente

O **Sorting Station** opera como uma aplicação web moderna conteinerizada dentro da infraestrutura do **Figma Make**. A plataforma provê um servidor de desenvolvimento gerenciado em segundo plano, garantindo recarregamento a quente (*Hot Module Replacement — HMR*), sandbox de execução isolada e deploy automatizado para painéis de pré-visualização.

---

## 2. Toolchain e Gestão de Versões

O projeto utiliza o arquivo de configuração [`.mise.toml`](../../.mise.toml) para fixar as versões exatas do runtime e do gerenciador de pacotes:

```toml
# .mise.toml
[tools]
node = "22"
"npm:pnpm" = "10.34.3"
```

- **Node.js 22 (LTS):** Ambiente de execução do servidor de desenvolvimento e scripts de automação.
- **pnpm 10.34.3:** Gerenciador de dependências eficiente com armazenamento endereçado por conteúdo (*content-addressable store*). No ambiente Windows local onde o executável `pnpm` não estiver no `PATH` global, os comandos `npm` e `npx` podem ser utilizados de forma transparente como alternativa de terminal.

---

## 3. Dependências do Projeto ([`package.json`](../../package.json))

### 3.1. Dependências de Produção (Runtime)
- **`react` (`^19.0.0`) & `react-dom` (`^19.0.0`):** Biblioteca declarativa de interfaces e renderizador DOM oficial na versão mais recente.

### 3.2. Dependências de Desenvolvimento (Build & Tooling)
- **`vite` (`^8.0.5`):** Servidor de desenvolvimento rápido e bundler de produção baseado em Rollup e esbuild.
- **`@vitejs/plugin-react` (`^4.3.4`):** Integração oficial do React com o Vite, provendo suporte a Fast Refresh.
- **`tailwindcss` (`^4.0.0`) & `@tailwindcss/vite` (`^4.0.0`):** Compilador oficial do Tailwind CSS v4 operando como plugin nativo do Vite.
- **`typescript` (`^5.7.2`):** Tipagem estática e verificação estrutural de código.
- **`@types/node`, `@types/react`, `@types/react-dom`:** Definições de tipagem para as APIs fundamentais.
- **`oxfmt` (`^0.2.1`):** Formatador de código ultrarrápido baseado em Rust (projeto Oxlint/Biome).

---

## 4. Scripts Operacionais do `package.json`

O arquivo [`package.json`](../../package.json) expõe os comandos padrão:

| Comando | Execução | Propósito |
| :--- | :--- | :--- |
| `npm run dev` / `pnpm run dev` | `vite` | Inicia o servidor local de desenvolvimento com HMR ativo |
| `npm run build` / `pnpm run build` | `vite build` | Compila os artefatos otimizados de produção para a pasta `dist/` |
| `npm run preview` / `pnpm run preview`| `vite preview` | Sobe servidor local para inspecionar os artefatos compilados de `dist/` |
| `npm run format` / `pnpm run format` | `oxfmt` | Formata o código do repositório em conformidade com as regras de estilo |

---

## 5. Arquitetura do Servidor no Figma Make

No ecossistema do Figma Make, o servidor de desenvolvimento **já está em execução de forma contínua** ([`AGENTS.md`](../../AGENTS.md)). O desenvolvedor **não precisa nem deve** tentar iniciar o servidor manualmente com `npm run dev` em tarefas interativas normais.

### 5.1. Variáveis de Ambiente Críticas ([`vite.config.ts`](../../vite.config.ts))

```typescript
// vite.config.ts:L27-L37
server: {
  port: Number(process.env.PORT || 8443),
  strictPort: true,
  host: process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0',
  hmr: process.env.FIGMA_PUBLIC_URL
    ? {
        host: new URL(process.env.FIGMA_PUBLIC_URL).hostname,
        clientPort: 443,
      }
    : undefined,
},
```

- **`PORT` (Default: `8443`):** Porta TCP em que o processo do Vite aguarda conexões. A flag `strictPort: true` impede que o Vite alterne arbitrariamente para 8444 ou 8445 se a 8443 estiver ocupada, o que quebraria o proxy do Figma Make.
- **`FIGMA_DEV_SERVER_HOST` (Default: `'0.0.0.0'`):** Garante que o servidor faça bind em todas as interfaces de rede do contêiner, permitindo a comunicação reversa entre a máquina virtual e a interface do Figma.
- **`FIGMA_PUBLIC_URL`:** URL pública segura através da qual o cliente no navegador acessa o app. O Vite reconfigura o cliente HMR para conectar via WebSocket na porta segura `443` e no hostname indicado por essa variável.
- **Hot Module Replacement (HMR):** Quaisquer alterações salvas em arquivos sob `src/` são imediatamente refletidas no painel de visualização sem perda do estado React em componentes compatíveis.

---

## 6. Scripts e Configurações de `.figma/make/*`

A pasta [`.figma/make/`](../../.figma/make) contém os pontos de integração direta com os ciclos de automação do Figma Make:

### 6.1. Monitoramento de Dependências: `dev.json` ([`.figma/make/dev.json`](../../.figma/make/dev.json))
```json
{
  "command": "pnpm run dev",
  "installOn": ["package.json", "pnpm-lock.yaml"]
}
```
A diretiva `"installOn"` monitora alterações em `package.json` ou `pnpm-lock.yaml`. Sempre que um desses arquivos for alterado, o ambiente do Figma Make dispara automaticamente o script de instalação de pacotes.

### 6.2. Scripts Shell do Ciclo de Vida
- **`.figma/make/dev`:** Script executável que aciona `exec pnpm run dev`.
- **`.figma/make/install`:** Script executável que aciona `exec pnpm install`.
- **`.figma/make/format`:** Script executável que invoca `exec pnpm run format`.
- **`.figma/make/deploy` & `.figma/make/deploy-preview`:** Executam `pnpm run build` e compactam o diretório `dist/` gerado no arquivo `dist.tar.gz` (`tar -czf dist.tar.gz -C dist .`) para implantação no CDN de pré-visualização.
- **`.figma/make/langserver`:** Inicializa o servidor de linguagem TypeScript/JavaScript (`npx @vtsls/language-server --stdio`) para suporte de IntelliSense e autocompletion no editor embutido.
- **`.figma/make/analyze-routes`:** Retorna um array JSON vazio `[]` indicando ao Figma Make que o projeto é uma SPA sem rotas de arquivo baseadas em páginas.

### 6.3. Metadados e SEO em `site.json` ([`.figma/make/site.json`](../../.figma/make/site.json))
```json
{
  "title": "Click&Order",
  "robots": {
    "index": false
  },
  "a11y": {
    "addBypassLinks": false,
    "ignoreReducedMotion": false
  }
}
```
- **`"robots": { "index": false }` (noindex):** Configuração obrigatória para evitar indexação pública em motores de busca (Google, Bing) durante os ciclos de desenvolvimento e prototipagem no Figma Make. O plugin `figmaSiteConfiguration` lê essa chave e injeta automaticamente `<meta name="robots" content="noindex, nofollow" />` no HTML ([`vite.config.ts`](../../vite.config.ts)).

---

## 7. Plugins Exclusivos do Figma Make em `vite.config.ts`

O arquivo [`vite.config.ts`](../../vite.config.ts) estende o Vite com 4 plugins customizados vitais para a plataforma:

1. **`figmaSiteConfiguration()` ([`vite.config.ts`](../../vite.config.ts)):**  
   Lê `.figma/make/site.json` e substitui marcadores presentes em `index.html` (`<!-- figma:head-start -->`, `<!-- figma:body-end -->`, etc.) por tags meta, diretivas de robôs e scripts de acessibilidade.
2. **`figmaErrorOverlayReplay()` ([`vite.config.ts`](../../vite.config.ts)):**  
   Captura erros de build e de tempo de execução (runtime errors) e os transmite via `postMessage` para a camada de visualização do Figma, permitindo que falhas sejam exibidas visualmente no painel do usuário.
3. **`figmaReactRefreshBoundaryFallback()` ([`vite.config.ts`](../../vite.config.ts)):**  
   Intercepta erros de limite de atualização do React Fast Refresh, forçando um recarregamento completo da página se um componente quebrar durante a edição dinâmica.
4. **`figmaMakeKitPlugin()` ([`vite.config.ts`](../../vite.config.ts)):**  
   Injeta a biblioteca interna de suporte e utilitários da plataforma Figma Make.

---

## 8. Arquitetura de Build, Artefatos e Sourcemaps

- **Diretório de Destino (`dist/`):**  
  A compilação de produção via `npm run build` gera a pasta `dist/` contendo arquivos estáticos com hashing para invalidação de cache (ex.: `assets/index-[hash].js`, `assets/index-[hash].css`) e `index.html`.
- **Estratégia de Sourcemaps ([`vite.config.ts`](../../vite.config.ts)):**  
  ```typescript
  sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,
  ```
  Em ambiente de desenvolvimento e pré-visualização, os mapas de código são gerados como `inline` para permitir depuração direta das linhas de código TypeScript original no console do navegador. Em builds finais de produção, são desativados para máxima redução de peso dos pacotes.
- **Path Alias `@/` ([`vite.config.ts`](../../vite.config.ts) e [`tsconfig.json`](../../tsconfig.json)):**  
  O símbolo `@` mapeia de forma absoluta para a raiz do diretório `src/`, eliminando caminhos relativos frágeis (como `../../components/NumberedBox`).

---

## 9. Estilização Moderna: Tailwind CSS v4 sem Arquivos Legados

O projeto utiliza o ecossistema do **Tailwind CSS v4** ([`AGENTS.md`](../../AGENTS.md)):
- **Sem `tailwind.config.js`:** Toda a parametrização de cores e fontes é feita via `@theme inline` dentro de [`src/index.css`](../../src/index.css).
- **Sem `postcss.config.js`:** O plugin `@tailwindcss/vite` processa a folha de estilos diretamente no pipeline do Vite, garantindo compilações instantâneas inferiores a 300ms.
- **Entrada Única:** A folha [`src/index.css`](../../src/index.css) inicia com `@import url(...)` das fontes e `@import 'tailwindcss';` na linha 4.

---

## 10. Regras de Código Mandatórias ([`AGENTS.md`](../../AGENTS.md))

Para garantir a estabilidade do build e do interpretador JSX do Vite:

1. **Strings e Apóstrofos ([`AGENTS.md`](../../AGENTS.md)):**  
   Utilize sempre aspas duplas em strings literais que contenham apóstrofos (ex.: `"Don't do that"`, `"We're here"`). O uso de apóstrofo em aspas simples não escapadas (`'Don't'`) quebra o parser e interrompe a compilação.
2. **Fechamento Estrito de Tags JSX e Chaves ([`AGENTS.md`](../../AGENTS.md)):**  
   Todas as tags devem ser auto-fechadas (`<Component />`) ou fechadas explicitamente (`</Component>`), com balanceamento rigoroso de chaves `{}`.
3. **Padrão Obrigatório de Exportação (`export default`) ([`AGENTS.md`](../../AGENTS.md)):**  
   Todos os componentes React em `src/screens/` e `src/components/` devem ser exportados utilizando `export default function ComponenteName()`.

---

## 11. Protocolo de Validação de Build

Antes de considerar qualquer alteração de código ou documentação concluída, o desenvolvedor deve executar a rotina de validação em duas etapas no terminal:

```powershell
# 1. Validação de compilação estática de produção
npm run build

# 2. Verificação estrita de tipagem TypeScript
npx tsc --noEmit
```

### Checklist de Aprovação:
- [ ] `npm run build` gerou os bundles estáticos com código de saída 0 (`built in ~300ms`).
- [ ] `npx tsc --noEmit` completou com 0 erros de tipagem.
- [ ] A pasta temporária de teste `dist/` foi removida após a validação para manter a raiz do repositório limpa (`Remove-Item -Recurse -Force dist`).

---

## 12. Arquivos Sensíveis do Ambiente Figma Make

> [!CAUTION]
> **Aviso de Preservação Estrutural:**  
> Os seguintes arquivos e blocos de código são **essenciais para a operação da aplicação na infraestrutura do Figma Make**:
> - Todos os scripts e arquivos de configuração contidos em [`.figma/make/*`](../../.figma/make) (`dev`, `install`, `format`, `deploy`, `deploy-preview`, `langserver`, `analyze-routes`, `dev.json`, `site.json`);
> - As configurações de servidor (`port: 8443`, `strictPort: true`, `host: FIGMA_DEV_SERVER_HOST`, `hmr: FIGMA_PUBLIC_URL`) e os 4 plugins customizados (`figmaSiteConfiguration`, `figmaErrorOverlayReplay`, `figmaReactRefreshBoundaryFallback`, `figmaMakeKitPlugin`) em [`vite.config.ts`](../../vite.config.ts);
> - As marcações de injeção `<!-- figma:* -->` em [`index.html`](../../index.html).
> 
> **Estes componentes NUNCA devem ser removidos, renomeados ou simplificados** sem um motivo técnico formalmente documentado e aprovado. A exclusão de qualquer um deles resultará na perda de conexão com o painel de visualização e em falha imediata nos deploys do Figma Make.
