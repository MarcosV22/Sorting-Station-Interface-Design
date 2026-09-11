# ADR 0003: Separação entre Domínio Algorítmico Puro e Telemetria de Sessão (Dicas e Interação)

- **Status:** Aceito
- **Data:** 2026-09-10
- **Autores:** Agente de Desenvolvimento e Arquitetura
- **Decisores:** Equipe Técnica e Pedagógica do Sorting Station

---

## 1. Contexto e Declaração do Problema

No marco P1.2, surgiu a necessidade de registrar métricas factuais da experiência do jogador durante cada fase do jogo:
1. Quantidade de decisões incorretas (`errors`);
2. Quantidade de dicas solicitadas (`hintsUsed`).

A engine de ordenação (`src/game/sorting/`) já continha em seu estado imutável o campo `errors: number`, incrementado estritamente quando o usuário seleciona uma decisão (`SWAP` ou `KEEP`) divergente da exigida pelo algoritmo formal (`executeUserStep`).

Por outro lado, o uso de dicas didáticas (`hintsUsed`) levantou um dilema arquitetural:
- **Deveria `hintsUsed` ser adicionado diretamente em `BubbleSortState` dentro de `src/game/sorting/`?**
- Ou deveria residir em uma camada separada de sessão/interação pedagógica?

A análise do domínio algorítmico revelou que a solicitação de uma dica não altera ponteiros de passada (`passIndex`), não avança comparações (`comparisonIndex`), não efetua permutas no vetor (`currentValues`), nem faz parte da definição matemática ou histórica do algoritmo Bubble Sort. Poluir a máquina de estados algorítmica com eventos de assistência de interface violaria o Princípio da Responsabilidade Única (SRP) e comprometeria a pureza formal da engine.

---

## 2. Decisão Arquitetural

1. **Manutenção da Pureza da Sorting Engine:**
   - A `BubbleSortEngine` (`src/game/sorting/`) permanece estritamente restrita às operações algorítmicas, invariantes matemáticas e ao registro canônico de validação de passos (`errors`).
   - `hintsUsed` **NÃO** faz parte de `BubbleSortState`.

2. **Criação da Camada Pura de Métricas de Sessão (`src/game/session/`):**
   - Criação de `src/game/session/sessionMetrics.ts` com a interface `PhaseSessionMetrics` (`hintsUsed: number`) e funções puras imutáveis (`createPhaseSessionMetrics`, `recordHintUsed`).
   - Isolamento com testes unitários em `src/game/session/sessionMetrics.test.ts`.

3. **Consolidação no Contrato de Conclusão da Fase:**
   - `GameScreen` consome a engine para `comparisons`, `swaps` e `errors`, e consome `sessionMetrics` para `hintsUsed`.
   - Ao concluir a fase, despacha um objeto tipado unificado `PhaseCompleteData` para `App.tsx`:
     ```typescript
     export interface PhaseCompleteData {
       comparisons: number;
       swaps: number;
       errors: number;
       hintsUsed: number;
       finalArray: number[];
     }
     ```

4. **Extensão dos Modelos de Campanha:**
   - `PhaseResult` e `CampaignSummary` em `src/game/campaign/campaignSummary.ts` foram expandidos para conter `errors`/`totalErrors` e `hintsUsed`/`totalHintsUsed`, mantendo cálculo puro por agregação.

5. **Eliminação de Heurísticas Arbitrárias:**
   - Remoção definitiva da métrica fictícia de "Eficiência (%)" em `ResultScreen.tsx`. A telemetria passa a ser 100% descritiva e factual (comparações, trocas, erros, dicas).

---

## 3. Alternativas Consideradas

- **Alternativa A: Injetar `hintsUsed` dentro de `BubbleSortState`.**  
  *Por que foi descartada:* Viola o desacoplamento de domínio. Em futuras expansões com outros algoritmos (Selection Sort, Insertion Sort), a engine deve ser puramente matemática. Dica é um recurso de scaffolding de interface/tutor, não uma operação de ordenação.
- **Alternativa B: Controlar `hintsUsed` apenas como um `number` volátil solto no `GameScreen`.**  
  *Por que foi descartada:* Dificulta testes unitários automatizados da lógica de incremento, reset e imutabilidade das métricas de sessão.

---

## 4. Consequências e Trade-offs

### 4.1. Consequências Positivas (Ganhos)
- Engine de ordenação permanece 100% pura, matemática e agnóstica a mecânicas de assistência do jogo;
- Scaffolding pedagógico possui seu próprio ciclo de vida testado isoladamente;
- Contrato claro, tipado e descritivo entre tela e orquestrador (`App.tsx`);
- Eliminação de pontuações normativas ou fórmulas fictícias de eficiência.

### 4.2. Consequências Negativas ou Custos (Trade-offs)
- Requer sincronização entre o estado React de `sessionMetrics` e uma referência (`hintsUsedRef`) no `GameScreen` para evitar stale closures em temporizadores de animação de vitória.

---

## 5. Riscos e Mitigações

| Risco Identificado | Severidade | Estratégia de Mitigação |
| :--- | :--- | :--- |
| Clique duplo acidental ou re-render incrementar dicas repetidamente | Média | Guardas estritas de estado (`showHint`, `isAnimating`, `gameState.completed`, `isActionLockedRef`) e timeout de 4s desabilitando o botão durante exibição da dica. |
| Inconsistência entre contadores de erro da engine e da UI | Baixa | Fonte canônica única: `gameState.errors` originado exclusivamente do motor `executeUserStep`. |

---

## 6. Links e Referências

- **Código-fonte Afetado:**
  - `src/game/session/sessionMetrics.ts`
  - `src/game/session/sessionMetrics.test.ts`
  - `src/game/campaign/campaignSummary.ts`
  - `src/screens/GameScreen.tsx`
  - `src/screens/ResultScreen.tsx`
  - `src/screens/CampaignCompleteScreen.tsx`
- **Documentos da Wiki Relacionados:**
  - `docs/wiki/02-system-architecture.md`
  - `docs/wiki/03-frontend.md`
  - `docs/wiki/04-sorting-engine.md`
  - `docs/wiki/12-pedagogy-and-academic-traceability.md`
- **ADRs Anteriores:**
  - `docs/adr/0001-bubble-sort-fsm-ui-integration.md`
  - `docs/adr/0002-campaign-completion-memory-state.md`
