import { describe, it, expect } from "vitest";
import {
  BUBBLE_SORT_PSEUDOCODE,
  getPseudocodeHighlight,
} from "./replayPseudocode";
import { buildReplayFrames } from "./replayModel";
import type { ReplayFrame } from "./replayModel";
import type { StepRecord } from "../sorting/types";

describe("Bubble Sort Pseudocode Canonical Model", () => {
  it("deve exportar a lista canônica de 9 instruções do Bubble Sort", () => {
    expect(BUBBLE_SORT_PSEUDOCODE).toHaveLength(9);
    expect(Object.isFrozen(BUBBLE_SORT_PSEUDOCODE)).toBe(true);

    const ids = BUBBLE_SORT_PSEUDOCODE.map((l) => l.id);
    expect(ids).toEqual([
      "PROCEDURE",
      "OUTER_LOOP",
      "INNER_LOOP",
      "IF_CONDITION",
      "SWAP_STATEMENT",
      "END_IF",
      "END_INNER",
      "END_OUTER",
      "END_PROCEDURE",
    ]);

    BUBBLE_SORT_PSEUDOCODE.forEach((line, index) => {
      expect(line.lineNumber).toBe(index + 1);
      expect(typeof line.text).toBe("string");
      expect(line.text.length).toBeGreaterThan(0);
      expect(line.indent).toBeGreaterThanOrEqual(0);
      expect(Object.isFrozen(line)).toBe(true);
    });
  });
});

describe("getPseudocodeHighlight (Camada Pura de Sincronização)", () => {
  const mockInitialFrame: ReplayFrame = Object.freeze({
    stepNumber: 0,
    totalSteps: 6,
    passNumber: 0,
    totalPasses: 3,
    comparisonNumber: 0,
    totalComparisonsInPass: 3,
    values: Object.freeze([5, 2, 4, 1]),
    activeIndices: null,
    leftValue: null,
    rightValue: null,
    action: "INITIAL",
    actionLabel: "ESTADO INICIAL",
    explanation: "Carga inicial",
    sortedIndices: Object.freeze([]),
  });

  const mockSwapFrame: ReplayFrame = Object.freeze({
    stepNumber: 1,
    totalSteps: 6,
    passNumber: 1,
    totalPasses: 3,
    comparisonNumber: 1,
    totalComparisonsInPass: 3,
    values: Object.freeze([2, 5, 4, 1]),
    activeIndices: Object.freeze([0, 1]) as readonly [number, number],
    leftValue: 5,
    rightValue: 2,
    action: "SWAP",
    actionLabel: "TROCA REALIZADA",
    explanation: "5 > 2: troca realizada",
    sortedIndices: Object.freeze([]),
  });

  const mockKeepFrame: ReplayFrame = Object.freeze({
    stepNumber: 4,
    totalSteps: 6,
    passNumber: 2,
    totalPasses: 3,
    comparisonNumber: 1,
    totalComparisonsInPass: 2,
    values: Object.freeze([2, 4, 1, 5]),
    activeIndices: Object.freeze([0, 1]) as readonly [number, number],
    leftValue: 2,
    rightValue: 4,
    action: "KEEP",
    actionLabel: "ORDEM MANTIDA",
    explanation: "2 ≤ 4: ordem mantida",
    sortedIndices: Object.freeze([3]),
  });

  it("deve mapear o frame INITIAL para a linha de procedimento com status neutro", () => {
    const highlight = getPseudocodeHighlight(mockInitialFrame);

    expect(highlight.primaryLineId).toBe("PROCEDURE");
    expect(highlight.activeLineIds).toEqual(["PROCEDURE"]);
    expect(highlight.conditionLineId).toBeNull();
    expect(highlight.conditionResult).toBeNull();
    expect(highlight.swapExecuted).toBe(false);
    expect(highlight.concreteContext.i).toBeNull();
    expect(highlight.concreteContext.j).toBeNull();
    expect(highlight.concreteContext.leftValue).toBeNull();
    expect(highlight.concreteContext.rightValue).toBeNull();
    expect(highlight.concreteContext.comparisonText).toBeNull();
  });

  it("deve mapear o frame KEEP com condição FALSO e sem execução de troca", () => {
    const highlight = getPseudocodeHighlight(mockKeepFrame);

    expect(highlight.primaryLineId).toBe("IF_CONDITION");
    expect(highlight.activeLineIds).toEqual(["IF_CONDITION"]);
    expect(highlight.conditionLineId).toBe("IF_CONDITION");
    expect(highlight.conditionResult).toBe("FALSE");
    expect(highlight.swapExecuted).toBe(false);

    expect(highlight.concreteContext.i).toBe(1); // passNumber 2 - 1 = 1
    expect(highlight.concreteContext.j).toBe(0);
    expect(highlight.concreteContext.leftIndex).toBe(0);
    expect(highlight.concreteContext.rightIndex).toBe(1);
    expect(highlight.concreteContext.leftValue).toBe(2);
    expect(highlight.concreteContext.rightValue).toBe(4);
    expect(highlight.concreteContext.comparisonText).toBe("2 > 4");
    expect(highlight.concreteContext.conditionStatusText).toContain("FALSO");
  });

  it("deve mapear o frame SWAP com condição VERDADEIRO e destaque na instrução de troca", () => {
    const highlight = getPseudocodeHighlight(mockSwapFrame);

    expect(highlight.primaryLineId).toBe("SWAP_STATEMENT");
    expect(highlight.activeLineIds).toEqual(["IF_CONDITION", "SWAP_STATEMENT"]);
    expect(highlight.conditionLineId).toBe("IF_CONDITION");
    expect(highlight.conditionResult).toBe("TRUE");
    expect(highlight.swapExecuted).toBe(true);

    expect(highlight.concreteContext.i).toBe(0); // passNumber 1 - 1 = 0
    expect(highlight.concreteContext.j).toBe(0);
    expect(highlight.concreteContext.leftIndex).toBe(0);
    expect(highlight.concreteContext.rightIndex).toBe(1);
    expect(highlight.concreteContext.leftValue).toBe(5);
    expect(highlight.concreteContext.rightValue).toBe(2);
    expect(highlight.concreteContext.comparisonText).toBe("5 > 2");
    expect(highlight.concreteContext.conditionStatusText).toContain("VERDADEIRO");
    expect(highlight.concreteContext.actionTakenText).toBe("trocar A[0] e A[1]");
  });

  it("deve formatar a comparação de forma correta e consistente", () => {
    const swapHighlight = getPseudocodeHighlight(mockSwapFrame);
    expect(swapHighlight.concreteContext.comparisonText).toBe("5 > 2");

    const keepHighlight = getPseudocodeHighlight(mockKeepFrame);
    expect(keepHighlight.concreteContext.comparisonText).toBe("2 > 4");
  });

  it("deve identificar com rigor a linha de troca (swapExecuted estrito)", () => {
    expect(getPseudocodeHighlight(mockInitialFrame).swapExecuted).toBe(false);
    expect(getPseudocodeHighlight(mockKeepFrame).swapExecuted).toBe(false);
    expect(getPseudocodeHighlight(mockSwapFrame).swapExecuted).toBe(true);
  });

  it("deve ser puramente determinístico (mesma entrada gera mesma saída)", () => {
    const res1 = getPseudocodeHighlight(mockSwapFrame);
    const res2 = getPseudocodeHighlight(mockSwapFrame);

    expect(res1).toEqual(res2);
    expect(res1.primaryLineId).toBe(res2.primaryLineId);
    expect(res1.concreteContext).toEqual(res2.concreteContext);
  });

  it("deve preservar a imutabilidade dos dados e retornar objetos congelados", () => {
    const highlight = getPseudocodeHighlight(mockSwapFrame);

    expect(Object.isFrozen(highlight)).toBe(true);
    expect(Object.isFrozen(highlight.activeLineIds)).toBe(true);
    expect(Object.isFrozen(highlight.concreteContext)).toBe(true);
    expect(Object.isFrozen(mockSwapFrame)).toBe(true);
    expect(Object.isFrozen(mockSwapFrame.values)).toBe(true);
  });

  it("deve sincronizar perfeitamente ao longo de um cenário real de ordenação [5, 2, 4, 1]", () => {
    const initial = [5, 2, 4, 1];
    const history: StepRecord[] = [
      {
        stepNumber: 1,
        passIndex: 0,
        comparisonIndex: 0,
        indices: [0, 1],
        leftValue: 5,
        rightValue: 2,
        valuesBefore: [5, 2, 4, 1],
        valuesAfter: [2, 5, 4, 1],
        swapped: true,
        explanation: "5 > 2: troca",
      },
      {
        stepNumber: 2,
        passIndex: 0,
        comparisonIndex: 1,
        indices: [1, 2],
        leftValue: 5,
        rightValue: 4,
        valuesBefore: [2, 5, 4, 1],
        valuesAfter: [2, 4, 5, 1],
        swapped: true,
        explanation: "5 > 4: troca",
      },
      {
        stepNumber: 3,
        passIndex: 0,
        comparisonIndex: 2,
        indices: [2, 3],
        leftValue: 5,
        rightValue: 1,
        valuesBefore: [2, 4, 5, 1],
        valuesAfter: [2, 4, 1, 5],
        swapped: true,
        explanation: "5 > 1: troca",
      },
      {
        stepNumber: 4,
        passIndex: 1,
        comparisonIndex: 0,
        indices: [0, 1],
        leftValue: 2,
        rightValue: 4,
        valuesBefore: [2, 4, 1, 5],
        valuesAfter: [2, 4, 1, 5],
        swapped: false,
        explanation: "2 <= 4: mantido",
      },
      {
        stepNumber: 5,
        passIndex: 1,
        comparisonIndex: 1,
        indices: [1, 2],
        leftValue: 4,
        rightValue: 1,
        valuesBefore: [2, 4, 1, 5],
        valuesAfter: [2, 1, 4, 5],
        swapped: true,
        explanation: "4 > 1: troca",
      },
      {
        stepNumber: 6,
        passIndex: 2,
        comparisonIndex: 0,
        indices: [0, 1],
        leftValue: 2,
        rightValue: 1,
        valuesBefore: [2, 1, 4, 5],
        valuesAfter: [1, 2, 4, 5],
        swapped: true,
        explanation: "2 > 1: troca",
      },
    ];

    const frames = buildReplayFrames(initial, history);
    expect(frames).toHaveLength(7);

    // Passo 0 (INITIAL)
    const h0 = getPseudocodeHighlight(frames[0]);
    expect(h0.primaryLineId).toBe("PROCEDURE");
    expect(h0.conditionResult).toBeNull();
    expect(h0.swapExecuted).toBe(false);

    // Passo 1 (5 > 2 -> SWAP)
    const h1 = getPseudocodeHighlight(frames[1]);
    expect(h1.primaryLineId).toBe("SWAP_STATEMENT");
    expect(h1.conditionResult).toBe("TRUE");
    expect(h1.swapExecuted).toBe(true);
    expect(h1.concreteContext.comparisonText).toBe("5 > 2");

    // Passo 4 (2 <= 4 -> KEEP)
    const h4 = getPseudocodeHighlight(frames[4]);
    expect(h4.primaryLineId).toBe("IF_CONDITION");
    expect(h4.conditionResult).toBe("FALSE");
    expect(h4.swapExecuted).toBe(false);
    expect(h4.concreteContext.comparisonText).toBe("2 > 4");

    // Passo 6 (2 > 1 -> SWAP final)
    const h6 = getPseudocodeHighlight(frames[6]);
    expect(h6.primaryLineId).toBe("SWAP_STATEMENT");
    expect(h6.conditionResult).toBe("TRUE");
    expect(h6.swapExecuted).toBe(true);
    expect(h6.concreteContext.comparisonText).toBe("2 > 1");
  });
});
