/**
 * Engine pedagógica pura de Selection Sort para o Sorting Station.
 *
 * Módulo puramente funcional, imutável e sem efeitos colaterais.
 * Modela a FSM canônica do algoritmo com separação estrita entre:
 * 1. INSPECT: Varredura de busca do menor elemento via scanner (j de i+1 a n-1);
 * 2. COMMIT: Confirmação de transferência pontual para a posição definitiva (i).
 *
 * Não utiliza nem depende de React, DOM ou localStorage.
 */

import type {
  ExpectedSelectionCommit,
  ExpectedSelectionInspection,
  SelectionCommitResult,
  SelectionInspectionDecision,
  SelectionInspectionResult,
  SelectionInspectionStepRecord,
  SelectionCommitStepRecord,
  SelectionSortState,
} from "./types";

/**
 * Retorna os índices consolidados em ordem crescente de 0 até boundary - 1.
 */
function getSortedIndicesUpTo(boundary: number): readonly number[] {
  if (boundary <= 0) return Object.freeze([]);
  const indices: number[] = [];
  for (let idx = 0; idx < boundary; idx++) {
    indices.push(idx);
  }
  return Object.freeze(indices);
}

/**
 * Calcula o total formal teórico de comparações para um vetor de tamanho n no Selection Sort.
 * Fórmula analítica: n * (n - 1) / 2
 */
export function calculateTotalExpectedSelectionComparisons(
  arrayLength: number,
): number {
  if (arrayLength <= 1) return 0;
  return (arrayLength * (arrayLength - 1)) / 2;
}

/**
 * Retorna a porcentagem inteira de progresso real da sessão (0 a 100).
 * Baseia-se nas comparações formais completadas em relação ao total analítico.
 */
export function calculateSelectionSortProgress(
  state: SelectionSortState,
): number {
  if (state.completed || state.arrayLength <= 1) {
    return 100;
  }
  const total = calculateTotalExpectedSelectionComparisons(state.arrayLength);
  if (total <= 0) return 100;
  return Math.min(100, Math.round((state.comparisons / total) * 100));
}

/**
 * Retorna os índices das caixas já consolidadas com o selo definitivo (OK).
 */
export function getSelectionSortedIndices(
  state: SelectionSortState,
): readonly number[] {
  if (state.completed) {
    return getSortedIndicesUpTo(state.arrayLength);
  }
  return getSortedIndicesUpTo(state.sortedBoundary);
}

/**
 * Informa se o algoritmo foi concluído.
 */
export function isSelectionSortComplete(state: SelectionSortState): boolean {
  return state.completed;
}

/**
 * Cria o estado inicial imutável de uma sessão de Selection Sort.
 *
 * Casos de borda:
 * - Vetores vazios ou unitários já nascem no estado "COMPLETED".
 * - Vetores com n >= 2 iniciam na passada i = 0, candidato minIndex = 0, scanner j = 1, fase "INSPECT".
 */
export function createSelectionSortState(
  values: readonly number[],
): SelectionSortState {
  const initialValues = Object.freeze([...values]);
  const currentValues = Object.freeze([...values]);
  const arrayLength = initialValues.length;

  if (arrayLength <= 1) {
    return Object.freeze({
      initialValues,
      currentValues,
      arrayLength,
      i: 0,
      j: 0,
      minIndex: 0,
      phase: "COMPLETED",
      comparisons: 0,
      swaps: 0,
      errors: 0,
      sortedBoundary: arrayLength,
      history: Object.freeze([]),
      completed: true,
      status: "COMPLETED",
    });
  }

  return Object.freeze({
    initialValues,
    currentValues,
    arrayLength,
    i: 0,
    j: 1,
    minIndex: 0,
    phase: "INSPECT",
    comparisons: 0,
    swaps: 0,
    errors: 0,
    sortedBoundary: 0,
    history: Object.freeze([]),
    completed: false,
    status: "IDLE",
  });
}

/**
 * Retorna as informações e a decisão esperada para a próxima comparação do scanner.
 * Retorna null se o algoritmo estiver em fase de commit ou já concluído.
 */
export function getExpectedSelectionInspection(
  state: SelectionSortState,
): ExpectedSelectionInspection | null {
  if (state.completed || state.phase !== "INSPECT") {
    return null;
  }

  const { i, j, minIndex, currentValues } = state;
  const scannerValue = currentValues[j];
  const currentMinValue = currentValues[minIndex];
  const targetValue = currentValues[i];

  // Comparação estrita canônica: A[j] < A[minIndex]
  // Em caso de igualdade (duplicados), o critério é falso -> KEEP_MIN
  const isNewMin = scannerValue < currentMinValue;
  const expectedDecision: SelectionInspectionDecision = isNewMin
    ? "SELECT_NEW_MIN"
    : "KEEP_MIN";

  const explanation = isNewMin
    ? `Carga inspecionada A[${j}] (${scannerValue}) é menor que o candidato atual A[${minIndex}] (${currentMinValue}). Novo candidato mínimo marcado no índice ${j}.`
    : `Carga inspecionada A[${j}] (${scannerValue}) não é menor que o candidato atual A[${minIndex}] (${currentMinValue}). Candidato mantido no índice ${minIndex}.`;

  return Object.freeze({
    i,
    j,
    minIndex,
    scannerValue,
    currentMinValue,
    targetValue,
    expectedDecision,
    isNewMin,
    explanation,
  });
}

/**
 * Retorna as informações da próxima confirmação de passada (commit).
 * Retorna null se a esteira ainda estiver em fase de inspeção ou já concluída.
 */
export function getExpectedSelectionCommit(
  state: SelectionSortState,
): ExpectedSelectionCommit | null {
  if (state.completed || state.phase !== "COMMIT") {
    return null;
  }

  const { i, minIndex, currentValues } = state;
  const targetValue = currentValues[i];
  const minValue = currentValues[minIndex];
  const shouldSwap = minIndex !== i;

  const explanation = shouldSwap
    ? `Varredura da passada ${i + 1} concluída. Menor carga A[${minIndex}] (${minValue}) transferida para a posição definitiva ${i}.`
    : `Varredura da passada ${i + 1} concluída. A carga A[${i}] (${targetValue}) já é a menor da partição. Nenhuma troca necessária; posição ${i} consolidada.`;

  return Object.freeze({
    i,
    minIndex,
    targetValue,
    minValue,
    shouldSwap,
    explanation,
  });
}

/**
 * Valida e processa uma decisão de inspeção do operador ("SELECT_NEW_MIN" ou "KEEP_MIN").
 *
 * Invariantes:
 * - Se válida: registra a comparação, atualiza minIndex se aplicável, grava histórico
 *   e avança o scanner j. Se j atingiu o fim da esteira (j == n - 1), transiciona para COMMIT.
 * - Se inválida: incrementa state.errors sem avançar ponteiros, sem alterar minIndex
 *   e sem alterar o vetor numérico.
 */
export function executeSelectionInspection(
  state: SelectionSortState,
  decision: SelectionInspectionDecision,
): SelectionInspectionResult {
  if (state.completed) {
    return Object.freeze({
      state,
      valid: false,
      expectedDecision: "KEEP_MIN",
      errorReason: "O algoritmo já está concluído.",
    });
  }

  if (state.phase !== "INSPECT") {
    const nextState = Object.freeze({
      ...state,
      errors: state.errors + 1,
    });
    return Object.freeze({
      state: nextState,
      valid: false,
      expectedDecision: "KEEP_MIN",
      errorReason:
        "Ação inválida: a esteira está aguardando confirmação de transferência (COMMIT), não inspeção.",
    });
  }

  const expected = getExpectedSelectionInspection(state);
  if (!expected) {
    return Object.freeze({
      state,
      valid: false,
      expectedDecision: "KEEP_MIN",
      errorReason: "Não há inspeção pendente no momento.",
    });
  }

  if (decision !== expected.expectedDecision) {
    const errorReason =
      expected.expectedDecision === "SELECT_NEW_MIN"
        ? `Decisão incorreta: a carga inspecionada A[${state.j}] (${expected.scannerValue}) é MENOR que o candidato atual A[${state.minIndex}] (${expected.currentMinValue}). Você deveria selecionar NOVO MÍNIMO.`
        : `Decisão incorreta: a carga inspecionada A[${state.j}] (${expected.scannerValue}) NÃO é menor que o candidato atual A[${state.minIndex}] (${expected.currentMinValue}). Você deveria MANTER o candidato atual.`;

    const nextState = Object.freeze({
      ...state,
      errors: state.errors + 1,
    });

    return Object.freeze({
      state: nextState,
      valid: false,
      expectedDecision: expected.expectedDecision,
      errorReason,
    });
  }

  // Decisão correta do operador
  const newMinIndex = decision === "SELECT_NEW_MIN" ? state.j : state.minIndex;
  const isEndOfScan = state.j >= state.arrayLength - 1;

  const inspectionRecord: SelectionInspectionStepRecord = Object.freeze({
    type: "INSPECTION",
    stepNumber: state.history.length + 1,
    i: state.i,
    j: state.j,
    minIndexBefore: state.minIndex,
    minIndexAfter: newMinIndex,
    comparedValues: Object.freeze({
      scannerIndex: state.j,
      scannerValue: expected.scannerValue,
      currentMinIndex: state.minIndex,
      currentMinValue: expected.currentMinValue,
      targetIndex: state.i,
      targetValue: expected.targetValue,
    }),
    expectedDecision: expected.expectedDecision,
    executedDecision: decision,
    isNewMinFound: decision === "SELECT_NEW_MIN",
    valuesSnapshot: state.currentValues,
    sortedIndices: getSelectionSortedIndices(state),
    explanation: expected.explanation,
  });

  const nextHistory = Object.freeze([...state.history, inspectionRecord]);
  const nextComparisons = state.comparisons + 1;

  if (isEndOfScan) {
    // Fim da varredura da passada: transiciona para fase COMMIT sem executar a troca automática
    const nextState = Object.freeze({
      ...state,
      j: state.j,
      minIndex: newMinIndex,
      phase: "COMMIT" as const,
      status: "PASS_COMPLETED" as const,
      comparisons: nextComparisons,
      history: nextHistory,
    });

    return Object.freeze({
      state: nextState,
      valid: true,
      expectedDecision: expected.expectedDecision,
    });
  }

  // Avança o scanner para a próxima posição na partição não ordenada
  const nextState = Object.freeze({
    ...state,
    j: state.j + 1,
    minIndex: newMinIndex,
    phase: "INSPECT" as const,
    status: "RUNNING" as const,
    comparisons: nextComparisons,
    history: nextHistory,
  });

  return Object.freeze({
    state: nextState,
    valid: true,
    expectedDecision: expected.expectedDecision,
  });
}

/**
 * Executa o fechamento formal da passada (COMMIT).
 *
 * Invariantes:
 * - Só pode ser executado quando state.phase === "COMMIT".
 * - Se minIndex !== i: permuta currentValues[i] e currentValues[minIndex], swaps += 1.
 * - Se minIndex === i: nenhuma troca física, swaps inalterado.
 * - Consolida a posição i.
 * - Se i == n - 2: todas as posições foram ordenadas; encerra com completed = true.
 * - Se i < n - 2: avança para a próxima passada i + 1, configurando minIndex = i + 1, j = i + 2, phase = "INSPECT".
 */
export function commitSelectionPass(
  state: SelectionSortState,
): SelectionCommitResult {
  if (state.completed) {
    return Object.freeze({
      state,
      valid: false,
      didSwap: false,
      errorReason: "O algoritmo já está concluído.",
    });
  }

  if (state.phase !== "COMMIT") {
    const nextState = Object.freeze({
      ...state,
      errors: state.errors + 1,
    });
    return Object.freeze({
      state: nextState,
      valid: false,
      didSwap: false,
      errorReason:
        "Ação inválida: a esteira ainda está em fase de inspeção (INSPECT). Conclua a varredura antes de transferir a carga.",
    });
  }

  const expected = getExpectedSelectionCommit(state);
  if (!expected) {
    return Object.freeze({
      state,
      valid: false,
      didSwap: false,
      errorReason: "Não há confirmação de passada pendente.",
    });
  }

  const { i, minIndex, currentValues, arrayLength } = state;
  const didSwap = expected.shouldSwap;
  const newValues = [...currentValues];

  if (didSwap) {
    newValues[i] = currentValues[minIndex];
    newValues[minIndex] = currentValues[i];
  }

  const nextValuesFrozen = Object.freeze(newValues);
  const isFinalPass = i >= arrayLength - 2;
  const newSortedBoundary = isFinalPass ? arrayLength : i + 1;
  const sortedIndices = getSortedIndicesUpTo(newSortedBoundary);

  const commitRecord: SelectionCommitStepRecord = Object.freeze({
    type: "COMMIT",
    stepNumber: state.history.length + 1,
    i,
    minIndex,
    didSwap,
    valuesBefore: currentValues,
    valuesAfter: nextValuesFrozen,
    targetValueBefore: expected.targetValue,
    minValueBefore: expected.minValue,
    valuesSnapshot: nextValuesFrozen,
    sortedIndices,
    explanation: expected.explanation,
  });

  const nextHistory = Object.freeze([...state.history, commitRecord]);
  const nextSwaps = state.swaps + (didSwap ? 1 : 0);

  if (isFinalPass) {
    // Última passada concluída: todo o vetor está consolidado
    const nextState = Object.freeze({
      ...state,
      currentValues: nextValuesFrozen,
      i,
      j: arrayLength,
      minIndex,
      phase: "COMPLETED" as const,
      status: "COMPLETED" as const,
      swaps: nextSwaps,
      sortedBoundary: arrayLength,
      completed: true,
      history: nextHistory,
    });

    return Object.freeze({
      state: nextState,
      valid: true,
      didSwap,
    });
  }

  // Avança para a próxima passada do algoritmo
  const nextI = i + 1;
  const nextState = Object.freeze({
    ...state,
    currentValues: nextValuesFrozen,
    i: nextI,
    j: nextI + 1,
    minIndex: nextI,
    phase: "INSPECT" as const,
    status: "RUNNING" as const,
    swaps: nextSwaps,
    sortedBoundary: newSortedBoundary,
    history: nextHistory,
  });

  return Object.freeze({
    state: nextState,
    valid: true,
    didSwap,
  });
}

/**
 * Função utilitária pura para avançar automaticamente um passo algorítmico do Selection Sort.
 * Se em INSPECT: executa a inspeção esperada correta.
 * Se em COMMIT: executa o commit da passada.
 * Útil para testes automatizados, simulações sem UI e geração pura de históricos.
 */
export function executeSelectionStep(
  state: SelectionSortState,
): SelectionSortState {
  if (state.completed) {
    return state;
  }

  if (state.phase === "INSPECT") {
    const expected = getExpectedSelectionInspection(state);
    if (!expected) return state;
    const result = executeSelectionInspection(state, expected.expectedDecision);
    return result.state;
  }

  if (state.phase === "COMMIT") {
    const result = commitSelectionPass(state);
    return result.state;
  }

  return state;
}
