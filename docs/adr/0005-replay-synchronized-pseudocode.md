# ADR 0005: Sincronização Pura de Pseudocódigo no Modo Replay da Execução

- **Status:** Aceito
- **Data:** 2026-09-10
- **Autores:** Antigravity Agent & Equipe Sorting Station
- **Decisores:** Antigravity Agent & Usuário

---

## 1. Contexto e Declaração do Problema

No **Sorting Station**, o marco P1.3 introduziu o modo de auditoria técnica (`ReplayScreen`), permitindo a reprodução retrospectiva passo a passo da esteira a partir dos `StepRecord` gravados pela engine. Contudo, para consolidar a ponte pedagógica entre a manipulação cinestésica (caixas físicas) e a computação formal, o estudante necessita enxergar a instrução exata do algoritmo que governa cada decisão observada.

Os requisitos do **P1.4 (Pseudocódigo Sincronizado com o Replay)** exigem:
1. Uma representação canônica e reutilizável do pseudocódigo do Bubble Sort;
2. Destaque visual sincronizado com o frame exibido (`INITIAL`, `KEEP`, `SWAP`);
3. Exibição de valores concretos observados ($A[j] = 5, A[j+1] = 2 \rightarrow 5 > 2$) de forma separada do pseudocódigo genérico ($A[j] > A[j+1]$);
4. Ausência de reexecução algorítmica: os dados devem derivar exclusivamente do `ReplayFrame`;
5. Desacoplamento arquitetural: criação de componente reutilizável (`BubbleSortPseudocodePanel`) e camada pura de apresentação (`getPseudocodeHighlight`);
6. Rigor acadêmico: não fazer alegações não comprovadas sobre impacto cognitivo sem testes empíricos controlados.

---

## 2. Decisão Arquitetural

Adota-se uma **camada pura e imutável de sincronização de pseudocódigo** e um **componente de apresentação desacoplado**:

1. **Representação Canônica Imutável:** Define-se `BUBBLE_SORT_PSEUDOCODE` em `src/game/replay/replayPseudocode.ts` com 9 instruções canônicas estruturadas com identificadores semânticos (`PROCEDURE`, `OUTER_LOOP`, `INNER_LOOP`, `IF_CONDITION`, `SWAP_STATEMENT`, etc.), numeração de linha e identação explícita.
2. **Função Pura de Destaque (`getPseudocodeHighlight`):**
   - **Quadro `INITIAL`:** Destaque neutro no início do procedimento (`PROCEDURE`), sem condição ativa e sem troca;
   - **Quadro `KEEP`:** Destaque na condição (`IF_CONDITION`) com status `FALSO`, evidenciando que a instrução de troca não é acionada quando $A[j] \le A[j+1]$;
   - **Quadro `SWAP`:** Destaque na condição com status `VERDADEIRO` e destaque primário na operação de troca (`SWAP_STATEMENT`), evidenciando a execução física da permuta;
   - Todos os retornos e coleções são imutáveis (`Object.freeze`).
3. **Preservação do Pseudocódigo Genérico:** O bloco de código textual permanece formalmente abstrato ($A[j] > A[j+1]$), enquanto um painel contextual adjacente apresenta os valores concretos avaliados no frame (ex.: $A[0] = 5, A[1] = 2$).
4. **Componente Reutilizável (`BubbleSortPseudocodePanel`):** Componente React autônomo em `src/components/BubbleSortPseudocodePanel.tsx` que recebe apenas `frame: ReplayFrame`, derivando a visualização via `useMemo` sem manter estados paralelos suscetíveis a dessincronização.

---

## 3. Alternativas Consideradas

- **Alternativa A: Embutir lógica condicional diretamente no JSX de `ReplayScreen.tsx`**  
  *Por que foi descartada:* Polui o componente de tela, impede testes unitários automatizados da lógica de destaque e inviabiliza o reúso do painel de pseudocódigo em outras telas (como `GameScreen` ou futuras telas pedagógicas).
- **Alternativa B: Interpretar o pseudocódigo dinamicamente em tempo de execução via AST**  
  *Por que foi descartada:* Complexidade arquitetural desproporcional para um algoritmo de 9 linhas, risco de falhas de segurança/parsing e overhead desnecessário no bundle do cliente.
- **Alternativa C: Substituir variáveis diretamente no texto do pseudocódigo (ex.: exibir `if 5 > 4`)**  
  *Por que foi descartada:* Viola o objetivo pedagógico fundamental de ensinar a abstração algorítmica. O estudante precisa compreender que a linha de código é genérica e opera sobre quaisquer variáveis indexadas.

---

## 4. Consequências e Trade-offs

### 4.1. Consequências Positivas (Ganhos)
- **Sincronização 100% Determinística:** O pseudocódigo avança e recua em harmonia com qualquer ação de navegação (`ANTERIOR`, `PRÓXIMO`, `REPRODUZIR`, `PAUSAR`, `REINICIAR`) sem defasagem temporal ou descompasso de estado.
- **Testabilidade Pura (9 novos testes unitários):** A função `getPseudocodeHighlight` é testada isoladamente em `src/game/replay/replayPseudocode.test.ts`, cobrindo cenários `INITIAL`, `KEEP`, `SWAP`, formatação de comparações, identificação de troca e imutabilidade estrita.
- **Responsividade e Usabilidade:** O painel empilha-se verticalmente em telas compactas e conta com rolagem suave (`overflow-y-auto`) em resoluções de altura reduzida.

### 4.2. Custos e Limitações
- O pseudocódigo sincronizado cobre exclusivamente o algoritmo Bubble Sort nesta etapa. Algoritmos futuros (Selection Sort, Insertion Sort) exigirão suas próprias tabelas de instruções canônicas correspondentes.

---

## 5. Riscos e Mitigações

| Risco Identificado | Severidade | Estratégia de Mitigação |
| :--- | :--- | :--- |
| **Sobrecarga cognitiva ou competição visual com a esteira** | Média | O painel adota cores sóbrias do design system sci-fi, destacando apenas a linha primária do micro-passo corrente. |
| **Dessincronização de índices (0-based vs diegético 1-based)** | Média | O contexto factual explicita tanto a notação algorítmica $A[j]$ quanto o identificador diegético das caixas na esteira (caixa $\#j+1$). |

---

## 6. Links e Referências
- **Código-fonte:** [`src/game/replay/replayPseudocode.ts`](../../src/game/replay/replayPseudocode.ts), [`src/components/BubbleSortPseudocodePanel.tsx`](../../src/components/BubbleSortPseudocodePanel.tsx), [`src/screens/ReplayScreen.tsx`](../../src/screens/ReplayScreen.tsx)
- **Testes Automatizados:** [`src/game/replay/replayPseudocode.test.ts`](../../src/game/replay/replayPseudocode.test.ts)
- **ADR Anterior:** [`docs/adr/0004-execution-replay-state-derivation.md`](./0004-execution-replay-state-derivation.md)
- **Documentos da Wiki Relacionados:** [03-frontend.md](../wiki/03-frontend.md), [04-sorting-engine.md](../wiki/04-sorting-engine.md), [11-architecture-decisions.md](../wiki/11-architecture-decisions.md), [12-pedagogy-and-academic-traceability.md](../wiki/12-pedagogy-and-academic-traceability.md)
