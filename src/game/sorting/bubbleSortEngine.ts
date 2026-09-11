/**
 * Engine pedagógica pura de Bubble Sort para o Sorting Station.
 *
 * Módulo puramente funcional, sem efeitos colaterais e sem dependências de React ou DOM.
 * Implementa a variante didática determinística com n-1 passadas completas, garantindo
 * rastreabilidade formal do laço externo (i) e do laço interno (j).
 */

import type {
  BubbleSortState,
  ExpectedComparison,
  StepRecord,
  UserDecision,
  UserStepResult,
} from "./types"

/**
 * Calcula o número total teórico de comparações para um vetor de tamanho n no Bubble Sort clássico.
 * Fórmula: n * (n - 1) / 2
 */
export function calculateTotalExpectedComparisons(arrayLength: number): number {
  if (arrayLength <= 1) return 0
  return (arrayLength * (arrayLength - 1)) / 2
}

/**
 * Calcula a porcentagem inteira de progresso real da sessão didática de Bubble Sort (0 a 100).
 * Baseia-se no número de micro-passos formais concluídos em relação ao total teórico esperado.
 */
export function calculateBubbleSortProgress(state: BubbleSortState): number {
  if (state.completed || state.arrayLength <= 1) {
    return 100
  }
  const total = calculateTotalExpectedComparisons(state.arrayLength)
  if (total <= 0) return 100
  const completed = state.history.length
  return Math.min(100, Math.round((completed / total) * 100))
}

/**
 * Cria o estado inicial imutável de uma sessão de Bubble Sort.
 *
 * Trata casos de borda:
 * - Vetores vazios ou com 1 elemento já iniciam no estado concluído (completed = true);
 * - Vetores com 2 ou mais elementos iniciam na passada 0, índice de comparação 0.
 */
export function createBubbleSortState(
  values: readonly number[],
): BubbleSortState {
  const initialValues = Object.freeze([...values])
  const currentValues = Object.freeze([...values])
  const arrayLength = initialValues.length

  if (arrayLength <= 1) {
    return Object.freeze({
      initialValues,
      currentValues,
      arrayLength,
      passIndex: 0,
      comparisonIndex: 0,
      comparisons: 0,
      swaps: 0,
      swapsInCurrentPass: 0,
      errors: 0,
      status: "COMPLETED",
      completed: true,
      sortedBoundary: 0,
      history: Object.freeze([]),
    })
  }

  return Object.freeze({
    initialValues,
    currentValues,
    arrayLength,
    passIndex: 0,
    comparisonIndex: 0,
    comparisons: 0,
    swaps: 0,
    swapsInCurrentPass: 0,
    errors: 0,
    status: "IN_PROGRESS",
    completed: false,
    sortedBoundary: arrayLength,
    history: Object.freeze([]),
  })
}

/**
 * Retorna as informações do próximo par de índices e valores que deve ser comparado pelo algoritmo.
 * Retorna null se o algoritmo já tiver sido concluído.
 */
export function getExpectedComparison(
  state: BubbleSortState,
): ExpectedComparison | null {
  if (state.completed || state.arrayLength <= 1) {
    return null
  }

  const { passIndex, comparisonIndex, currentValues, arrayLength } = state

  // No Bubble Sort: passIndex varia de 0 até arrayLength - 2
  // Para cada passada i, comparisonIndex varia de 0 até arrayLength - 2 - passIndex
  const maxComparisonIndex = arrayLength - 2 - passIndex

  if (passIndex > arrayLength - 2 || comparisonIndex > maxComparisonIndex) {
    return null
  }

  const leftIndex = comparisonIndex
  const rightIndex = comparisonIndex + 1
  const leftValue = currentValues[leftIndex]
  const rightValue = currentValues[rightIndex]
  const shouldSwap = leftValue > rightValue

  const explanation = shouldSwap
    ? `${leftValue} > ${rightValue}: os elementos estão fora de ordem crescente e devem ser trocados.`
    : `${leftValue} ≤ ${rightValue}: os elementos já estão em ordem relativa e devem ser mantidos.`

  return Object.freeze({
    passIndex,
    comparisonIndex,
    leftIndex,
    rightIndex,
    leftValue,
    rightValue,
    shouldSwap,
    explanation,
  })
}

/**
 * Verifica se a sessão do Bubble Sort está formalmente completa.
 */
export function isBubbleSortComplete(state: BubbleSortState): boolean {
  return state.completed
}

/**
 * Retorna uma lista de índices numéricos que já estão definitivamente posicionados
 * (garantia formal do Bubble Sort após a conclusão de cada passada).
 */
export function getSortedIndices(state: BubbleSortState): number[] {
  if (state.completed || state.arrayLength <= 1) {
    return Array.from({ length: state.arrayLength }, (_, i) => i)
  }

  const sorted: number[] = []
  for (let i = state.sortedBoundary; i < state.arrayLength; i++) {
    sorted.push(i)
  }
  return sorted
}

/**
 * Verifica se um índice específico do vetor já está definitivamente ordenado.
 */
export function isIndexPermanentlySorted(
  state: BubbleSortState,
  index: number,
): boolean {
  if (index < 0 || index >= state.arrayLength) return false
  if (state.completed) return true
  return index >= state.sortedBoundary
}

/**
 * Executa determinística e puramente um único micro-passo do Bubble Sort.
 *
 * Realiza a troca caso seja necessária, registra no histórico, avança os ponteiros
 * do algoritmo (comparisonIndex e passIndex) e atualiza o limite de elementos fixados.
 */
export function executeBubbleSortStep(state: BubbleSortState): BubbleSortState {
  if (state.completed) {
    return state
  }

  const expected = getExpectedComparison(state)
  if (!expected) {
    return Object.freeze({
      ...state,
      completed: true,
      status: "COMPLETED",
      sortedBoundary: 0,
    })
  }

  const { leftIndex, rightIndex, leftValue, rightValue, shouldSwap } = expected
  const newValues = [...state.currentValues]

  if (shouldSwap) {
    newValues[leftIndex] = rightValue
    newValues[rightIndex] = leftValue
  }

  const nextValuesFrozen = Object.freeze(newValues)

  const stepRecord: StepRecord = Object.freeze({
    stepNumber: state.history.length + 1,
    passIndex: state.passIndex,
    comparisonIndex: state.comparisonIndex,
    indices: [leftIndex, rightIndex] as const,
    valuesBefore: state.currentValues,
    valuesAfter: nextValuesFrozen,
    leftValue,
    rightValue,
    swapped: shouldSwap,
    explanation: expected.explanation,
  })

  const nextHistory = Object.freeze([...state.history, stepRecord])
  const newComparisons = state.comparisons + 1
  const newSwaps = state.swaps + (shouldSwap ? 1 : 0)
  const newSwapsInPass = state.swapsInCurrentPass + (shouldSwap ? 1 : 0)

  const maxComparisonIndex = state.arrayLength - 2 - state.passIndex
  const isEndOfPass = state.comparisonIndex >= maxComparisonIndex

  if (!isEndOfPass) {
    // Continua na mesma passada, avança para o próximo par vizinho
    return Object.freeze({
      ...state,
      currentValues: nextValuesFrozen,
      comparisonIndex: state.comparisonIndex + 1,
      comparisons: newComparisons,
      swaps: newSwaps,
      swapsInCurrentPass: newSwapsInPass,
      status: "IN_PROGRESS",
      history: nextHistory,
    })
  }

  // Fim da passada atual: o maior elemento da varredura atingiu sua posição definitiva
  const newSortedBoundary = state.arrayLength - 1 - state.passIndex
  const isFinalPass = state.passIndex >= state.arrayLength - 2

  if (isFinalPass) {
    // Todas as passadas necessárias foram concluídas.
    // Pelo princípio da indução, o primeiro elemento restante (índice 0) também está fixado.
    return Object.freeze({
      ...state,
      currentValues: nextValuesFrozen,
      comparisonIndex: state.comparisonIndex,
      comparisons: newComparisons,
      swaps: newSwaps,
      swapsInCurrentPass: newSwapsInPass,
      status: "COMPLETED",
      completed: true,
      sortedBoundary: 0,
      history: nextHistory,
    })
  }

  // Avança para a próxima passada do laço externo
  return Object.freeze({
    ...state,
    currentValues: nextValuesFrozen,
    passIndex: state.passIndex + 1,
    comparisonIndex: 0,
    comparisons: newComparisons,
    swaps: newSwaps,
    swapsInCurrentPass: 0,
    status: "PASS_COMPLETED",
    sortedBoundary: newSortedBoundary,
    history: nextHistory,
  })
}

/**
 * Valida e processa uma decisão de interação do usuário ("SWAP" ou "KEEP")
 * sobre o par esperado corrente.
 *
 * Se a decisão for correta: avança o estado da engine e retorna valid = true.
 * Se a decisão for incorreta: incrementa o contador de erros sem avançar a posição do algoritmo.
 */
export function executeUserStep(
  state: BubbleSortState,
  decision: UserDecision,
): UserStepResult {
  if (state.completed) {
    return {
      valid: false,
      state,
      expectedDecision: "KEEP",
      actualDecision: decision,
      explanation: "O algoritmo já foi concluído.",
    }
  }

  const expected = getExpectedComparison(state)
  if (!expected) {
    return {
      valid: false,
      state,
      expectedDecision: "KEEP",
      actualDecision: decision,
      explanation: "Nenhum par disponível para comparação.",
    }
  }

  const expectedDecision: UserDecision = expected.shouldSwap ? "SWAP" : "KEEP"

  if (decision === expectedDecision) {
    const nextState = executeBubbleSortStep(state)
    const lastRecord = nextState.history[nextState.history.length - 1]

    const feedbackText =
      decision === "SWAP"
        ? `Correto! ${expected.leftValue} > ${expected.rightValue}, portanto a carga foi permutada com sucesso.`
        : `Correto! ${expected.leftValue} ≤ ${expected.rightValue}, portanto a ordem relativa foi mantida.`

    return {
      valid: true,
      state: nextState,
      expectedDecision,
      actualDecision: decision,
      explanation: feedbackText,
      stepRecord: lastRecord,
    }
  }

  // Decisão incorreta: registra erro e mantém o estado no mesmo ponto da esteira
  const penalizedState = Object.freeze({
    ...state,
    errors: state.errors + 1,
  })

  const errorExplanation =
    expectedDecision === "SWAP"
      ? `Atenção: ${expected.leftValue} > ${expected.rightValue}. No protocolo Bubble Sort, elementos fora de ordem devem ser trocados!`
      : `Atenção: ${expected.leftValue} ≤ ${expected.rightValue}. Os elementos já estão em ordem crescente e NÃO devem ser trocados!`

  return {
    valid: false,
    state: penalizedState,
    expectedDecision,
    actualDecision: decision,
    explanation: errorExplanation,
  }
}
