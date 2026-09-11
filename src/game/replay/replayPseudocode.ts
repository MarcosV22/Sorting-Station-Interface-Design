import type { ReplayFrame } from "./replayModel";

export type PseudocodeLineId =
  | "PROCEDURE"
  | "OUTER_LOOP"
  | "INNER_LOOP"
  | "IF_CONDITION"
  | "SWAP_STATEMENT"
  | "END_IF"
  | "END_INNER"
  | "END_OUTER"
  | "END_PROCEDURE";

export interface PseudocodeLine {
  readonly id: PseudocodeLineId;
  readonly lineNumber: number;
  readonly indent: number;
  readonly text: string;
}

/**
 * Representação canônica e imutável do pseudocódigo do Bubble Sort
 * conforme a especificação pedagógica do projeto.
 */
export const BUBBLE_SORT_PSEUDOCODE: readonly PseudocodeLine[] = Object.freeze([
  Object.freeze({
    id: "PROCEDURE",
    lineNumber: 1,
    indent: 0,
    text: "procedimento bubbleSort(A)",
  }),
  Object.freeze({
    id: "OUTER_LOOP",
    lineNumber: 2,
    indent: 1,
    text: "para i de 0 até n - 2 faça",
  }),
  Object.freeze({
    id: "INNER_LOOP",
    lineNumber: 3,
    indent: 2,
    text: "para j de 0 até n - 2 - i faça",
  }),
  Object.freeze({
    id: "IF_CONDITION",
    lineNumber: 4,
    indent: 3,
    text: "se A[j] > A[j + 1] então",
  }),
  Object.freeze({
    id: "SWAP_STATEMENT",
    lineNumber: 5,
    indent: 4,
    text: "trocar A[j] e A[j + 1]",
  }),
  Object.freeze({
    id: "END_IF",
    lineNumber: 6,
    indent: 3,
    text: "fim se",
  }),
  Object.freeze({
    id: "END_INNER",
    lineNumber: 7,
    indent: 2,
    text: "fim para",
  }),
  Object.freeze({
    id: "END_OUTER",
    lineNumber: 8,
    indent: 1,
    text: "fim para",
  }),
  Object.freeze({
    id: "END_PROCEDURE",
    lineNumber: 9,
    indent: 0,
    text: "fim procedimento",
  }),
]);

export interface PseudocodeConcreteContext {
  readonly i: number | null;
  readonly j: number | null;
  readonly leftIndex: number | null;
  readonly rightIndex: number | null;
  readonly leftValue: number | null;
  readonly rightValue: number | null;
  readonly comparisonText: string | null;
  readonly conditionStatusText: string;
  readonly actionTakenText: string;
}

export interface PseudocodeHighlight {
  /** Linha com foco primário da instrução no frame atual */
  readonly primaryLineId: PseudocodeLineId;
  /** Conjunto de linhas associadas ativas no frame */
  readonly activeLineIds: readonly PseudocodeLineId[];
  /** Linha da condição avaliada (se houver) */
  readonly conditionLineId: PseudocodeLineId | null;
  /** Resultado booleano da avaliação da condição */
  readonly conditionResult: "TRUE" | "FALSE" | null;
  /** Indica se a instrução de troca foi acionada */
  readonly swapExecuted: boolean;
  /** Contexto factual com valores concretos do frame */
  readonly concreteContext: PseudocodeConcreteContext;
}

/**
 * Função pura e determinística que mapeia um ReplayFrame para a instrução
 * correspondente no pseudocódigo, sem reexecutar o algoritmo de ordenação.
 */
export function getPseudocodeHighlight(
  frame: ReplayFrame
): PseudocodeHighlight {
  if (frame.action === "INITIAL") {
    const concreteContext: PseudocodeConcreteContext = Object.freeze({
      i: null,
      j: null,
      leftIndex: null,
      rightIndex: null,
      leftValue: null,
      rightValue: null,
      comparisonText: null,
      conditionStatusText: "Nenhuma comparação realizada ainda.",
      actionTakenText: "Carga inicial na esteira. Aguardando primeira iteração.",
    });

    const activeLineIds: readonly PseudocodeLineId[] = Object.freeze([
      "PROCEDURE",
    ]);

    return Object.freeze({
      primaryLineId: "PROCEDURE",
      activeLineIds,
      conditionLineId: null,
      conditionResult: null,
      swapExecuted: false,
      concreteContext,
    });
  }

  // passNumber é 1-based no ReplayFrame, logo i = passNumber - 1
  const i = Math.max(0, frame.passNumber - 1);
  const leftIndex = frame.activeIndices ? frame.activeIndices[0] : null;
  const rightIndex = frame.activeIndices ? frame.activeIndices[1] : null;
  const j = leftIndex;
  const leftValue = frame.leftValue;
  const rightValue = frame.rightValue;
  const comparisonText =
    leftValue !== null && rightValue !== null
      ? `${leftValue} > ${rightValue}`
      : null;

  if (frame.action === "KEEP") {
    const concreteContext: PseudocodeConcreteContext = Object.freeze({
      i,
      j,
      leftIndex,
      rightIndex,
      leftValue,
      rightValue,
      comparisonText,
      conditionStatusText: `${comparisonText} → FALSO (${leftValue} ≤ ${rightValue})`,
      actionTakenText: "Condição falsa: bloco de troca ignorado, posições mantidas.",
    });

    const activeLineIds: readonly PseudocodeLineId[] = Object.freeze([
      "IF_CONDITION",
    ]);

    return Object.freeze({
      primaryLineId: "IF_CONDITION",
      activeLineIds,
      conditionLineId: "IF_CONDITION",
      conditionResult: "FALSE",
      swapExecuted: false,
      concreteContext,
    });
  }

  // frame.action === "SWAP"
  const concreteContext: PseudocodeConcreteContext = Object.freeze({
    i,
    j,
    leftIndex,
    rightIndex,
    leftValue,
    rightValue,
    comparisonText,
    conditionStatusText: `${comparisonText} → VERDADEIRO`,
    actionTakenText:
      leftIndex !== null && rightIndex !== null
        ? `trocar A[${leftIndex}] e A[${rightIndex}]`
        : "trocar A[j] e A[j + 1]",
  });

  const activeLineIds: readonly PseudocodeLineId[] = Object.freeze([
    "IF_CONDITION",
    "SWAP_STATEMENT",
  ]);

  return Object.freeze({
    primaryLineId: "SWAP_STATEMENT",
    activeLineIds,
    conditionLineId: "IF_CONDITION",
    conditionResult: "TRUE",
    swapExecuted: true,
    concreteContext,
  });
}
