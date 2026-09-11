import { describe, it, expect } from "vitest";
import { buildReplayFrames, getReplayFrame } from "./replayModel";
import {
  createBubbleSortState,
  executeBubbleSortStep,
} from "../sorting/bubbleSortEngine";

describe("Replay Model — Camada Pura de Replay", () => {
  it("trata history vazio gerando apenas o frame inicial (Frame 0)", () => {
    const initialArray = [42];
    const frames = buildReplayFrames(initialArray, []);

    expect(frames).toHaveLength(1);
    const frame0 = frames[0];
    expect(frame0.stepNumber).toBe(0);
    expect(frame0.totalSteps).toBe(0);
    expect(frame0.action).toBe("INITIAL");
    expect(frame0.actionLabel).toBe("ESTADO INICIAL");
    expect(frame0.values).toEqual([42]);
    expect(frame0.activeIndices).toBeNull();
    expect(frame0.leftValue).toBeNull();
    expect(frame0.rightValue).toBeNull();
    // Vetor unitário é trivialmente ordenado
    expect(frame0.sortedIndices).toEqual([0]);
  });

  it("produz a quantidade correta de frames para o cenário [5, 2, 4, 1]", () => {
    let state = createBubbleSortState([5, 2, 4, 1]);
    while (!state.completed) {
      state = executeBubbleSortStep(state);
    }

    expect(state.history).toHaveLength(6);

    const frames = buildReplayFrames(state.initialValues, state.history);

    // Frame 0 (inicial) + 6 passos do Bubble Sort = 7 frames
    expect(frames).toHaveLength(7);
  });

  it("valida o primeiro frame (Frame 0) com o estado inicial exato e sem par ativo", () => {
    let state = createBubbleSortState([5, 2, 4, 1]);
    while (!state.completed) {
      state = executeBubbleSortStep(state);
    }

    const frames = buildReplayFrames(state.initialValues, state.history);
    const firstFrame = frames[0];

    expect(firstFrame.stepNumber).toBe(0);
    expect(firstFrame.totalSteps).toBe(6);
    expect(firstFrame.passNumber).toBe(0);
    expect(firstFrame.comparisonNumber).toBe(0);
    expect(firstFrame.action).toBe("INITIAL");
    expect(firstFrame.actionLabel).toBe("ESTADO INICIAL");
    expect(firstFrame.values).toEqual([5, 2, 4, 1]);
    expect(firstFrame.activeIndices).toBeNull();
    expect(firstFrame.leftValue).toBeNull();
    expect(firstFrame.rightValue).toBeNull();
    expect(firstFrame.sortedIndices).toEqual([]);
    expect(firstFrame.explanation).toContain("Configuração inicial");
  });

  it("valida o último frame com o vetor final perfeitamente ordenado e elementos consolidados", () => {
    let state = createBubbleSortState([5, 2, 4, 1]);
    while (!state.completed) {
      state = executeBubbleSortStep(state);
    }

    const frames = buildReplayFrames(state.initialValues, state.history);
    const lastFrame = frames[frames.length - 1];

    expect(lastFrame.stepNumber).toBe(6);
    expect(lastFrame.totalSteps).toBe(6);
    expect(lastFrame.values).toEqual([1, 2, 4, 5]);
    expect(lastFrame.activeIndices).toEqual([0, 1]);
    expect(lastFrame.sortedIndices).toEqual([0, 1, 2, 3]);
  });

  it("identifica corretamente um frame com ação SWAP", () => {
    let state = createBubbleSortState([5, 2, 4, 1]);
    while (!state.completed) {
      state = executeBubbleSortStep(state);
    }

    const frames = buildReplayFrames(state.initialValues, state.history);
    // Passo 1 compara 5 e 2: deve trocar
    const step1 = frames[1];

    expect(step1.stepNumber).toBe(1);
    expect(step1.action).toBe("SWAP");
    expect(step1.actionLabel).toBe("TROCA REALIZADA");
    expect(step1.activeIndices).toEqual([0, 1]);
    expect(step1.leftValue).toBe(5);
    expect(step1.rightValue).toBe(2);
    expect(step1.values).toEqual([2, 5, 4, 1]);
    expect(step1.explanation).toContain("5 > 2");
    expect(step1.explanation).toContain("troca realizada");
  });

  it("identifica corretamente um frame com ação KEEP", () => {
    let state = createBubbleSortState([5, 2, 4, 1]);
    while (!state.completed) {
      state = executeBubbleSortStep(state);
    }

    const frames = buildReplayFrames(state.initialValues, state.history);
    // No vetor [2, 4, 1, 5] na Passada 1 (i=1, j=0), compara 2 e 4: deve MANTER (Passo 4)
    const step4 = frames[4];

    expect(step4.stepNumber).toBe(4);
    expect(step4.action).toBe("KEEP");
    expect(step4.actionLabel).toBe("ORDEM MANTIDA");
    expect(step4.activeIndices).toEqual([0, 1]);
    expect(step4.leftValue).toBe(2);
    expect(step4.rightValue).toBe(4);
    expect(step4.values).toEqual([2, 4, 1, 5]);
    expect(step4.explanation).toContain("2 ≤ 4");
    expect(step4.explanation).toContain("ordem correta mantida");
  });

  it("assegura a ordenação estritamente sequencial dos passos", () => {
    let state = createBubbleSortState([5, 2, 4, 1]);
    while (!state.completed) {
      state = executeBubbleSortStep(state);
    }

    const frames = buildReplayFrames(state.initialValues, state.history);
    const stepNumbers = frames.map((f) => f.stepNumber);

    expect(stepNumbers).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("garante a imutabilidade estrita dos quadros e coleções geradas", () => {
    let state = createBubbleSortState([5, 2, 4, 1]);
    while (!state.completed) {
      state = executeBubbleSortStep(state);
    }

    const frames = buildReplayFrames(state.initialValues, state.history);

    expect(Object.isFrozen(frames)).toBe(true);
    for (const frame of frames) {
      expect(Object.isFrozen(frame)).toBe(true);
      expect(Object.isFrozen(frame.values)).toBe(true);
      expect(Object.isFrozen(frame.sortedIndices)).toBe(true);
      if (frame.activeIndices) {
        expect(Object.isFrozen(frame.activeIndices)).toBe(true);
      }
    }

    // Tentativas de mutação em runtime devem falhar ou ser ignoradas
    expect(() => {
      // @ts-expect-error teste de mutação runtime
      frames[0] = null;
    }).toThrow();
  });

  it("getReplayFrame recupera quadros com clamping seguro nos limites", () => {
    const frames = buildReplayFrames([5, 2], [
      {
        stepNumber: 1,
        passIndex: 0,
        comparisonIndex: 0,
        indices: [0, 1],
        valuesBefore: [5, 2],
        valuesAfter: [2, 5],
        leftValue: 5,
        rightValue: 2,
        swapped: true,
        explanation: "5 > 2",
      },
    ]);

    expect(getReplayFrame(frames, -5).stepNumber).toBe(0);
    expect(getReplayFrame(frames, 0).stepNumber).toBe(0);
    expect(getReplayFrame(frames, 1).stepNumber).toBe(1);
    expect(getReplayFrame(frames, 999).stepNumber).toBe(1);
  });
});
