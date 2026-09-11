# ADR 0001: Integração da FSM Pura da Bubble Sort Engine com GameScreen e Modelo Decisório TROCAR/MANTER

- **Status:** Aceito
- **Data:** 2026-09-10
- **Autores:** Agente de Desenvolvimento e Arquitetura
- **Decisores:** Equipe Técnica e Pedagógica do Sorting Station

---

## 1. Contexto e Declaração do Problema
O protótipo original do `GameScreen` implementava uma mecânica de "puzzle de trocas livres":
- O jogador podia clicar em qualquer par de caixas adjacentes no vetor;
- Uma função local `findNextSwap` procurava a primeira inversão arbitrária para dar dicas;
- Uma função `isSorted` baseada em predicado genérico determinava o término prematuro da fase;
- O cálculo de progresso utilizava uma fórmula heurística puramente visual baseada em trocas;
- A animação de swap continha uma condição de corrida onde o reset prematuro do estado `selected` quebrava a aplicação das classes CSS `animate-swap-left` e `animate-swap-right`.

Essa abordagem contradizia o rigor formal do Bubble Sort didático, no qual a invariante de laço exige a varredura progressiva da esquerda para a direita em passadas formais ($i \in [0, n-2]$) e o escrutínio obrigatório de pares adjacentes sequenciais ($j \in [0, n-i-2]$).

---

## 2. Decisão Arquitetural
Adotou-se a **Bubble Sort Engine pura** (`src/game/sorting/`) como a **única fonte de verdade algorítmica** do jogo, integrando-a ao `GameScreen`:
1. **Eliminação da Lógica Heurística Local:** Removeram-se os estados paralelos `boxes`, `comparisons`, `swaps`, `selected` e os helpers `isSorted` e `findNextSwap` de `GameScreen`.
2. **Modelo Decisório Pedagógico (TROCAR vs. MANTER):** O par sob escrutínio é determinado deterministicamente pela engine (`getExpectedComparison`). O jogador toma uma decisão explícita através de botões dedicados `[⇄ TROCAR]` e `[= MANTER]`, validada via `executeUserStep(gameState, decision)`.
3. **Bloqueio de Passos Fora de Sequência:** Cliques em caixas fora do par ativo não alteram o fluxo algorítmico, fornecendo apenas mensagens orientativas.
4. **Desacoplamento do Estado de Animação:** Introduziu-se o estado visual `animatingPair: { left: number; right: number } | null` na UI, ativando `animate-swap-right` para a caixa esquerda e `animate-swap-left` para a caixa direita durante 500ms antes de sincronizar o estado da engine e reabilitar os controles.
5. **Cálculo de Progresso Algorítmico Real:** Implementou-se `calculateBubbleSortProgress(state)` na engine baseado no quociente formal de micro-passos concluídos sobre o total teórico $\frac{n(n-1)}{2}$.
6. **Consolidação Formal:** A identificação de elementos fixados (`OK`) é derivada diretamente de `getSortedIndices(gameState)`.

---

## 3. Alternativas Consideradas

- **Alternativa A: Manter seleção livre por clique e apenas validar se o par era o correto.**  
  *Por que foi descartada:* Aumentava a carga cognitiva do aluno com ações inválidas frustrantes e mascarava a essência do algoritmo, que é uma varredura automática com decisão local nos elementos do par.
- **Alternativa B: Fazer a troca automaticamente sem exigir decisão de MANTER quando os elementos já estivessem ordenados.**  
  *Por que foi descartada:* Elimina a oportunidade pedagógica de o aluno avaliar que $A[j] \le A[j+1]$ e entender que o algoritmo também gasta comparações em pares que não sofrem trocas.

---

## 4. Consequências e Trade-offs

### 4.1. Consequências Positivas (Ganhos)
- Fidelidade algorítmica de 100% com o Bubble Sort clássico;
- Correção definitiva do bug de animação de swap CSS;
- Métricas exatas de comparações, trocas e erros enviadas para o `ResultScreen`;
- Cobertura por testes unitários e de integração automatizados (31 testes passando);
- Feedback formativo contextualizado sem revelar a resposta antes da tomada de decisão.

### 4.2. Consequências Negativas ou Custos (Trade-offs)
- Interação menos "sandbox" para o jogador casual, exigindo maior atenção às regras formais do protocolo;
- Necessidade de coordenar temporizadores de animação na UI com as transições de estado imutáveis da engine.

---

## 5. Riscos e Mitigações

| Risco Identificado | Severidade | Estratégia de Mitigação |
| :--- | :--- | :--- |
| Disparo duplo de `onComplete` durante transição de telas | Média | Utilização de `completedCalledRef` para garantir idempotência estrita. |
| Memory leaks por timers pendentes em desmontagens | Média | Armazenamento de IDs em `animTimeoutRef`, `hintTimeoutRef` e `completeTimeoutRef` com cancelamento no cleanup do `useEffect`. |
| Regressão na suíte de testes unitários da engine | Alta | Execução obrigatória de `vitest` em pipeline CI / pre-commit, cobrindo inclusive a simulação completa do cenário canônico `[5, 2, 4, 1]`. |

---

## 6. Links e Referências
- **Código-fonte Afetado:** [`src/screens/GameScreen.tsx`](../../src/screens/GameScreen.tsx), [`src/game/sorting/bubbleSortEngine.ts`](../../src/game/sorting/bubbleSortEngine.ts), [`src/components/NumberedBox.tsx`](../../src/components/NumberedBox.tsx)
- **Documentos da Wiki Relacionados:** [`02-system-architecture.md`](../wiki/02-system-architecture.md), [`03-frontend.md`](../wiki/03-frontend.md), [`04-sorting-engine.md`](../wiki/04-sorting-engine.md), [`10-roadmap.md`](../wiki/10-roadmap.md)
