# Sorting Station — HARNESS para construção da Wiki

## 1. Objetivo deste HARNESS

Este conjunto de prompts deve ser executado, de preferência na ordem, por um agente com acesso ao repositório do projeto **Sorting Station**. O objetivo é criar uma Wiki técnica e de produto confiável, rastreável ao código atual e preparada para acompanhar a evolução do jogo.

Regra central: a Wiki deve separar claramente **Estado atual**, **Problemas/limitações atuais**, **Decisões planejadas** e **Ideias futuras**. Não apresentar ideias futuras como se já estivessem implementadas.

---

## 2. Resumo consolidado do projeto

### Visão do produto

**Sorting Station** é um jogo educacional point-and-click para navegador cujo objetivo é ensinar algoritmos de ordenação por meio de interação direta. A ambientação é uma central logística futurista: caixas numeradas representam elementos de um vetor e o jogador executa comparações e trocas para organizar as encomendas.

A intenção pedagógica não é apenas permitir que o jogador "ordene números", mas fazê-lo acompanhar e executar o comportamento real do algoritmo ensinado, conectando:

**ação do jogador → representação visual → execução do algoritmo → pseudocódigo → feedback**.

### MVP atual

O protótipo atual é um front-end React/TypeScript criado no ecossistema Figma Make. O fluxo principal é:

`HomeScreen → TutorialScreen → GameScreen → ResultScreen`

O algoritmo atualmente apresentado é **Bubble Sort**, com três fases definidas em `src/App.tsx`:

- Fase 1: `[5, 2, 4, 1]`
- Fase 2: `[6, 3, 8, 2, 5]`
- Fase 3: `[9, 1, 7, 4, 3, 6]`

O jogador pode selecionar duas caixas vizinhas; o jogo contabiliza uma comparação e troca os valores se o da esquerda for maior. Há contador de comparações, trocas, dica, reinício, progresso visual e tela de resultado com pseudocódigo.

### Limitação conceitual mais importante do protótipo atual

A lógica atual permite que o jogador escolha **qualquer par adjacente** a qualquer momento. Isso produz um jogo de ordenação, mas não força a execução passo a passo do Bubble Sort.

A evolução prioritária é transformar a lógica em uma máquina de estados que controle:

- passada atual do Bubble Sort;
- índice atual de comparação;
- par de posições esperado;
- decisão de trocar ou não trocar;
- avanço para a próxima comparação;
- término de uma passada;
- elementos definitivamente posicionados;
- progresso real do algoritmo.

O jogador deve executar o algoritmo, e não apenas chegar ao vetor ordenado por qualquer sequência válida de trocas adjacentes.

### Stack atual confirmada no repositório

- React 19
- React DOM 19
- TypeScript 5.7
- Vite 8
- Tailwind CSS v4
- `@tailwindcss/vite`
- `@vitejs/plugin-react`
- oxfmt
- Node.js 22
- pnpm 10.34.3
- Figma Make

Não existe backend no estado atual do projeto.

### Arquitetura atual de alto nível

- `src/main.tsx`: entrada React e importação do CSS global.
- `src/App.tsx`: controla a tela atual, fase atual e resultado da fase.
- `src/screens/HomeScreen.tsx`: tela inicial e apresentação do jogo.
- `src/screens/TutorialScreen.tsx`: tutorial animado do Bubble Sort.
- `src/screens/GameScreen.tsx`: estado e lógica de gameplay atual.
- `src/screens/ResultScreen.tsx`: resultado, estatísticas e pseudocódigo.
- `src/components/GameButton.tsx`: botão reutilizável.
- `src/components/NumberedBox.tsx`: caixa numerada interativa.
- `src/components/StatsPanel.tsx`: comparações e trocas.
- `src/components/InstructionPanel.tsx`: feedback textual por tipo.
- `src/components/PhaseHeader.tsx`: protocolo, fase e status.
- `src/index.css`: Tailwind, fontes, tokens visuais, efeitos e animações.

### Estado técnico atual relevante

- Navegação feita por estado local em `App.tsx`; não há React Router.
- Não há persistência (`localStorage`, banco ou API).
- Não há autenticação.
- Não há testes automatizados no repositório.
- Não há backend.
- O estado do jogo reside no front-end.
- O progresso exibido hoje é heurístico, não representa o número real de passos do Bubble Sort.
- A métrica de “eficiência” da tela de resultado é uma fórmula visual baseada em número de trocas e não uma métrica acadêmica validada.
- O botão de próxima fase precisa de regra especial ao finalizar a última fase.
- A animação de troca e a lógica de elementos “OK” devem ser revistas quando a máquina de estados real for implementada.

---

## 3. Regras e ferramentas do ambiente Figma Make que a Wiki deve registrar

Estas regras são derivadas dos arquivos do próprio projeto, especialmente `AGENTS.md`, `.mise.toml`, `.figma/make/*`, `vite.config.ts` e `src/index.css`.

### Desenvolvimento

- No Figma Make, o servidor Vite já é iniciado pelo ambiente e usa `$PORT`, com padrão `8443`.
- Hot reload/HMR deve refletir alterações de código sem reinício manual em condições normais.
- `.figma/make/dev` executa `pnpm run dev`.
- `.figma/make/install` executa `pnpm install --prefer-offline --no-frozen-lockfile`.
- `package.json` e `pnpm-lock.yaml` disparam reinstalação/restart conforme `.figma/make/dev.json`.

### Build/deploy

- Build: `pnpm run build`.
- Preview: `pnpm run preview`.
- Deploy Figma Make: build em `dist` seguido de `figma make deploy --build-dir dist`.
- Deploy preview: build em modo development para sourcemaps e `figma make deploy-preview --build-dir dist`.

### Styling

- Tailwind CSS v4 é integrado pelo plugin `@tailwindcss/vite`.
- `src/index.css` importa Tailwind via `@import 'tailwindcss';`.
- O scaffold não necessita `tailwind.config.*` nem PostCSS config.
- Utilidades Tailwind devem ser preferidas diretamente no JSX.
- CSS global e customização de tema Tailwind v4 ficam em `src/index.css`.
- Imports CSS devem vir antes de regras `@font-face` e padrões globais de fonte.
- As fontes atuais são Orbitron, Space Mono e Exo 2 via Google Fonts.

### Convenções de código documentadas

- Componentes devem ser exportados como `default export`.
- Fechar corretamente tags JSX e manter chaves balanceadas.
- Strings com apóstrofos devem usar aspas duplas ou apóstrofo escapado para evitar quebra de build.
- TypeScript está em modo `strict`.
- `noFallthroughCasesInSwitch` está habilitado.
- Alias `@/*` aponta para `src/*`.
- Formatação usa oxfmt (`pnpm run format`).

### Configuração Figma/Vite

- `base` usa `FIGMA_PUBLIC_URL` quando definido.
- Host usa `FIGMA_DEV_SERVER_HOST` ou `0.0.0.0`.
- Porta usa `PORT` ou `8443`.
- `strictPort: true`.
- Figma Make injeta plugins próprios de site config, replay do error overlay, fallback de React Refresh e Make Kit.
- `.figma/make/site.json` atualmente impede indexação (`robots.index = false`).
- A descrição atual apresenta o app como jogo web educacional de algoritmos de ordenação.

### Regra de segurança para manutenção

Arquivos de infraestrutura Figma Make (`.figma/make/*` e plugins específicos em `vite.config.ts`) não devem ser simplificados, removidos ou reescritos apenas por preferência estética. Alterá-los somente quando houver necessidade técnica clara e documentar o motivo.

---

## 4. Planejamento de produto e ideias futuras

### Prioridade P0 — transformar Bubble Sort em experiência pedagógica real

1. Implementar máquina de estados do Bubble Sort.
2. Controlar `passIndex` / passada atual.
3. Controlar `comparisonIndex` / posição atual.
4. Destacar apenas o par que deve ser analisado.
5. Impedir comparação fora da sequência prevista.
6. Fazer o jogador decidir corretamente entre “trocar” e “não trocar”, ou selecionar o par e confirmar a operação.
7. Exibir feedback contextual, por exemplo:
   - `5 > 2 → troca necessária`;
   - `2 ≤ 4 → nenhuma troca necessária`.
8. Marcar elementos que chegaram à posição definitiva ao fim de cada passada.
9. Mostrar `PASSADA X/Y` e `COMPARAÇÃO X/Y`.
10. Calcular progresso real com base nos passos executados.
11. Registrar histórico de operações da fase.
12. Corrigir animações de troca para os índices efetivamente comparados.
13. Rever a regra visual de “OK/sorted”.
14. Finalizar corretamente a campanha ao concluir a última fase.

### Prioridade P1 — fortalecer o Bubble Sort

- Tutorial interativo em vez de apenas animação passiva.
- Sistema de dicas que aponte o próximo passo correto, não apenas a próxima inversão encontrada.
- Replay da execução completa ao final da fase.
- Linha do tempo das comparações/trocas.
- Ligação entre a ação atual e a linha relevante do pseudocódigo.
- Explicação de por que uma troca acontece ou não.
- Feedback de erro sem punir excessivamente o estudante.
- Contagem de erros/tentativas.
- Pontuação baseada em precisão, dicas e erros.
- Tempo pode existir futuramente, mas não deve ser prioridade inicial.

### Prioridade P2 — novos algoritmos

#### Selection Sort

Mecânica proposta: identificar o menor elemento da região ainda não ordenada e posicioná-lo no início dessa região. A interface deve tornar visível a fronteira entre parte ordenada e não ordenada.

#### Insertion Sort

Mecânica proposta: retirar/selecionar o próximo elemento da região não ordenada e escolher sua posição correta dentro da região já ordenada.

Importante: Selection e Insertion não devem ser apenas “skins” do mesmo gameplay do Bubble Sort. Cada algoritmo deve ter uma mecânica que represente sua lógica própria.

### Prioridade P3 — expansão acadêmica/técnica

- Merge Sort.
- Quick Sort.
- Heap Sort.
- Comparação visual entre algoritmos.
- Modo demonstração automática.
- Modo desafio sem dicas.
- Visualização de complexidade e número de operações.
- Dificuldade progressiva e vetores maiores.

### Narrativa e UX

- Manter a fantasia de “central logística futurista”.
- Cada algoritmo pode ser tratado como um “protocolo” da estação.
- Bubble Sort = Protocolo Bubble.
- Selection Sort = Protocolo Selection.
- Insertion Sort = Protocolo Insertion.
- Progressão por setores/turnos da estação.
- Caixas numeradas representam pacotes/prioridades.
- O jogo deve continuar parecendo jogo, não dashboard corporativo.

### Persistência futura sem backend

Antes de adicionar servidor, considerar `localStorage` para:

- fase liberada;
- melhor resultado;
- tutorial concluído;
- preferências básicas;
- estatísticas locais.

### Backend futuro — somente se houver necessidade real

Não existe backend hoje. Um backend só deve entrar quando requisitos justificarem sua complexidade, como:

- contas de usuário;
- sincronização de progresso entre dispositivos;
- telemetria de aprendizagem;
- resultados de avaliação;
- rankings;
- turmas/professores;
- painel acadêmico/analytics;
- armazenamento centralizado de tentativas.

Se isso acontecer, a Wiki deve registrar a decisão em ADR antes da implementação e definir API, autenticação, persistência, privacidade e modelo de dados.

### Relação com o artigo acadêmico

O jogo está sendo desenvolvido também como base de um artigo acadêmico sobre ensino de algoritmos de ordenação com uma experiência point-and-click. O desenvolvimento real deve alimentar futuramente as seções de metodologia, desenvolvimento e avaliação do artigo. Não inventar resultados acadêmicos antes de avaliação real.

Ideia de avaliação futura: pequeno teste com estudantes, possivelmente com escala Likert e perguntas de compreensão/usabilidade. Essa ideia é planejamento, não resultado atual.

---

# PROMPTS PARA O AGENTE QUE VAI CONSTRUIR A WIKI

## PROMPT 00 — Inventário e verdade do repositório

```text
Você está trabalhando no repositório do jogo educacional Sorting Station.

OBJETIVO
Antes de escrever qualquer documentação extensa, faça um inventário técnico do repositório e crie a base de verdade da Wiki.

REGRAS OBRIGATÓRIAS
1. Leia AGENTS.md e CLAUDE.md antes de qualquer outra decisão.
2. Inspecione package.json, .mise.toml, vite.config.ts, tsconfig.json, .figma/make/*, src/main.tsx, src/App.tsx, src/index.css, todas as telas e todos os componentes usados por elas.
3. Não altere código funcional nesta tarefa.
4. Não invente backend, banco, API, testes ou bibliotecas que não existam.
5. Separe explicitamente:
   - Implementado agora;
   - Limitações/dívida técnica observável;
   - Planejado;
   - Ideias futuras.
6. Para cada afirmação sobre o código, cite o caminho do arquivo responsável.
7. Quando houver dúvida, escreva “não confirmado no repositório” em vez de inferir como fato.
8. Preserve todas as regras específicas do Figma Make encontradas no repositório.

ENTREGA
Crie:
- docs/wiki/00-repository-inventory.md

O arquivo deve conter:
- visão geral;
- árvore resumida do projeto;
- stack e versões;
- scripts disponíveis;
- ponto de entrada;
- fluxo de telas;
- componentes principais;
- onde está a lógica de gameplay;
- estado/persistência atual;
- integrações Figma Make;
- backend: existente ou inexistente;
- testes: existentes ou inexistentes;
- riscos e pontos que precisam ser confirmados.

No final, inclua uma seção “Fonte de verdade” com os arquivos que devem ser consultados primeiro em futuras tarefas.
```

---

## PROMPT 01 — Visão de produto e escopo

```text
Leia primeiro AGENTS.md, CLAUDE.md e docs/wiki/00-repository-inventory.md.

Crie docs/wiki/01-product-vision.md para o Sorting Station.

CONTEXTO DE PRODUTO
Sorting Station é um jogo educacional point-and-click para navegador. O jogador atua em uma central logística futurista e organiza caixas numeradas seguindo algoritmos de ordenação. O objetivo pedagógico é conectar ação do jogador, visualização da execução, feedback e pseudocódigo.

ESTADO ATUAL
- Bubble Sort é o algoritmo do protótipo atual.
- Existem três fases iniciais.
- O fluxo atual é Home → Tutorial → Game → Result.
- Selection Sort e Insertion Sort aparecem como direção futura, não como implementação concluída.

OBJETIVO DA DOCUMENTAÇÃO
Descrever com clareza:
- problema educacional que o produto pretende atacar;
- proposta de valor;
- público-alvo inicial;
- fantasia/narrativa da central logística;
- princípios de gameplay;
- o que faz o produto ser point-and-click;
- objetivo pedagógico do MVP;
- escopo do MVP;
- não-objetivos do MVP;
- critérios de sucesso técnicos e de experiência;
- diferenciação entre “ordenar números” e “executar um algoritmo de ordenação”.

REGRAS
- Não alegue melhora de aprendizagem como resultado comprovado.
- Use linguagem de objetivo/proposta para efeitos pedagógicos ainda não avaliados.
- Diferencie claramente presente e futuro.
- Não invente funcionalidades.

Inclua uma seção final “Princípios de produto” com 5 a 10 regras que futuras decisões de design devem respeitar.
```

---

## PROMPT 02 — Arquitetura geral do sistema

```text
Leia AGENTS.md, CLAUDE.md, docs/wiki/00-repository-inventory.md e o código atual.

Crie docs/wiki/02-system-architecture.md.

DOCUMENTE O ESTADO ATUAL, NÃO UMA ARQUITETURA IDEAL INVENTADA.

Inclua:
1. diagrama textual/mermaid do fluxo atual do front-end;
2. bootstrap React (`index.html` → `src/main.tsx` → `src/App.tsx`);
3. navegação por estado em App.tsx;
4. fluxo de dados entre App, GameScreen e ResultScreen;
5. onde vivem arrays de fase e resultado;
6. onde vive a lógica atual do Bubble Sort/gameplay;
7. componentes reutilizáveis;
8. CSS/tema/animações;
9. ausência atual de backend;
10. ausência atual de persistência;
11. ausência atual de router, se confirmado;
12. ausência atual de testes, se confirmado.

Depois crie uma seção separada chamada “Arquitetura alvo — planejada” explicando a evolução recomendada SEM IMPLEMENTAR:
- separar domínio do algoritmo da camada visual;
- criar engine/máquina de estados de ordenação;
- representar passos/comparações/trocas como dados;
- permitir Bubble, Selection e Insertion por estratégias/módulos separados;
- tornar a UI consumidora de um estado de jogo bem definido;
- manter backend opcional.

Para cada item planejado, marque explicitamente como PLANEJADO.
```

---

## PROMPT 03 — Wiki completa do Front-end

```text
Leia AGENTS.md, CLAUDE.md, docs/wiki/00-repository-inventory.md, docs/wiki/02-system-architecture.md e todo o conteúdo de src/.

Crie docs/wiki/03-frontend.md.

A documentação deve funcionar como manual para um novo desenvolvedor.

Cubra:
- React 19 + TypeScript + Vite;
- Tailwind CSS v4;
- estrutura de `src`;
- responsabilidades de App.tsx;
- HomeScreen;
- TutorialScreen;
- GameScreen;
- ResultScreen;
- GameButton;
- NumberedBox;
- StatsPanel;
- InstructionPanel;
- PhaseHeader;
- props principais;
- estado relevante;
- fluxo de callbacks;
- convenções de componentes;
- padrão de default export exigido pelo AGENTS.md;
- alias `@`;
- TypeScript strict;
- regras de strings/apóstrofos, JSX fechado e braces balanceadas;
- uso de Tailwind em JSX;
- quando usar src/index.css;
- fontes Orbitron, Space Mono e Exo 2;
- tokens/cores e classes utilitárias customizadas existentes;
- animações existentes;
- responsividade atual e riscos de layouts com vetores maiores;
- acessibilidade observável e lacunas, sem inventar compliance.

Inclua uma tabela “Componente → responsabilidade → props → consumidores”.

Inclua também “Padrões para novas telas/componentes” e “Anti-padrões a evitar”.
```

---

## PROMPT 04 — Domínio e engine de algoritmos

```text
Leia a Wiki existente e inspecione principalmente src/screens/GameScreen.tsx, src/App.tsx e src/components/NumberedBox.tsx.

Crie docs/wiki/04-sorting-engine.md.

PARTE A — ESTADO ATUAL
Documente exatamente como a lógica atual funciona:
- seleção de primeira caixa;
- seleção de segunda caixa;
- validação de adjacência;
- incremento de comparação;
- troca quando esquerda > direita;
- detecção de vetor ordenado;
- dica atual;
- reset;
- progresso atual;
- marcação atual de caixas sorted/OK;
- animação atual.

Aponte claramente que o usuário atualmente pode escolher qualquer par adjacente e, portanto, a execução não é uma simulação estrita da sequência do Bubble Sort.

PARTE B — ENGINE PLANEJADA
Especifique uma máquina de estados pedagógica para Bubble Sort, sem alterar código nesta tarefa.

O modelo deve considerar pelo menos:
- array atual;
- array inicial;
- passIndex;
- comparisonIndex;
- currentPair;
- totalComparisons possíveis;
- comparisonsCompleted;
- swaps;
- errors;
- hintsUsed;
- sortedBoundary;
- history de passos;
- status da fase;
- mensagem/feedback derivável do estado.

Defina transições como:
- iniciar fase;
- selecionar/comparar par esperado;
- decisão correta de troca;
- decisão correta de não troca;
- ação incorreta;
- avançar comparação;
- encerrar passada;
- encerramento antecipado se uma passada não tiver trocas (quando aplicável e pedagogicamente desejado);
- concluir fase;
- resetar;
- solicitar dica.

Inclua pseudocódigo e um exemplo completo com [5,2,4,1].

PARTE C — EXPANSÃO
Descreva como Selection Sort e Insertion Sort devem ter engines/regras próprias, sem fingir que já existem.

Princípio obrigatório: algoritmos diferentes não devem ser apenas o mesmo gameplay renomeado.
```

---

## PROMPT 05 — UX, design system e narrativa

```text
Leia src/index.css, todas as telas e componentes visuais. Leia também docs/wiki/01-product-vision.md.

Crie docs/wiki/05-ux-design-system.md.

Documente o sistema visual EXISTENTE:
- estética futurista/logística;
- central logística;
- caixas/pacotes;
- esteiras;
- linguagem “PROTOCOLO”, “FASE”, “SISTEMA ATIVO”;
- paleta e tokens existentes em @theme;
- Orbitron, Space Mono e Exo 2;
- glow, scanlines, grid, starfield, conveyor, panel-border;
- estados visuais de NumberedBox;
- variantes de GameButton;
- tipos de InstructionPanel;
- feedback success/warning/error/info;
- animações de swap/pulse.

Depois documente princípios futuros:
- jogo deve parecer jogo, não dashboard corporativo;
- interação principal sempre compreensível por clique;
- par atual deve ser visualmente evidente;
- parte já ordenada deve ter codificação consistente;
- feedback deve explicar o motivo da operação;
- pseudocódigo pode acompanhar visualmente o passo atual;
- vetores maiores precisam de estratégia responsiva;
- respeitar prefers-reduced-motion;
- não depender exclusivamente de cor para transmitir estado.

Crie uma seção “Vocabulário da interface” para manter consistência textual.
```

---

## PROMPT 06 — Ambiente de desenvolvimento e Figma Make

```text
Leia AGENTS.md, CLAUDE.md, package.json, .mise.toml, .figma/make/*, vite.config.ts, tsconfig.json, index.html e src/index.css.

Crie docs/wiki/06-development-environment.md.

Esta página deve ser a referência operacional do projeto.

Documente:
- Node 22;
- pnpm 10.34.3;
- dependências relevantes;
- comandos package.json;
- comportamento do servidor no Figma Make;
- PORT padrão 8443;
- FIGMA_DEV_SERVER_HOST;
- FIGMA_PUBLIC_URL;
- HMR;
- installOn de .figma/make/dev.json;
- scripts .figma/make/dev, install, format, deploy e deploy-preview;
- build em dist;
- sourcemaps em preview development;
- plugins Figma presentes em vite.config.ts;
- alias @;
- Tailwind v4 sem tailwind.config/PostCSS;
- oxfmt;
- regras de código do AGENTS.md;
- noindex atual em site.json;
- como validar build antes de considerar uma alteração concluída.

Inclua uma seção “Arquivos sensíveis do ambiente Figma Make” explicando que `.figma/make/*` e integrações específicas do `vite.config.ts` não devem ser removidos ou simplificados sem motivo técnico documentado.

Não altere código nesta tarefa.
```

---

## PROMPT 07 — Backend, persistência e decisão de arquitetura

```text
Leia a Wiki existente e confirme no repositório se existe backend, API, banco ou persistência.

Crie docs/wiki/07-backend-and-persistence.md.

A PRIMEIRA FRASE deve deixar claro o estado real: atualmente o Sorting Station é um front-end client-side e não possui backend, se isso continuar confirmado.

Estruture em quatro partes:

1. ESTADO ATUAL
- ausência/presença de backend;
- ausência/presença de banco;
- ausência/presença de autenticação;
- como o estado é mantido hoje;
- o que se perde ao recarregar a página.

2. PERSISTÊNCIA LOCAL PLANEJADA
Avalie localStorage para:
- progresso de campanha;
- tutorial concluído;
- melhores resultados;
- preferências;
- estatísticas locais.
Defina prós, contras e cuidados de versionamento do schema local.

3. GATILHOS PARA CRIAR BACKEND
Um backend só deve ser recomendado quando houver requisitos como:
- contas;
- sincronização entre dispositivos;
- ranking;
- telemetria;
- turmas/professores;
- avaliação acadêmica centralizada;
- analytics de aprendizagem.

4. ARQUITETURA FUTURA POSSÍVEL
Sem escolher tecnologia de forma arbitrária, descreva os domínios que uma API futura teria de atender, entidades conceituais, requisitos de privacidade e necessidade de ADR antes da adoção.

Não invente endpoints atuais.
Não invente banco atual.
Não selecione framework/backend definitivo sem requisito ou ADR.
```

---

## PROMPT 08 — Testes, qualidade e critérios de aceite

```text
Inspecione o repositório e a Wiki atual.

Crie docs/wiki/08-testing-and-quality.md.

Comece informando o estado real dos testes automatizados atuais.

Proponha, como PLANEJAMENTO, uma estratégia de qualidade para o projeto:

- build TypeScript/Vite;
- formatação oxfmt;
- testes unitários para funções puras da engine;
- testes da máquina de estados;
- casos Bubble Sort com vetor já ordenado, reverso, duplicados e tamanhos mínimos;
- testes para comparação correta/incorreta;
- testes de fim de passada;
- testes de encerramento de fase;
- testes de hint/reset;
- testes de fluxo Home → Tutorial → Game → Result;
- responsividade;
- reduced motion;
- acessibilidade básica de teclado e foco;
- regressões visuais críticas.

Não instale ferramentas nesta tarefa. Caso uma ferramenta de testes ainda não exista, marque-a como decisão futura.

Crie checklists de “Definition of Done” para:
1. mudança de UI;
2. mudança de engine;
3. nova fase;
4. novo algoritmo.
```

---

## PROMPT 09 — Deploy e operação

```text
Leia package.json, .figma/make/deploy, .figma/make/deploy-preview, vite.config.ts, site.json e a Wiki existente.

Crie docs/wiki/09-build-deploy.md.

Documente apenas mecanismos realmente presentes:
- build Vite;
- diretório dist;
- preview;
- deploy Figma Make;
- deploy-preview;
- base com FIGMA_PUBLIC_URL;
- host/port;
- sourcemaps conforme modo;
- robots noindex atual.

Inclua um checklist pré-deploy:
- format;
- build;
- navegação entre telas;
- execução das fases;
- teste em largura desktop e menor;
- console sem erros;
- textos e assets;
- última fase;
- acessibilidade/reduced motion quando aplicável.

Não invente CI/CD que não exista. Caso recomende CI no futuro, coloque em seção separada “Melhorias futuras”.
```

---

## PROMPT 10 — Roadmap completo e backlog

```text
Leia todos os arquivos docs/wiki existentes e o repositório.

Crie docs/wiki/10-roadmap.md.

Organize o roadmap em P0, P1, P2 e P3, separando claramente IMPLEMENTADO, EM PLANEJAMENTO e FUTURO.

Inclua obrigatoriamente estas direções já planejadas:

P0 — Bubble Sort pedagógico real
- máquina de estados;
- passada atual;
- índice atual;
- par esperado;
- decisão trocar/não trocar;
- bloquear ações fora da sequência;
- feedback explicativo;
- elementos definitivamente posicionados;
- progresso real;
- histórico de passos;
- correção da animação de swap;
- corrigir estado “OK”;
- comportamento ao concluir a terceira/última fase.

P1 — aperfeiçoamentos Bubble
- tutorial interativo;
- dica baseada no passo atual;
- replay completo;
- linha do tempo;
- destaque do pseudocódigo em sincronia;
- erros/tentativas;
- hintsUsed;
- pontuação;
- tempo apenas como recurso posterior/opcional.

P2 — algoritmos adicionais
- Selection Sort com busca do menor na região não ordenada;
- Insertion Sort com inserção na região ordenada;
- mecânicas próprias para cada algoritmo.

P3 — expansão
- Merge Sort;
- Quick Sort;
- Heap Sort;
- comparação de algoritmos;
- modo demonstração;
- modo desafio;
- complexidade/número de operações;
- vetores maiores;
- progressão narrativa por setores/protocolos.

Persistência:
- localStorage antes de backend, quando suficiente.

Backend futuro condicionado:
- contas;
- sync;
- telemetria;
- ranking;
- turmas/professores;
- analytics/avaliação.

Acadêmico:
- jogo deve alimentar metodologia/desenvolvimento do artigo;
- avaliação com usuários é futura;
- não registrar resultados não coletados.

Para cada item, inclua:
- objetivo;
- valor para o jogador/aluno;
- dependências;
- risco;
- critério de aceite;
- status.

Finalize com uma ordem recomendada das próximas 10 tarefas de desenvolvimento.
```

---

## PROMPT 11 — ADRs e decisões técnicas

```text
Leia toda a Wiki e o repositório.

Crie docs/wiki/11-architecture-decisions.md e a pasta docs/adr/ se ainda não existir.

O objetivo é definir como registrar decisões futuras, sem reescrever a história como se decisões não documentadas tivessem sido formalmente aprovadas.

Crie um template ADR com:
- título;
- status;
- data;
- contexto;
- decisão;
- alternativas;
- consequências;
- riscos;
- links para código/docs.

Liste como CANDIDATOS a ADR futuro, não como decisões aprovadas:
- separar engine de sorting da UI;
- modelo de máquina de estados;
- estratégia de persistência local;
- adoção de backend;
- framework de testes;
- roteamento;
- estratégia para novos algoritmos;
- telemetria acadêmica e privacidade.
```

---

## PROMPT 12 — Pedagogia e vínculo acadêmico

```text
Leia docs/wiki/01-product-vision.md, docs/wiki/04-sorting-engine.md, docs/wiki/10-roadmap.md e o código do jogo.

Crie docs/wiki/12-pedagogy-and-academic-traceability.md.

OBJETIVO
Documentar como as mecânicas representam conceitos de algoritmos de ordenação e como o desenvolvimento poderá sustentar futuramente um artigo acadêmico.

Diferencie rigorosamente:
- intenção pedagógica;
- implementação observável;
- hipótese/proposta;
- avaliação futura;
- resultado comprovado (atualmente nenhum, salvo se existirem dados reais no repositório).

Cubra:
- comparação de elementos;
- troca;
- vizinhança no Bubble Sort;
- passadas;
- elemento fixado ao final da passada;
- conexão ação → visualização → pseudocódigo;
- feedback imediato;
- replay e histórico como ideias futuras;
- diferenças pedagógicas planejadas para Selection e Insertion.

Inclua uma seção “O que podemos afirmar no artigo hoje” e outra “O que só poderemos afirmar após avaliação”.

Não invente eficácia, ganho de aprendizagem, satisfação de usuário ou resultados estatísticos.
```

---

## PROMPT 13 — Índice final da Wiki e revisão de consistência

```text
Leia TODO o conteúdo de docs/wiki, AGENTS.md, CLAUDE.md e o repositório atual.

Faça uma revisão de consistência sem alterar código funcional.

OBJETIVOS
1. detectar contradições entre páginas;
2. encontrar funcionalidades futuras descritas incorretamente como existentes;
3. encontrar funcionalidades existentes não documentadas;
4. conferir nomes de arquivos, componentes, scripts e versões;
5. conferir regras Figma Make;
6. conferir que backend é tratado de acordo com o estado real;
7. conferir que claims acadêmicos não inventam resultados;
8. atualizar links cruzados.

Crie ou atualize:
- docs/wiki/README.md

O README deve ser o índice principal e conter:
- visão rápida;
- ordem recomendada de leitura;
- links para todas as páginas;
- legenda de status: Implementado / Planejado / Futuro / Em decisão;
- “Onde começar” para desenvolvedor front-end;
- “Onde começar” para gameplay/algoritmos;
- “Onde começar” para manutenção Figma Make;
- “Onde começar” para artigo/pedagogia.

No final da tarefa, apresente um relatório curto das inconsistências encontradas e corrigidas na documentação.
```

---

# PROMPT MESTRE — usar caso o outro agente precise receber contexto antes das partes

```text
Você será o agente responsável por construir e manter a Wiki do projeto Sorting Station.

Sorting Station é um jogo educacional point-and-click para navegador com ambientação de central logística futurista. Caixas numeradas representam elementos de um vetor. O objetivo é ensinar algoritmos de ordenação por interação direta, conectando ação do jogador, representação visual, execução do algoritmo, feedback e pseudocódigo.

O projeto atual é um front-end React 19 + TypeScript 5.7 + Vite 8 + Tailwind CSS v4, executado no ambiente Figma Make. Node 22 e pnpm 10.34.3 estão definidos no repositório. O protótipo atual usa Bubble Sort e possui HomeScreen, TutorialScreen, GameScreen e ResultScreen, além de componentes reutilizáveis. Não existe backend, banco, autenticação, persistência nem suite de testes confirmada no estado atual.

A prioridade de produto é transformar o gameplay atual — que permite comparar qualquer par vizinho — em uma execução pedagógica fiel do Bubble Sort, controlando passada, índice de comparação, par esperado, decisão de trocar/não trocar, progresso real, elementos definitivamente posicionados e histórico de passos.

Depois disso, estão planejados: tutorial interativo, dicas contextuais, replay, pseudocódigo sincronizado, pontuação/erros/dicas e, posteriormente, Selection Sort e Insertion Sort com mecânicas próprias. Em horizonte mais longo: Merge Sort, Quick Sort, Heap Sort, comparação entre algoritmos, modo demonstração, modo desafio e vetores maiores.

Persistência local via localStorage deve ser considerada antes de backend. Backend só entra se requisitos futuros justificarem: contas, sincronização, telemetria, ranking, turmas/professores, analytics ou avaliação centralizada.

REGRAS DE TRABALHO
- Leia AGENTS.md e CLAUDE.md primeiro.
- Trate o código atual como fonte de verdade do que está implementado.
- Nunca apresente roadmap como funcionalidade pronta.
- Nunca invente backend/API/banco/testes.
- Preserve regras e scripts específicos do Figma Make.
- Não remova/simplifique .figma/make/* nem plugins Figma de vite.config.ts sem necessidade técnica explícita.
- Tailwind CSS v4 usa @tailwindcss/vite e `@import 'tailwindcss';`; não crie tailwind.config/PostCSS sem requisito.
- Use default export para componentes, conforme AGENTS.md.
- TypeScript é strict.
- Valide JSX/braces e cuidado com apóstrofos em strings.
- Sempre cite caminhos de arquivos ao documentar comportamento do repositório.
- Separe Implementado / Limitação / Planejado / Futuro.
- Em temas pedagógicos, não alegue eficácia sem avaliação real.

Sua função neste momento é DOCUMENTAR. Não faça refatorações de produto fora do escopo do prompt específico.
```

---

## 5. Ordem recomendada de execução

1. Prompt 00 — inventário.
2. Prompt 01 — produto.
3. Prompt 02 — arquitetura.
4. Prompt 03 — front-end.
5. Prompt 04 — engine/algoritmos.
6. Prompt 05 — UX/design system.
7. Prompt 06 — Figma Make/ambiente.
8. Prompt 07 — backend/persistência.
9. Prompt 08 — testes/qualidade.
10. Prompt 09 — build/deploy.
11. Prompt 10 — roadmap.
12. Prompt 11 — ADRs.
13. Prompt 12 — pedagogia/artigo.
14. Prompt 13 — índice e revisão final.

A partir daí, a Wiki deve ser atualizada junto com o código: toda alteração relevante de comportamento deve atualizar a página correspondente e, quando for uma decisão arquitetural relevante, gerar ou atualizar um ADR.
