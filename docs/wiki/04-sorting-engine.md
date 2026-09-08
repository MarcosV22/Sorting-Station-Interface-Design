# 04 — Motor de Ordenação: Lógica Atual e Engine Pedagógica Planejada

> **Documento canônico:** Especificação técnica e formal da lógica algorítmica, análise da engine atual de Bubble Sort, modelo formal da máquina de estados pedagógica e plano de expansão do **Sorting Station**.  
> **Status:** Ativo / Base de Verdade da Wiki  
> **Data:** 08/09/2026  
> **Dependências:** [`AGENTS.md`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/AGENTS.md), [`CLAUDE.md`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/CLAUDE.md), [`docs/wiki/00-repository-inventory.md`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/docs/wiki/00-repository-inventory.md), [`docs/wiki/02-system-architecture.md`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/docs/wiki/02-system-architecture.md), [`docs/wiki/03-frontend.md`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/docs/wiki/03-frontend.md).

---

# PARTE A — ESTADO ATUAL (ANÁLISE DO PROTÓTIPO)

Esta parte documenta a implementação fática da lógica de ordenação que se encontra atualmente no código-fonte, concentrada em [`src/screens/GameScreen.tsx`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx), [`src/App.tsx`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/App.tsx) e [`src/components/NumberedBox.tsx`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/components/NumberedBox.tsx).

---

## 1. Funcionamento Passo a Passo da Lógica Atual

### 1.1. Seleção da Primeira Caixa
- Quando o jogador clica em uma caixa da esteira e nenhuma caixa está selecionada (`selected === null`), a função `handleBoxClick(index)` salva o índice no estado `selected` ([`src/screens/GameScreen.tsx:L45-L49`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L45-L49)).
- A mensagem em `InstructionPanel` é atualizada para `"Caixa #X selecionada. Clique em uma caixa vizinha para comparar."` com tipo `"info"`.
- A caixa ganha a classe visual de seleção (`border-amber-400` e animação `pulse-border`) via prop `selected={selected === index}` ([`src/screens/GameScreen.tsx:L196`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L196)).

### 1.2. Cancelamento da Seleção
- Se o usuário clicar novamente na mesma caixa já selecionada (`selected === index`), o manipulador cancela o foco, redefinindo `selected` para `null` e emitindo `"Seleção cancelada."` ([`src/screens/GameScreen.tsx:L51-L55`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L51-L55)).

### 1.3. Validação de Adjacência
- Ao clicar em uma segunda caixa com índice diferente (`selected !== null && selected !== index`), o código verifica se a distância absoluta entre os índices é igual a $1$:
  ```typescript
  // src/screens/GameScreen.tsx:L58-L62
  if (Math.abs(selected - index) !== 1) {
    setSelected(null);
    setInstruction({
      text: "As caixas precisam ser vizinhas para serem comparadas!",
      type: "warning",
    });
    return;
  }
  ```
- Caso a distância seja diferente de $1$ (ex.: índices 0 e 2), a seleção é cancelada imediatamente com aviso de severidade `"warning"`.

### 1.4. Incremento do Contador de Comparações
- Estando validada a adjacência, o par é normalizado em índices de esquerda e direita:
  `left = Math.min(selected, index)` e `right = left + 1` ([`src/screens/GameScreen.tsx:L64-L65`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L64-L65)).
- O contador de comparações é incrementado incondicionalmente: `setComparisons(comparisons + 1)` ([`src/screens/GameScreen.tsx:L67`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L67)).

### 1.5. Troca Condicional (`boxes[left] > boxes[right]`)
- **Se `boxes[left] > boxes[right]` ([`src/screens/GameScreen.tsx:L71-L87`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L71-L87)):**
  - O estado `animating` é setado para `true`;
  - A mensagem exibe `"Trocando: X > Y — colocando em ordem crescente..."` com tipo `"success"`;
  - Dispara-se um `setTimeout` de $500\text{ms}$;
  - Após $500\text{ms}$, os valores são permutados em uma cópia imutável do array: `[newBoxes[left], newBoxes[right]] = [newBoxes[right], newBoxes[left]]`;
  - O contador de trocas é incrementado: `setSwaps(swaps + 1)`;
  - `setBoxes(newBoxes)` e `setAnimating(false)` são executados;
  - Se `isSorted(newBoxes)` for verdadeiro, agenda-se a finalização da fase via callback `onComplete` após $400\text{ms}$.
- **Se `boxes[left] <= boxes[right]` ([`src/screens/GameScreen.tsx:L89-L96`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L89-L96)):**
  - Nenhuma permuta é executada;
  - Exibe `"X ≤ Y — já estão na ordem correta!"` com tipo `"info"`;
  - Se `isSorted(boxes)` for verdadeiro, agenda-se `onComplete` após $400\text{ms}$.

### 1.6. Detecção de Vetor Ordenado
- Avaliada pela função inlined `isSorted(arr)` ([`src/screens/GameScreen.tsx:L33-L35`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L33-L35)):
  ```typescript
  function isSorted(arr: number[]): boolean {
    return arr.every((v, i) => i === 0 || arr[i - 1] <= v);
  }
  ```
- Essa função simplesmente varre o vetor verificando monotonicidade não decrescente.

### 1.7. Sistema de Dica Atual
- Implementado pela função `findNextSwap(arr)` ([`src/screens/GameScreen.tsx:L37-L41`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L37-L41)):
  ```typescript
  function findNextSwap(arr: number[]): number | null {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) return i;
    }
    return null;
  }
  ```
- Ao clicar no botão "DICA" ([`src/screens/GameScreen.tsx:L110-L128`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L110-L128)), a busca encontra a **primeira inversão adjacente** da esquerda para a direita e preenche `hintPair = [idx, idx + 1]`. As caixas correspondentes recebem borda âmbar tracejada.

### 1.8. Reinício da Fase (`handleReset`)
- Limpa o estado local e restaura o array a partir da prop: `setBoxes([...initialArray])` ([`src/screens/GameScreen.tsx:L99-L108`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L99-L108)). Zera `comparisons`, `swaps`, `selected` e `hintPair`.

### 1.9. Cálculo de Progresso Atual
- Exibido na barra de progresso da esteira ([`src/screens/GameScreen.tsx:L260`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L260)):
  ```typescript
  const progressPercent = Math.round(
    isSorted(boxes) ? 100 : (swaps / Math.max(swaps + 2, 4)) * 80
  );
  ```
- **Limitação:** Trata-se de uma aproximação visual arbitrária que varia com a quantidade de trocas feitas, e não com o número de comparações completadas do algoritmo.

### 1.10. Marcação de Caixas Ordenadas (`OK`)
- Calculada através de uma contagem de sufixo ordenado ([`src/screens/GameScreen.tsx:L130-L136`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L130-L136)):
  ```typescript
  let sortedCount = 0;
  for (let i = boxes.length - 1; i >= 0; i--) {
    if (i === boxes.length - 1 || boxes[i] <= boxes[i + 1]) {
      sortedCount++;
    } else {
      break;
    }
  }
  ```
- Cada caixa recebe `sorted={index >= boxes.length - sortedCount && isSorted(boxes.slice(index))}` ([`src/screens/GameScreen.tsx:L195`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L195)).
- **Limitação:** Se o vetor for `[2, 4, 1, 5]`, o sufixo `[5]` é marcado como `OK`, mas se o vetor for acidentalmente `[1, 2, 4, 3]`, nenhum elemento é marcado mesmo que as primeiras posições já estivessem estáveis. A heurística não se baseia nas passadas reais do Bubble Sort.

### 1.11. Animação de Troca e Defeito Observado
- Em [`src/screens/GameScreen.tsx:L68`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L68), `setSelected(null)` é invocado **antes** do `setTimeout` de $500\text{ms}$.
- Como consequência, na linha 199:
  ```typescript
  animating={animating ? (index === selected ? "right" : "left") : null}
  ```
  `index === selected` compara `index` com `null` (sempre `false`), fazendo com que **todas as caixas em animação recebam a classe `"left"`**, quebrando a simetria da animação visual (`animate-swap-left` em uma e `animate-swap-right` na outra).

---

## 2. A Dívida Técnica Pedagógica Central

> [!WARNING]
> **O usuário atualmente pode escolher qualquer par adjacente em qualquer ordem.**  
> Por exemplo, no vetor `[5, 2, 4, 1]`, o jogador pode comparar as caixas dos índices 2 e 3 (`4` e `1`) antes de sequer tocar nos índices 0 e 1 (`5` e `2`).  
> **Portanto, o protótipo atual NÃO constitui uma simulação estrita da sequência do Bubble Sort.** Trata-se de um puzzle de ordenação por pares vizinhos, e não da execução de um algoritmo determinístico.

---

# PARTE B — ENGINE PEDAGÓGICA PLANEJADA (BUBBLE SORT)

Esta seção especifica formalmente a **Máquina de Estados Finita (FSM)** e o modelo de dados de domínio necessários para transformar o Bubble Sort em uma experiência pedagógica rigorosa e reprodutível.

---

## 1. Modelo de Dados da Sessão (`BubbleSortState`) `[PLANEJADO]`

A engine pedagógica deve encapsular todas as variáveis de estado algorítmico em uma estrutura imutável:

```typescript
// [PLANEJADO] Modelo de domínio da engine pedagógica do Bubble Sort
interface BubbleSortSession {
  // Dados fundamentais
  readonly initialArray: readonly number[];
  readonly currentArray: readonly number[];
  readonly arrayLength: number;

  // Controle de ponteiros e laços
  readonly passIndex: number;          // i: passada atual (0 <= i < n - 1)
  readonly comparisonIndex: number;    // j: índice de comparação atual (0 <= j < n - 1 - i)
  readonly currentPair: [number, number]; // [j, j + 1] - O par mandatório da vez
  readonly sortedBoundary: number;     // Índice a partir do qual elementos estão fixados (n - i)
  
  // Telemetria e métricas operacionais
  readonly totalComparisons: number;   // (n * (n - 1)) / 2 (pior caso / sem early exit)
  readonly comparisonsCompleted: number; // Comparações válidas realizadas
  readonly swaps: number;              // Total de permutas executadas
  readonly swapsInCurrentPass: number; // Permutas na passada ativa (para early exit)
  readonly errors: number;             // Ações fora do protocolo (cliques inválidos/decisões erradas)
  readonly hintsUsed: number;          // Quantidade de dicas solicitadas
  
  // Estado e histórico
  readonly status: PhaseStatus;        // Estado na máquina de estados
  readonly history: readonly StepRecord[]; // Log imutável para replay
  
  // Mensagem contextual derivada
  readonly message: {
    readonly text: string;
    readonly type: "info" | "warning" | "success" | "error";
    readonly pseudocodeLine: number;
  };
}

// [PLANEJADO] Estados operacionais da fase
type PhaseStatus =
  | "IDLE"                    // Aguardando início
  | "AWAITING_PAIR_SELECTION" // Esperando o jogador clicar no par [j, j + 1]
  | "AWAITING_DECISION"       // Par focado; aguardando decisão (Trocar vs. Manter)
  | "ANIMATING_SWAP"          // Executando animação de permuta física
  | "PASS_COMPLETED"          // Fim da passada; elemento final é fixado
  | "EARLY_TERMINATION"       // Passada sem trocas; encerramento antecipado
  | "PHASE_COMPLETED";        // Vetor totalmente ordenado
```

---

## 2. Diagrama de Transições da FSM `[PLANEJADO]`

```mermaid
stateDiagram-v2
    [*] --> IDLE : Carregar vetor da fase
    IDLE --> AWAITING_PAIR_SELECTION : startPhase()

    AWAITING_PAIR_SELECTION --> AWAITING_PAIR_SELECTION : clickForaDoParEsperado()\n[Registra Erro + Feedback]
    AWAITING_PAIR_SELECTION --> AWAITING_DECISION : clickParEsperado([j, j+1])

    AWAITING_DECISION --> ANIMATING_SWAP : submitDecision('SWAP')\n[Válido se A[j] > A[j+1]]
    AWAITING_DECISION --> ADVANCING : submitDecision('KEEP')\n[Válido se A[j] <= A[j+1]]
    AWAITING_DECISION --> AWAITING_DECISION : submitDecisionIncorreta()\n[Registra Erro + Explicação]

    ANIMATING_SWAP --> ADVANCING : animationFinished()

    state ADVANCING <<choice>>
    ADVANCING --> AWAITING_PAIR_SELECTION : se j < n - 2 - i (próximo par)
    ADVANCING --> PASS_COMPLETED : se j == n - 2 - i (fim da passada)

    state CHECK_EARLY_EXIT <<choice>>
    PASS_COMPLETED --> CHECK_EARLY_EXIT : avaliar passada

    CHECK_EARLY_EXIT --> EARLY_TERMINATION : swapsInCurrentPass == 0
    CHECK_EARLY_EXIT --> AWAITING_PAIR_SELECTION : swapsInCurrentPass > 0 && i < n - 2\n[Fixa A[n-1-i], i++, j=0]
    CHECK_EARLY_EXIT --> PHASE_COMPLETED : i == n - 2 (todas passadas esgotadas)

    EARLY_TERMINATION --> PHASE_COMPLETED : finalizar
    PHASE_COMPLETED --> [*] : Conclusão da fase
```

---

## 3. Especificação das Transições de Estado `[PLANEJADO]`

| Transição / Evento | Pré-condição | Ações e Mutações de Estado | Pós-condição / Próximo Estado |
| :--- | :--- | :--- | :--- |
| **`START_PHASE`** | `status === 'IDLE'` | Inicializa `passIndex = 0`, `comparisonIndex = 0`, `currentPair = [0, 1]`, `sortedBoundary = n`, contadores zerados. | `status = 'AWAITING_PAIR_SELECTION'` |
| **`SELECT_PAIR([p1, p2])`** | `status === 'AWAITING_PAIR_SELECTION'` | Se `[p1, p2] === currentPair`: ativa foco no par. Se diferente: incrementa `errors`, emite aviso: *"Protocolo exige avaliar caixas #j e #(j+1)!"*. | Se válido: `AWAITING_DECISION`. Se inválido: permanece em `AWAITING_PAIR_SELECTION`. |
| **`DECIDE_SWAP`** | `status === 'AWAITING_DECISION'` | Se $A[j] > A[j+1]$: correto! Incrementa `swaps` e `swapsInCurrentPass`, dispara animação. Se $A[j] \le A[j+1]$: incorreto! Incrementa `errors`, explica: *"Elemento não é maior, não deve trocar"*. | Se correto: `ANIMATING_SWAP`. Se incorreto: permanece em `AWAITING_DECISION`. |
| **`DECIDE_KEEP`** | `status === 'AWAITING_DECISION'` | Se $A[j] \le A[j+1]$: correto! Posição mantida. Se $A[j] > A[j+1]$: incorreto! Incrementa `errors`, explica: *"X > Y: na passada do Bubble Sort, o maior deve avançar"*. | Se correto: vai para avaliação de avanço. Se incorreto: permanece em `AWAITING_DECISION`. |
| **`ADVANCE_STEP`** | Pós-comparação/troca | Incrementa `comparisonsCompleted`. Se $j < n - 2 - i$: $j \leftarrow j + 1$, `currentPair = [j, j+1]`. | Se houver mais pares na passada: `AWAITING_PAIR_SELECTION`. Se acabou a passada: `PASS_COMPLETED`. |
| **`END_PASS`** | Fim da passada ($j = n - 1 - i$) | Fixa o elemento na posição $n - 1 - i$ como `LOCKED` (`sortedBoundary = n - 1 - i`). Se `swapsInCurrentPass === 0`: dispara `EARLY_TERMINATION`. Caso contrário: $i \leftarrow i + 1$, $j \leftarrow 0$, `swapsInCurrentPass = 0`. | `EARLY_TERMINATION` ou `AWAITING_PAIR_SELECTION` (nova passada) ou `PHASE_COMPLETED`. |
| **`REQUEST_HINT`** | Qualquer estado interativo | Incrementa `hintsUsed`. Destaca visualmente `currentPair` e exibe a decisão correta: *"Compare #j e #(j+1): como X > Y, realize a troca."* | Estado inalterado. |
| **`RESET_PHASE`** | Qualquer estado | Restaura o vetor para `initialArray` e reinicia a FSM. | `AWAITING_PAIR_SELECTION` com contadores zerados. |

---

## 4. Pseudocódigo Formal de Referência

O pseudocódigo abaixo reflete tanto o algoritmo convencional quanto a variante com detecção antecipada de ordenação (*early termination*):

```python
# Algoritmo Bubble Sort Pedagógico (com flag de troca)
def bubble_sort(A):
    n = len(A)
    for i from 0 to n - 2:              # passIndex: passada de 0 até n-2
        trocou = False
        for j from 0 to n - 2 - i:      # comparisonIndex: pares da passada
            destacar_par(j, j + 1)
            comparar(A[j], A[j + 1])
            if A[j] > A[j + 1]:
                trocar(A[j], A[j + 1])
                trocou = True
            avancar_ponteiro()
        fixar_elemento_definitivo(n - 1 - i) # Maior elemento da passada está no lugar
        if not trocou:
            encerrar_antecipadamente()  # Vetor já está estável; interrompe
            break
```

---

## 5. Exemplo Completo Passo a Passo com `[5, 2, 4, 1]`

Demonstração exata de como a engine pedagógica processa o vetor da **Fase 1** ($n = 4$, Total de Comparações teóricas no pior caso: $3 + 2 + 1 = 6$):

```text
Vetor Inicial: [ 5,  2,  4,  1 ]
Indices:         0   1   2   3
```

### PASSADA 0 ($i = 0$) — Meta: Levar o maior elemento até o índice 3 ($n - 1 - 0 = 3$)
1. **Passo 1 ($j = 0$):**
   - Par sob teste: `currentPair = [0, 1]` $\rightarrow$ Valores: $(5, 2)$.
   - Comparação: $5 > 2$ ? **Sim, troca necessária**.
   - Ação: Troca $A[0]$ com $A[1]$.
   - Vetor após passo: `[ 2,  5,  4,  1 ]`.
   - Métricas: Comparações = 1, Trocas = 1.
2. **Passo 2 ($j = 1$):**
   - Par sob teste: `currentPair = [1, 2]` $\rightarrow$ Valores: $(5, 4)$.
   - Comparação: $5 > 4$ ? **Sim, troca necessária**.
   - Ação: Troca $A[1]$ com $A[2]$.
   - Vetor após passo: `[ 2,  4,  5,  1 ]`.
   - Métricas: Comparações = 2, Trocas = 2.
3. **Passo 3 ($j = 2$):**
   - Par sob teste: `currentPair = [2, 3]` $\rightarrow$ Valores: $(5, 1)$.
   - Comparação: $5 > 1$ ? **Sim, troca necessária**.
   - Ação: Troca $A[2]$ com $A[3]$.
   - Vetor após passo: `[ 2,  4,  1,  5 ]`.
   - Métricas: Comparações = 3, Trocas = 3.
4. **Fim da Passada 0:**
   - O elemento `5` no índice 3 é marcado como **DEFINITIVAMENTE ORDENADO (`LOCKED`)** (`sortedBoundary = 3`).
   - Houve trocas nesta passada (`swapsInCurrentPass = 3 > 0`), logo o algoritmo avança para a Passada 1.

---

### PASSADA 1 ($i = 1$) — Meta: Levar o segundo maior elemento até o índice 2 ($n - 1 - 1 = 2$)
5. **Passo 4 ($j = 0$):**
   - Par sob teste: `currentPair = [0, 1]` $\rightarrow$ Valores: $(2, 4)$.
   - Comparação: $2 > 4$ ? **Não, manter ordem ($2 \le 4$)**.
   - Ação: Nenhuma troca efetuada.
   - Vetor após passo: `[ 2,  4,  1,  5 ]`.
   - Métricas: Comparações = 4, Trocas = 3.
6. **Passo 5 ($j = 1$):**
   - Par sob teste: `currentPair = [1, 2]` $\rightarrow$ Valores: $(4, 1)$.
   - Comparação: $4 > 1$ ? **Sim, troca necessária**.
   - Ação: Troca $A[1]$ com $A[2]$.
   - Vetor após passo: `[ 2,  1,  4,  5 ]`.
   - Métricas: Comparações = 5, Trocas = 4.
7. **Fim da Passada 1:**
   - O elemento `4` no índice 2 é marcado como **DEFINITIVAMENTE ORDENADO (`LOCKED`)** (`sortedBoundary = 2`).
   - Houve trocas nesta passada (`swapsInCurrentPass = 1 > 0`), avança para a Passada 2.

---

### PASSADA 2 ($i = 2$) — Meta: Levar o elemento até o índice 1 ($n - 1 - 2 = 1$)
8. **Passo 6 ($j = 0$):**
   - Par sob teste: `currentPair = [0, 1]` $\rightarrow$ Valores: $(2, 1)$.
   - Comparação: $2 > 1$ ? **Sim, troca necessária**.
   - Ação: Troca $A[0]$ com $A[1]$.
   - Vetor após passo: `[ 1,  2,  4,  5 ]`.
   - Métricas: Comparações = 6, Trocas = 5.
9. **Fim da Passada 2:**
   - O elemento `2` no índice 1 é marcado como `LOCKED`.
   - Como resta apenas o elemento no índice 0, ele é automaticamente considerado fixado.
   - Todas as passadas possíveis foram concluídas.
   - **Status final:** `PHASE_COMPLETED`.
   - **Resultado:** Vetor perfeitamente ordenado `[1, 2, 4, 5]` com exatamente 6 comparações e 5 trocas.

---

# PARTE C — EXPANSÃO PARA NOVOS ALGORITMOS

> [!IMPORTANT]
> **Princípio Obrigatório de Design:**  
> **Algoritmos diferentes NÃO devem ser o mesmo gameplay renomeado.**  
> Cada algoritmo de ordenação possui invariantes de laço, estratégias de divisão de partições e custos operacionais próprios. Portanto, cada um exige mecânicas de interação, feedbacks e representações visuais dedicadas.

---

## 1. Selection Sort (Protocolo Selection) `[PLANEJADO - P2]`

### 1.1. Fundamento Algorítmico e Pedagógico
O Selection Sort opera dividindo o vetor em duas partições: uma **sublista já ordenada** à esquerda e uma **sublista não ordenada** à direita. Em cada passada, o algoritmo varre toda a partição não ordenada para localizar o menor elemento (*minimum element*) e, ao final da varredura, realiza **uma única troca pontual** com o primeiro elemento da partição não ordenada.

### 1.2. Mecânica de Gameplay Dedicada
- **Metáfora Diegética:** *"Scanner de Carga Mínima"*.
- **Sem Trocas Adjacentes:** O jogador **não** troca vizinhos como no Bubble Sort.
- **Interação do Scanner:** O jogador desliza um sensor de escaneamento sobre a partição não ordenada. Ao identificar um valor menor que o mínimo temporário, ele deve atualizar o ponteiro `currentMinIndex`.
- **Ação de Selamento:** Ao atingir o final da esteira não ordenada, um botão especial *"TRANSFERIR MENOR CARGA"* é ativado, disparando a troca de longa distância entre o índice mínimo encontrado e a fronteira da partição não ordenada.
- **Visualização de Partição:** Uma barreira laser translúcida na esteira delimita com precisão a fronteira entre as caixas já consolidadas e as caixas sob escaneamento.

---

## 2. Insertion Sort (Protocolo Insertion) `[PLANEJADO - P2]`

### 1.1. Fundamento Algorítmico e Pedagógico
O Insertion Sort constrói a ordenação de forma incremental: ele retira o primeiro elemento da partição não ordenada (o elemento *pivot* ou chave) e o insere em sua posição relativa correta dentro da partição que **já está ordenada**, deslocando os elementos maiores uma posição para a direita para abrir espaço.

### 1.2. Mecânica de Gameplay Dedicada
- **Metáfora Diegética:** *"Desvio e Encaixe de Carga em Trânsito"*.
- **O Pacote Flutuante (*Key Element*):** O elemento a ser inserido é elevado verticalmente da esteira principal para um trilho superior suspenso.
- **Mecânica de Deslocamento para a Esquerda:** O jogador compara o pacote suspenso com os elementos da sub-esteira ordenada da direita para a esquerda. Cada elemento que for maior que o pacote em trânsito é empurrado um passo à frente (para a direita) para abrir a vaga.
- **Ação de Encaixe (*Drop*):** Quando o jogador encontra um elemento menor ou atinge a cabeceira da esteira, ele aciona o botão de pouso para encaixar a carga na lacuna aberta.
- **Valor Didático:** Ensina de forma cinestésica e inesquecível a diferença entre permutar pares locais (Bubble) e deslocar uma sequência para abrir uma vaga de inserção (Insertion).

---

## 3. Matriz Comparativa de Mecânicas

| Algoritmo | Complexidade Média | Comparações no MVP | Trocas / Deslocamentos | Mecânica Interativa de Gameplay |
| :--- | :--- | :--- | :--- | :--- |
| **Bubble Sort** | $O(n^2)$ | Adjacentes estritas $(j, j+1)$ | Trocas imediatas entre vizinhos | Clicar no par vizinho mandatório e validar se troca ou mantém |
| **Selection Sort** | $O(n^2)$ | Varredura de busca do mínimo | $1$ troca por passada ao final | Escanear com sensor, marcar o menor valor e transferir para a fronteira |
| **Insertion Sort** | $O(n^2)$ | Regressivas na sublista ordenada | Deslocamentos sucessivos para a direita | Elevar pacote chave, deslocar cargas maiores e encaixar na vaga |
