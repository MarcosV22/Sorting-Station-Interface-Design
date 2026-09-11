/**
 * Tipos e contratos de domínio para a engine pedagógica de ordenação do Sorting Station.
 *
 * Módulo puro em TypeScript, desacoplado de React, DOM e UI.
 */

export type UserDecision = "SWAP" | "KEEP"

export type BubbleSortStatus = "IN_PROGRESS" | "PASS_COMPLETED" | "COMPLETED"

/**
 * Registro histórico imutável de cada micro-passo executado.
 * Permite reprodução determinística (replay), cálculo de métricas e sincronização com pseudocódigo.
 */
export interface StepRecord {
  readonly stepNumber: number
  readonly passIndex: number
  readonly comparisonIndex: number
  readonly indices: readonly [number, number]
  readonly valuesBefore: readonly number[]
  readonly valuesAfter: readonly number[]
  readonly leftValue: number
  readonly rightValue: number
  readonly swapped: boolean
  readonly explanation: string
}

/**
 * Especificação do par que deve ser avaliado no momento atual do algoritmo.
 */
export interface ExpectedComparison {
  readonly passIndex: number
  readonly comparisonIndex: number
  readonly leftIndex: number
  readonly rightIndex: number
  readonly leftValue: number
  readonly rightValue: number
  readonly shouldSwap: boolean
  readonly explanation: string
}

export type BubbleSortVariant = "CANONICAL" | "EARLY_EXIT"

export interface BubbleSortOptions {
  readonly variant?: BubbleSortVariant
}

/**
 * Estado imutável da sessão pedagógica de Bubble Sort.
 */
export interface BubbleSortState {
  /** Vetor numérico original fornecido na inicialização */
  readonly initialValues: readonly number[]
  /** Vetor numérico no estado atual da esteira */
  readonly currentValues: readonly number[]
  /** Comprimento total do vetor (n) */
  readonly arrayLength: number
  /** Índice da passada do laço externo (i: 0 até n - 2) */
  readonly passIndex: number
  /** Índice do par no laço interno da passada atual (j: 0 até n - 2 - i) */
  readonly comparisonIndex: number
  /** Total acumulado de comparações formais realizadas */
  readonly comparisons: number
  /** Total acumulado de permutas físicas realizadas */
  readonly swaps: number
  /** Permutas efetuadas na passada ativa (útil para auditoria da passada) */
  readonly swapsInCurrentPass: number
  /** Total de decisões erradas ou tentativas fora de ordem */
  readonly errors: number
  /** Estado de ciclo de vida do algoritmo */
  readonly status: BubbleSortStatus
  /** Flag booleana indicando conclusão formal de todas as passadas */
  readonly completed: boolean
  /**
   * Limite da fronteira ordenada (sortedBoundary).
   * Elementos em índices >= sortedBoundary estão definitivamente consolidados.
   * Inicialmente igual a arrayLength (nenhum fixado).
   * Ao fim da passada i, atualizado para n - 1 - i.
   */
  readonly sortedBoundary: number
  /** Histórico completo e sequencial de passos executados */
  readonly history: readonly StepRecord[]
  /** Variante do algoritmo ativa na sessão (CANONICAL por padrão ou EARLY_EXIT) */
  readonly variant: BubbleSortVariant
  /** Indica se a conclusão ocorreu por detecção de estabilização precoce (0 trocas em uma passada) */
  readonly earlyExitTriggered: boolean
  /** Passada (1-based) em que a conclusão antecipada ocorreu, se aplicável */
  readonly terminationPass?: number
}

/**
 * Resultado da validação de uma decisão do usuário sobre o par esperado.
 */
export interface UserStepResult {
  readonly valid: boolean
  readonly state: BubbleSortState
  readonly expectedDecision: UserDecision
  readonly actualDecision: UserDecision
  readonly explanation: string
  readonly stepRecord?: StepRecord
}
