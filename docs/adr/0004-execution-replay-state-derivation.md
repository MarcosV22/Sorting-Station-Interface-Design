# ADR 0004: Derivação Pura de Quadros de Replay da Execução a partir de StepRecord

- **Status:** Aceito
- **Data:** 2026-09-10
- **Autores:** Antigravity Agent & Equipe Sorting Station
- **Decisores:** Antigravity Agent & Usuário

---

## 1. Contexto e Declaração do Problema

No **Sorting Station**, após concluir uma fase do Protocolo Bubble Sort, o estudante é direcionado para a `ResultScreen`, onde visualiza o relatório consolidado de métricas factuais (comparações, trocas, erros, dicas). Contudo, para consolidar a aprendizagem cinestésica e algorítmica, o estudante necessita revisar retrospectivamente a sequência passo a passo de como as decisões estabilizaram o vetor.

O requisito do **P1.3 (Replay da Execução)** exige:
1. Uma visualização somente-leitura com navegação passo a passo (Anterior, Próximo, Reproduzir, Pausar, Reiniciar);
2. Apresentação do estado inicial (Passo 0/N) antes da primeira comparação;
3. Explicação concisa e factual de cada decisão (SWAP vs KEEP) e destaque do par comparado e dos elementos consolidados;
4. Não alterar métricas, progresso da campanha ou estado da engine ao entrar ou sair do replay;
5. Fidelidade absoluta à realidade executada pelo jogador, sem reexecução redundante do algoritmo.

---

## 2. Decisão Arquitetural

Adota-se uma **camada pura e imutável de derivação de quadros de replay** em `src/game/replay/replayModel.ts`:
1. **Fonte Exclusiva de Verdade:** A função `buildReplayFrames(initialArray, history)` consome estritamente o `initialValues` e o histórico imutável `readonly StepRecord[]` acumulado pela `BubbleSortEngine` durante a partida.
2. **Quadro 0 (Estado Inicial):** Um quadro sintético inicial (`stepNumber: 0`, `action: "INITIAL"`, `activeIndices: null`) é gerado deterministicamente antes do primeiro passo, exibindo a carga desordenada inicial da esteira.
3. **Quadros 1 a N:** Cada `StepRecord` registrado gera um `ReplayFrame` congelado (`Object.freeze`) contendo o vetor resultante (`valuesAfter`), o par focado (`activeIndices`), a ação (`SWAP` ou `KEEP`), o rótulo descritivo e o cálculo exato dos índices definitivamente consolidados (`sortedIndices`).
4. **Isolamento de Estado na UI:** O `ReplayScreen` recebe os dados do histórico via props passadas por `App.tsx` a partir de `GameResult`, mantendo as métricas e o progresso da campanha intactos na memória do `App.tsx`. Ao acionar `[ ← VOLTAR AO RESULTADO ]`, a tela retorna para `ResultScreen` sem perdas ou redefinições de estado.
5. **Autoplay Controlado:** O autoplay avança a cada 1200ms e interrompe-se automaticamente ao atingir o último quadro (`isLast`).

---

## 3. Alternativas Consideradas

- **Alternativa A: Reexecutar a Bubble Sort Engine passo a passo sob demanda na UI**  
  *Por que foi descartada:* Viola o princípio de separação de responsabilidades, acopla desnecessariamente o componente de visualização às regras de transição da FSM e gera recomputação redundante quando todos os passos já foram formal e deterministicamente registrados no `history`.
- **Alternativa B: Gravar snapshots visuais completos de componentes React durante a fase**  
  *Por que foi descartada:* Consumo excessivo de memória, forte acoplamento com o ciclo de vida do React e impossibilidade de testar a lógica de frames de forma pura e desacoplada em testes unitários rápidos.

---

## 4. Consequências e Trade-offs

### 4.1. Consequências Positivas (Ganhos)
- **Desacoplamento Rigoroso:** `ReplayScreen` desconhece os métodos de mutação interna da `BubbleSortEngine`. Ela apenas lê `ReplayFrame[]`.
- **Testabilidade 100% Pura:** A camada de derivação possui testes unitários dedicados em `src/game/replay/replayModel.test.ts` que validam cenários vazios, [5,2,4,1], frames de troca, de manutenção, ordenação estrita e imutabilidade sem renderizar o DOM.
- **Integridade da Campanha:** A navegação de ida e volta `ResultScreen ↔ ReplayScreen` é transparente e idempotente, preservando todas as métricas da fase e da campanha.

### 4.2. Custos e Limitações (Replay v1)
- O `history` atual da engine registra apenas passos algorítmicos válidos executados. Tentativas incorretas bloqueadas (erros) e dicas solicitadas durante o jogo são computadas nas métricas, mas não são projetadas como micro-frames visuais intermediários na esteira do Replay v1.

---

## 5. Riscos e Mitigações

| Risco Identificado | Severidade | Estratégia de Mitigação |
| :--- | :--- | :--- |
| **Consumo de memória por retenção de histórico prolongado** | Baixa | O histórico é mantido apenas na memória volátil da sessão ativa e substituído ao repetir a fase ou descartado ao reiniciar o protocolo. |
| **Dessincronização de índices de elementos ordenados** | Média | A fórmula matemática dos limites de cada passada (`sortedIndices`) foi codificada e testada diretamente contra a especificação canônica do Bubble Sort. |
| **Race conditions em timers de autoplay ao desmontar tela** | Baixa | `useEffect` com cleanup formal via `clearInterval` e pausa automática imediata caso o usuário interaja manualmente. |

---

## 6. Links e Referências

- **Código-fonte Afetado:**
  - [`src/game/replay/replayModel.ts`](../../src/game/replay/replayModel.ts)
  - [`src/game/replay/replayModel.test.ts`](../../src/game/replay/replayModel.test.ts)
  - [`src/screens/ReplayScreen.tsx`](../../src/screens/ReplayScreen.tsx)
  - [`src/screens/ResultScreen.tsx`](../../src/screens/ResultScreen.tsx)
  - [`src/App.tsx`](../../src/App.tsx)
- **Documentos da Wiki Relacionados:**
  - [`docs/wiki/02-system-architecture.md`](../wiki/02-system-architecture.md)
  - [`docs/wiki/03-frontend.md`](../wiki/03-frontend.md)
  - [`docs/wiki/04-sorting-engine.md`](../wiki/04-sorting-engine.md)
  - [`docs/wiki/10-roadmap.md`](../wiki/10-roadmap.md)
  - [`docs/wiki/11-architecture-decisions.md`](../wiki/11-architecture-decisions.md)
- **ADRs Anteriores:**
  - [ADR 0001: Integração FSM Bubble Sort e GameScreen](./0001-bubble-sort-fsm-ui-integration.md)
  - [ADR 0002: Encerramento da Campanha e Tela de Conclusão](./0002-campaign-completion-memory-state.md)
  - [ADR 0003: Desacoplamento entre Engine e Telemetria de Sessão](./0003-session-metrics-engine-decoupling.md)
