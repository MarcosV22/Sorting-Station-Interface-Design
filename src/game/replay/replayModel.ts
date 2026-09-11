import type { BubbleSortVariant, StepRecord } from "../sorting/types";

export type ReplayAction = "INITIAL" | "SWAP" | "KEEP";

export interface ReplayFrameOptions {
  readonly variant?: BubbleSortVariant;
  readonly earlyExitTriggered?: boolean;
}

/**
 * Representação imutável de um quadro individual da reprodução (replay)
 * da execução de uma fase.
 */
export interface ReplayFrame {
  /** Número sequencial do quadro (0 para estado inicial, 1..N para passos) */
  readonly stepNumber: number;
  /** Total de micro-passos algorítmicos executados (tamanho do history) */
  readonly totalSteps: number;
  /** Número da passada 1-based (ou 0 para estado inicial) */
  readonly passNumber: number;
  /** Total teórico de passadas da fase (n - 1) */
  readonly totalPasses: number;
  /** Número da comparação 1-based na passada atual (ou 0 para estado inicial) */
  readonly comparisonNumber: number;
  /** Total de comparações previstas na passada atual */
  readonly totalComparisonsInPass: number;
  /** Estado do vetor numérico neste quadro */
  readonly values: readonly number[];
  /** Índices do par sob escrutínio, ou null no estado inicial */
  readonly activeIndices: readonly [number, number] | null;
  /** Valor à esquerda do par comparado, ou null no estado inicial */
  readonly leftValue: number | null;
  /** Valor à direita do par comparado, ou null no estado inicial */
  readonly rightValue: number | null;
  /** Categoria da ação: INITIAL, SWAP ou KEEP */
  readonly action: ReplayAction;
  /** Rótulo textual da ação para exibição */
  readonly actionLabel: string;
  /** Explicação factual e concisa do evento */
  readonly explanation: string;
  /** Índices dos elementos já definitivamente consolidados neste quadro */
  readonly sortedIndices: readonly number[];
  /** Variante algorítmica da execução reproduzida */
  readonly variant?: BubbleSortVariant;
  /** Indica se esta execução foi encerrada precocemente por Early Exit */
  readonly earlyExitTriggered?: boolean;
}

/**
 * Deriva deterministicamente a lista ordenada de quadros de replay
 * a partir do vetor inicial e do histórico real de StepRecord produzido pela engine.
 *
 * Não executa o algoritmo novamente: consome estritamente o histórico gravado.
 */
export function buildReplayFrames(
  initialArray: readonly number[],
  history: readonly StepRecord[],
  options?: ReplayFrameOptions
): readonly ReplayFrame[] {
  const n = initialArray.length;
  const totalSteps = history.length;
  const totalPasses = Math.max(1, n - 1);

  // Quadro 0: Estado Inicial antes de qualquer comparação
  const initialSorted: number[] =
    n <= 1 ? Array.from({ length: n }, (_, i) => i) : [];

  const initialFrame: ReplayFrame = Object.freeze({
    stepNumber: 0,
    totalSteps,
    passNumber: 0,
    totalPasses,
    comparisonNumber: 0,
    totalComparisonsInPass: Math.max(1, n - 1),
    values: Object.freeze([...initialArray]),
    activeIndices: null,
    leftValue: null,
    rightValue: null,
    action: "INITIAL",
    actionLabel: "ESTADO INICIAL",
    explanation:
      "Configuração inicial da carga na esteira antes do primeiro micro-passo.",
    sortedIndices: Object.freeze(initialSorted),
    variant: options?.variant ?? "CANONICAL",
    earlyExitTriggered: false,
  });

  const frames: ReplayFrame[] = [initialFrame];

  // Quadros 1..N derivados dos StepRecords registrados
  for (let k = 0; k < totalSteps; k++) {
    const record = history[k];
    const isLastStep = k === totalSteps - 1;
    const isEarlyExit = Boolean(options?.earlyExitTriggered && isLastStep);
    const stepNumber = k + 1;
    const passNumber = record.passIndex + 1;
    const comparisonNumber = record.comparisonIndex + 1;
    const totalComparisonsInPass = Math.max(1, n - 1 - record.passIndex);

    // Cálculo exato dos elementos consolidados ao término ou durante a passada
    let boundary = n - record.passIndex;
    const isEndOfPass = record.comparisonIndex >= n - 2 - record.passIndex;
    if (isEndOfPass) {
      boundary = n - 1 - record.passIndex;
      if (record.passIndex >= n - 2 || isEarlyExit) {
        boundary = 0;
      }
    } else if (isEarlyExit) {
      boundary = 0;
    }

    const currentSorted: number[] = [];
    for (let idx = boundary; idx < n; idx++) {
      currentSorted.push(idx);
    }

    const action: ReplayAction = record.swapped ? "SWAP" : "KEEP";
    const actionLabel = record.swapped ? "TROCA REALIZADA" : "ORDEM MANTIDA";
    let explanation = record.swapped
      ? `${record.leftValue} > ${record.rightValue}: troca realizada entre as caixas #${record.indices[0] + 1} e #${record.indices[1] + 1}.`
      : `${record.leftValue} ≤ ${record.rightValue}: ordem correta mantida entre as caixas #${record.indices[0] + 1} e #${record.indices[1] + 1}.`;

    if (isEarlyExit) {
      explanation += " Passada concluída sem trocas. O protocolo detectou que a esteira já está ordenada e encerrou a execução antecipadamente.";
    }

    const frame: ReplayFrame = Object.freeze({
      stepNumber,
      totalSteps,
      passNumber,
      totalPasses,
      comparisonNumber,
      totalComparisonsInPass,
      values: Object.freeze([...record.valuesAfter]),
      activeIndices: Object.freeze([record.indices[0], record.indices[1]]) as readonly [number, number],
      leftValue: record.leftValue,
      rightValue: record.rightValue,
      action,
      actionLabel,
      explanation,
      sortedIndices: Object.freeze(currentSorted),
      variant: options?.variant ?? "CANONICAL",
      earlyExitTriggered: isEarlyExit,
    });

    frames.push(frame);
  }

  return Object.freeze(frames);
}

/**
 * Retorna o quadro no índice solicitado de forma segura, limitando aos limites válidos.
 */
export function getReplayFrame(
  frames: readonly ReplayFrame[],
  index: number
): ReplayFrame {
  if (frames.length === 0) {
    throw new Error("A lista de quadros de replay não pode ser vazia.");
  }
  const clampedIndex = Math.max(0, Math.min(frames.length - 1, index));
  return frames[clampedIndex];
}
