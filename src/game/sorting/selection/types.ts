/**
 * Contratos de tipos para a Selection Sort Engine do Sorting Station.
 *
 * Módulo puramente funcional, sem efeitos colaterais e sem dependências de React ou DOM.
 * Modela a FSM canônica do Selection Sort com fases explícitas de inspeção (INSPECT)
 * e confirmação de transferência pontual (COMMIT).
 */

/**
 * Decisões válidas do operador durante a fase de inspeção (INSPECT).
 */
export type SelectionInspectionDecision = "SELECT_NEW_MIN" | "KEEP_MIN";

/**
 * Fases da Máquina de Estados Finita (FSM) do Selection Sort:
 * - "INSPECT": o scanner percorre a partição não ordenada (j de i + 1 a n - 1),
 *   comparando A[j] com o candidato mínimo atual A[minIndex].
 * - "COMMIT": a varredura da passada foi concluída; o operador confirma a transferência
 *   pontual de A[minIndex] para a posição definitiva i (ou consolidação direta sem troca se minIndex === i).
 * - "COMPLETED": todas as passadas foram finalizadas e o vetor está integralmente ordenado.
 */
export type SelectionPhase = "INSPECT" | "COMMIT" | "COMPLETED";

/**
 * Status operacional da engine do Selection Sort.
 */
export type SelectionStatus =
  | "IDLE"
  | "RUNNING"
  | "PASS_COMPLETED"
  | "COMPLETED";

/**
 * Valores envolvidos em uma etapa de comparação do scanner.
 */
export interface SelectionComparedValues {
  readonly scannerIndex: number;
  readonly scannerValue: number;
  readonly currentMinIndex: number;
  readonly currentMinValue: number;
  readonly targetIndex: number;
  readonly targetValue: number;
}

/**
 * Registro factual imutável de uma etapa de inspeção do scanner (INSPECTION).
 */
export interface SelectionInspectionStepRecord {
  readonly type: "INSPECTION";
  readonly stepNumber: number;
  readonly i: number;
  readonly j: number;
  readonly minIndexBefore: number;
  readonly minIndexAfter: number;
  readonly comparedValues: SelectionComparedValues;
  readonly expectedDecision: SelectionInspectionDecision;
  readonly executedDecision: SelectionInspectionDecision;
  readonly isNewMinFound: boolean;
  readonly valuesSnapshot: readonly number[];
  readonly sortedIndices: readonly number[];
  readonly explanation: string;
}

/**
 * Registro factual imutável de uma etapa de consolidação / transferência da passada (COMMIT).
 */
export interface SelectionCommitStepRecord {
  readonly type: "COMMIT";
  readonly stepNumber: number;
  readonly i: number;
  readonly minIndex: number;
  readonly didSwap: boolean;
  readonly valuesBefore: readonly number[];
  readonly valuesAfter: readonly number[];
  readonly targetValueBefore: number;
  readonly minValueBefore: number;
  readonly valuesSnapshot: readonly number[];
  readonly sortedIndices: readonly number[];
  readonly explanation: string;
}

/**
 * União discriminada de todos os registros factuais de histórico do Selection Sort.
 */
export type SelectionStepRecord =
  | SelectionInspectionStepRecord
  | SelectionCommitStepRecord;

/**
 * Estado completo e imutável da Selection Sort Engine.
 */
export interface SelectionSortState {
  readonly initialValues: readonly number[];
  readonly currentValues: readonly number[];
  readonly arrayLength: number;
  readonly i: number;                 // Posição de destino da passada atual (0 <= i <= n - 2)
  readonly j: number;                 // Posição corrente do scanner (i + 1 <= j <= n - 1)
  readonly minIndex: number;          // Índice do candidato a menor elemento atual (i <= minIndex <= n - 1)
  readonly phase: SelectionPhase;     // "INSPECT" | "COMMIT" | "COMPLETED"
  readonly comparisons: number;       // Total de comparações formais realizadas
  readonly swaps: number;             // Total de trocas físicas realizadas (<= n - 1)
  readonly errors: number;            // Total de decisões incorretas do operador
  readonly sortedBoundary: number;    // Índice a partir do qual elementos estão consolidados (0..i)
  readonly history: readonly SelectionStepRecord[];
  readonly completed: boolean;
  readonly status: SelectionStatus;
}

/**
 * Metadados da próxima inspeção esperada da varredura.
 */
export interface ExpectedSelectionInspection {
  readonly i: number;
  readonly j: number;
  readonly minIndex: number;
  readonly scannerValue: number;
  readonly currentMinValue: number;
  readonly targetValue: number;
  readonly expectedDecision: SelectionInspectionDecision;
  readonly isNewMin: boolean;
  readonly explanation: string;
}

/**
 * Metadados do próximo commit esperado para fechamento da passada.
 */
export interface ExpectedSelectionCommit {
  readonly i: number;
  readonly minIndex: number;
  readonly targetValue: number;
  readonly minValue: number;
  readonly shouldSwap: boolean;
  readonly explanation: string;
}

/**
 * Resultado da validação e execução de uma decisão de inspeção do operador.
 */
export interface SelectionInspectionResult {
  readonly state: SelectionSortState;
  readonly valid: boolean;
  readonly expectedDecision: SelectionInspectionDecision;
  readonly errorReason?: string;
}

/**
 * Resultado da execução de fechamento da passada (commit).
 */
export interface SelectionCommitResult {
  readonly state: SelectionSortState;
  readonly valid: boolean;
  readonly didSwap: boolean;
  readonly errorReason?: string;
}
