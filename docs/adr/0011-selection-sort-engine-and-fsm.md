# ADR 0011: Selection Sort Pure Engine e Máquina de Estados Finita (FSM)

- **Status:** Aceito
- **Data:** 2026-09-11
- **Autores:** Marcos Mendes / Antigravity AI
- **Decisores:** Mantenedores do Sorting Station

---

## 1. Contexto e Declaração do Problema

O **Sorting Station** foi concebido sob a premissa pedagógica inegociável de que **algoritmos diferentes NÃO devem ser o mesmo gameplay renomeado**. O primeiro protocolo implementado no sistema, o Bubble Sort (Marcos P0 e P1), baseia-se em comparações adjacentes estritas $(j, j+1)$ e trocas locais imediatas.

O segundo algoritmo do currículo, o **Selection Sort** ("Scanner de Carga Mínima", Marco P2.1), opera sob um modelo mental completamente distinto:
1. Divide o vetor em uma sublista já consolidada à esquerda ($0 \dots i-1$) e uma partição não ordenada à direita ($i \dots n-1$);
2. Varre exaustivamente a partição não ordenada localizando o índice da menor carga ($A[minIndex]$);
3. Ao término da varredura, executa no máximo uma única transferência pontual ($A[minIndex] \leftrightarrow A[i]$) para consolidar a posição definitiva $i$.

Para implementar este algoritmo com a mesma excelência do Bubble Sort, era necessário criar um núcleo puro de domínio (`src/game/sorting/selection/`) desacoplado de React, DOM, estilos e persistência, formalizando uma Máquina de Estados Finita (FSM) com separação estrita entre as fases de varredura/inspeção e de consolidação/transferência.

---

## 2. Decisão Arquitetural

Decidiu-se:

1. **Criar o Módulo Puro `src/game/sorting/selection/`:**
   - `types.ts`: Contratos de tipagem estrita (`SelectionSortState`, `SelectionPhase`, `SelectionStatus`, `SelectionInspectionDecision`, `SelectionStepRecord`, etc.);
   - `selectionSortEngine.ts`: Implementação pura e funcional das transições e invariantes da FSM;
   - `index.ts`: Ponto de entrada e reexportação pública do domínio;
   - `selectionSortEngine.test.ts`: Suíte de testes unitários automatizados cobrindo exaustivamente todas as invariantes e casos de borda.

2. **Modelar FSM Bimodal com Fases Estritas:**
   - **`INSPECT` (Varredura do Scanner):**
     - O scanner $j$ percorre as posições da partição não ordenada ($i+1 \le j \le n-1$).
     - O operador dispõe exclusivamente de duas decisões pedagógicas: `SELECT_NEW_MIN` e `KEEP_MIN`.
     - Critério canônico estrito: `SELECT_NEW_MIN` é válido se e somente se $A[j] < A[minIndex]$. Para valores iguais ou maiores ($A[j] \ge A[minIndex]$), a decisão válida é `KEEP_MIN`.
     - Nenhuma troca física de cargas ocorre durante a fase `INSPECT`.
     - Ao processar a última inspeção válida da passada ($j = n-1$), a FSM transiciona automaticamente para `phase: "COMMIT"` sem efetuar trocas automáticas.
   - **`COMMIT` (Transferência Pontual da Passada):**
     - Ação procedimental única: `commitSelectionPass(state)`.
     - Se $minIndex \neq i$: permuta fisicamente $currentValues[i]$ e $currentValues[minIndex]$, incrementando $swaps$ em $1$.
     - Se $minIndex === i$: nenhuma troca física ocorre; $swaps$ permanece inalterado.
     - Em ambos os casos: a posição $i$ é consolidada com o selo definitivo (`sortedBoundary = i + 1`).
     - Se $i < n - 2$: inicializa a próxima passada ($i \leftarrow i + 1$, $minIndex \leftarrow i + 1$, $j \leftarrow i + 2$, `phase: "INSPECT"`).
     - Se $i = n - 2$: encerra o algoritmo, consolidando também o último elemento ($n-1$) por indução, fixando `completed = true`, `phase: "COMPLETED"`, `status: "COMPLETED"` e `sortedBoundary = n`.
   - **Bloqueio Mútuo:** Tentativas de executar inspeção durante `COMMIT` ou de executar commit durante `INSPECT` são rejeitadas com erro pedagógico (`errors += 1`), sem avanço de ponteiros e sem mutação de vetores.

3. **Penalização Pedagógica Factual e Não Punitiva:**
   - Uma decisão incorreta incrementa `state.errors`, não altera o vetor numérico, não avança o ponteiro $j$, não altera $minIndex$ e não incrementa o contador de comparações formais;
   - Ações incorretas não geram registros no `history` algorítmico, mantendo o histórico de passos limpo para futuros replays.

4. **Histórico Discriminado e Estruturado (`SelectionStepRecord`):**
   - União discriminada com tipos `"INSPECTION"` e `"COMMIT"`;
   - Registra snapshots factuais do vetor, índices envolvidos, decisões esperadas vs executadas e explicações formativas detalhadas em português.

5. **Rigor nos Limites Matemáticos e Comparabilidade:**
   - O número de comparações formais é estritamente $n(n-1)/2$;
   - O número de trocas físicas é **no máximo $n-1$** (e não identicamente $n-1$, pois passadas onde $minIndex === i$ geram zero trocas);
   - Comparação formal com Bubble Sort: para entradas aleatórias distintas, o Bubble Sort nas três fases (vetores de 4, 5 e 6 elementos) possui máximo total de 31 trocas ($6 + 10 + 15$) e valor esperado teórico de 15,5 inversões/trocas ($3 + 5 + 7,5$), ao passo que o Selection Sort realiza no máximo 12 trocas ($3 + 4 + 5 = 12$) e frequentemente menos devido a passadas com $minIndex === i$.

---

## 3. Alternativas Consideradas

- **Alternativa A: Reutilizar superficialmente as ações `SWAP` e `KEEP` do Bubble Sort.**  
  *Por que foi descartada:* Viola o cerne pedagógico do Selection Sort. No Selection Sort, examinar uma carga não implica decidir uma permuta imediata com o vizinho, mas sim registrar uma referência temporária de menor elemento.
- **Alternativa B: Função genérica unificada misturando INSPECT e COMMIT.**  
  *Por que foi descartada:* Obscureceria os contratos de tipagem, dificultaria a validação de invariantes e tornaria o código frágil para testes e replays.
- **Alternativa C: Executar a troca automaticamente ao final da varredura sem confirmação do operador.**  
  *Por que foi descartada:* Prejudicaria o aprendizado cinestésico do estudante, que precisa perceber conscientemente o momento em que a varredura termina e a transferência é autorizada.

---

## 4. Consequências e Trade-offs

### 4.1. Consequências Positivas (Ganhos)
- **Domínio Puro e Testabilidade Exaustiva:** A engine é 100% pura, imutável e desacoplada, facilitando simulações, headless tests e verificação formal.
- **Fidelidade Algorítmica e Pedagógica:** O operador vivencia a diferença real entre os paradigmas de ordenação.
- **Fundação Firme para UI e Replay:** A separação das fases e o histórico discriminado viabilizam interfaces ricas (`GameScreen`, pseudocódigo e replay) sem adaptações complexas.

### 4.2. Consequências Negativas ou Custos (Trade-offs)
- A FSM possui dois momentos interativos por passada em vez de um único fluxo uniforme, exigindo que a futura interface gráfica adapte controles visuais contextuais (scanner vs alavanca de transferência).

---

## 5. Referências e Próximos Passos
- Marco P2.1-A: Design Pedagógico e Mecânico do Selection Sort;
- Marco P2.1-B: Implementação do Domínio Puro e Suíte de Testes (concluído no presente ADR);
- Próximos Marcos: UI de GameScreen (P2.1-C), Tutorial Interativo, Pseudocódigo Sincronizado, Replay e Integração na Campanha.
