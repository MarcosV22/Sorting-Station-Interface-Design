# 11 — Registro de Decisões Arquiteturais (ADRs)

> **Documento canônico:** Governança técnica, processo formal de deliberação arquitetural, template padronizado e catálogo de decisões candidatas do **Sorting Station**.  
> **Status:** Ativo / Base de Verdade da Wiki  
> **Data:** 08/09/2026  
> **Dependências:** [`AGENTS.md`](../../AGENTS.md), [`CLAUDE.md`](../../CLAUDE.md), [`00-repository-inventory.md`](./00-repository-inventory.md) a [`10-roadmap.md`](./10-roadmap.md), [`docs/adr/TEMPLATE.md`](../adr/TEMPLATE.md).

---

## 1. Governança e Princípio da Honestidade Histórica

Para que a documentação técnica sirva de fundação sólida para a engenharia de software e para a futura pesquisa acadêmica, o **Sorting Station** adota o modelo de **Architecture Decision Records (ADRs)** para registrar mudanças fundamentais no sistema.

> [!IMPORTANT]
> **Diretriz de Honestidade Histórica:**  
> **Não reescrever a história técnica do projeto.**  
> Decisões arquiteturais tomadas durante a fase inicial de prototipagem (como a escolha implícita de manter estado com `useState` imperativo em `GameScreen.tsx` ou a ausência de roteador) **não devem ser retroativamente inventadas como se fossem ADRs formalmente aprovados no passado**.  
> Os ADRs passam a vigorar a partir deste marco canônico para guiar deliberações presentes e futuras. Propostas de evolução técnica são tratadas honestamente como **Candidatas a ADR**, e só recebem o status de `Aceito` após consenso técnico e validação nos fóruns de projeto.

---

## 2. O Ciclo de Vida de um ADR

Todos os registros formais de decisão serão armazenados no diretório [`docs/adr/`](../../docs/adr) seguindo o padrão de nomenclatura sequencial `docs/adr/ADR-XXX-[slug].md` (ex.: `ADR-001-separacao-engine-ui.md`).

```mermaid
stateDiagram-v2
    [*] --> Proposto : Autor submete PR com proposta
    Proposto --> Aceito : Aprovado por mantenedores técnicos
    Proposto --> Rejeitado : Alternativa inviável ou descartada
    Aceito --> Substituído : Nova decisão suplanta a anterior
    Aceito --> Deprecado : Funcionalidade descontinuada
    Substituído --> [*]
    Deprecado --> [*]
    Rejeitado --> [*]
```

- **`Proposto`:** Submetido para revisão da equipe; descreve o problema, alternativas e impactos. O código ainda não deve refletir a decisão como definitiva.
- **`Aceito`:** Formalmente aprovado; autoriza a implementação de código e passa a constituir a verdade arquitetural canônica.
- **`Rejeitado`:** Avaliado e descartado; preservado no repositório para evitar que a equipe rediscuta ideias já refutadas sem novos fatos.
- **`Substituído`:** Uma decisão previamente aceita foi suplantada por uma solução mais madura (aponta explicitamente para o novo `ADR-YYY`).
- **`Deprecado`:** A decisão perdeu relevância devido à remoção da funcionalidade correspondente.

---

## 3. Template Canônico de ADR

O modelo oficial de deliberação está versionado em [`docs/adr/TEMPLATE.md`](../adr/TEMPLATE.md) e deve conter obrigatoriamente os seguintes campos:

```markdown
# ADR [NÚMERO]: [TÍTULO DA DECISÃO ARQUITETURAL]

- **Status:** Proposto | Aceito | Rejeitado | Deprecado | Substituído por [ADR-XXX]
- **Data:** AAAA-MM-DD
- **Autores:** [Nomes dos responsáveis ou papéis técnicos]
- **Decisores:** [Equipe técnica / Mantenedores]

---

## 1. Contexto e Declaração do Problema
[Descreve o cenário operacional, a restrição de ambiente e a necessidade real de mudança]

---

## 2. Decisão Arquitetural
[Declaração direta, inequívoca e assertiva da solução adotada]

---

## 3. Alternativas Consideradas
- **Alternativa A:** [Descrição e motivo do descarte]
- **Alternativa B:** [Descrição e motivo do descarte]

---

## 4. Consequências e Trade-offs
### 4.1. Consequências Positivas (Ganhos)
### 4.2. Consequências Negativas ou Custos (Trade-offs)

---

## 5. Riscos e Mitigações
[Matriz de riscos com severidade e ações preventivas/corretivas]

---

## 6. Links e Referências
- **Código-fonte Afetado:** [links de arquivo]
- **Documentos da Wiki Relacionados:** [links de documentação]
```

---

## 4. Registro de ADRs Aceitos

### [ADR 0001: Integração da FSM Pura da Bubble Sort Engine com GameScreen e Modelo Decisório TROCAR/MANTER](../../docs/adr/0001-bubble-sort-fsm-ui-integration.md)
- **Status:** `Aceito` (2026-09-10)
- **Contexto:** Resolve formalmente os Candidatos 1 e 2. Elimina a lógica heurística imperativa de `GameScreen.tsx`, adota a Bubble Sort Engine pura (`src/game/sorting/`) como fonte única de verdade e implementa o modelo de decisão didático `[⇄ TROCAR]` vs `[= MANTER]`.
- **Impacto:** Conclusão de P0.1, P0.2 e P0.3 com 31 testes automatizados passando.

### [ADR 0002: Encerramento da Campanha Bubble Sort e Agregação de Resultados em Memória](../../docs/adr/0002-campaign-completion-memory-state.md)
- **Status:** `Aceito` (2026-09-10)
- **Contexto:** Resolve o bug de loop infinito na conclusão da Fase 3 em `src/App.tsx`, introduz a máquina de telas explícita com `CampaignCompleteScreen` e a camada pura de agregação em memória das métricas factuais das fases concluídas (`src/game/campaign/campaignSummary.ts`).
- **Impacto:** Conclusão de P0.8 e finalização formal do Milestone P0 com 34 testes automatizados passando.

### [ADR 0003: Separação entre Domínio Algorítmico Puro e Telemetria de Sessão (Dicas e Interação)](../../docs/adr/0003-session-metrics-engine-decoupling.md)
- **Status:** `Aceito` (2026-09-10)
- **Contexto:** Resolve a telemetria factual de P1.2. Mantém a Bubble Sort Engine (`src/game/sorting/`) puramente algorítmica (fonte canônica de `errors`), enquanto introduz a camada pura `src/game/session/sessionMetrics.ts` para rastreamento isolado de scaffolding/dicas (`hintsUsed`). Elimina a heurística de "Eficiência (%)" em `ResultScreen.tsx`.
- **Impacto:** Conclusão de P1.2 com 45 testes automatizados passando.

### [ADR 0004: Derivação Pura de Quadros de Replay da Execução a partir de StepRecord](../../docs/adr/0004-execution-replay-state-derivation.md)
- **Status:** `Aceito` (2026-09-10)
- **Contexto:** Resolve a reprodução retrospectiva passo a passo de P1.3. Introduz a camada pura `src/game/replay/replayModel.ts` que transforma deterministicamente o `initialValues` e o `history: readonly StepRecord[]` em quadros imutáveis (`ReplayFrame`), sem reexecução redundante do algoritmo. Introduz o quadro 0 (estado inicial), controles somente-leitura na `ReplayScreen` e botão `[ VER EXECUÇÃO ]` em `ResultScreen`.
- **Impacto:** Conclusão de P1.3 com 54 testes automatizados passando e integridade absoluta das métricas da sessão.

### [ADR 0005: Sincronização Pura de Pseudocódigo no Modo Replay da Execução](../../docs/adr/0005-replay-synchronized-pseudocode.md)
- **Status:** `Aceito` (2026-09-10)
- **Contexto:** Resolve a representação textual sincronizada de P1.4. Define a representação canônica imutável `BUBBLE_SORT_PSEUDOCODE` (9 instruções), a função de mapeamento puro `getPseudocodeHighlight(frame)` em `src/game/replay/replayPseudocode.ts` e o componente reutilizável `BubbleSortPseudocodePanel`. Separa rigorosamente a instrução abstrata genérica ($A[j] > A[j+1]$) da contextualização com valores concretos ($5 > 2 \rightarrow \text{VERDADEIRO}$).
- **Impacto:** Conclusão de P1.4 com 63 testes automatizados passando, ausência de reexecução e sincronização perfeita em todos os controles de replay.

---

## 5. Catálogo de Candidatos a ADR Futuro

As seguintes propostas de evolução estrutural permanecem documentadas como **candidatas formais**:

---

### Candidato 3 — Estratégia de Persistência Local Desacoplada
- **Contexto:** Todo o progresso de campanha e métricas de desempenho são perdidos ao atualizar a página (F5).
- **Proposta sob Avaliação:** Implementar persistência local via `localStorage` com controle de versão de schema e fallback defensivo em memória ([`07-backend-and-persistence.md`](./07-backend-and-persistence.md)).
- **Alternativas a Ponderar:** `localStorage` síncrono simples vs. `IndexedDB` assíncrono (ex.: Dexie.js) vs. persistência em cookies.
- **Impacto:** Médio. Preserva autonomia do estudante sem custos de servidor.
- **Status:** `CANDIDATO PROPOSTO (P1)`.

---

### Candidato 4 — Adoção de Backend Centralizado e Modelo de Hospedagem
- **Contexto:** Avaliar sob quais condições fáticas um backend deve ser desenvolvido.
- **Proposta sob Avaliação:** Condicionar a criação de uma API e banco de dados exclusivamente ao disparo de gatilhos operacionais comprovados (contas institucionais, sincronização multi-dispositivo, combate a fraude em placares ou telemetria para artigos acadêmicos).
- **Alternativas a Ponderar:** Backend Node/TypeScript (Fastify/Nest) vs. Python (FastAPI para análise de dados) vs. Backend-as-a-Service (Supabase/Firebase).
- **Impacto:** Crítico. Exige custos de nuvem e compliance rigoroso com a LGPD/GDPR.
- **Status:** `CANDIDATO CONDICIONADO (P3)`.

---

### Candidato 5 — Seleção de Framework de Testes Automatizados
- **Contexto:** O repositório possui atualmente 0 frameworks e 0 arquivos de teste automatizado ([`08-testing-and-quality.md`](./08-testing-and-quality.md)).
- **Proposta sob Avaliação:** Adotar o **Vitest** como executor nativo de testes integrado ao pipeline do Vite, em conjunto com `@testing-library/react`.
- **Alternativas a Ponderar:** Vitest vs. Jest (overhead de configuração com Vite e ESM) vs. Cypress/Playwright para testes ponta a ponta exclusivos.
- **Impacto:** Médio. Essencial para garantir não regressão da FSM e dos cálculos de complexidade.
- **Status:** `CANDIDATO PROPOSTO (P1)`.

---

### Candidato 6 — Arquitetura de Roteamento Client-Side
- **Contexto:** A navegação atual é controlada por uma variável de estado em [`src/App.tsx`](../../src/App.tsx) (`screen: "home" | "tutorial" | "game" | "result"`), sem URLs navegáveis pelo histórico do navegador (botão "Voltar").
- **Proposta sob Avaliação:** Avaliar se a máquina de telas em `App.tsx` continua sendo a abordagem mais limpa ou se deve ser introduzido um roteador hash (`react-router-dom` ou similar).
- **Alternativas a Ponderar:** Manter `screen` em `useState` vs. Hash Router (`#/game/1`) vs. Browser History API (risco de 404 em sandboxes do Figma Make).
- **Impacto:** Baixo/Médio. Deve garantir total compatibilidade com o iframe e CDN do Figma Make.
- **Status:** `CANDIDATO PROPOSTO (P2)`.

---

### Candidato 7 — Estratégia Arquitetural para Novos Algoritmos (Selection e Insertion)
- **Contexto:** Garantir que novos algoritmos não sejam implementados apenas como renomeação de rótulos visuais, mas com mecânicas interativas exclusivas ([`04-sorting-engine.md`](./04-sorting-engine.md)).
- **Proposta sob Avaliação:** Adotar o padrão de projeto **Strategy**, no qual cada protocolo de ordenação encapsula sua própria FSM, regras de par/mínimo, representação visual da esteira e pseudocódigo.
- **Alternativas a Ponderar:** Componentes de tela inteiramente separados (`SelectionGameScreen.tsx`) vs. Tela genérica parametrizada por um Strategy Object.
- **Impacto:** Alto. Define a escalabilidade do produto para suportar até 6 algoritmos diferentes no futuro.
- **Status:** `CANDIDATO PROPOSTO (P2)`.

---

### Candidato 8 — Telemetria Acadêmica, Anonimização e Privacidade de Dados
- **Contexto:** O projeto visa embasar um artigo científico com dados empíricos de aprendizagem e usabilidade.
- **Proposta sob Avaliação:** Especificar formalmente a taxonomia de eventos de telemetria (tempo de resposta, erros cometidos, padrão de busca), com anonimização mandatória desde a coleta (sem vincular nomes civis ou endereços IP aos registros de jogo).
- **Alternativas a Ponderar:** Coleta via beacon HTTP anônimo vs. exportação manual de arquivo JSON pelo próprio estudante ao final da aula.
- **Impacto:** Alto. Decisivo para a aprovação ética e legal da pesquisa perante comitês universitários.
- **Status:** `CANDIDATO PROPOSTO (P3)`.

---

## 5. Diretrizes de Integração com a Wiki

1. **Rastreabilidade Bidirecional:** Sempre que um ADR for aceito ou modificado, a página correspondente da Wiki (ex.: [`02-system-architecture.md`](./02-system-architecture.md) ou [`07-backend-and-persistence.md`](./07-backend-and-persistence.md)) deve ser atualizada para citar o número do ADR aprovado.
2. **Atualização do `SUMMARY.md`:** Qualquer novo ADR formalmente aceito deve ter sua entrada registrada no índice principal da Wiki.
3. **Respeito ao `AGENTS.md`:** Nenhum ADR poderá propor padrões que violem as restrições inegociáveis do ambiente (ex.: quebra de compatibilidade com Vite no Figma Make ou remoção indevida dos scripts em `.figma/make/*`).
