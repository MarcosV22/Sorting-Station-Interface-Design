import { describe, it, expect } from "vitest";
import {
  SELECTION_TUTORIAL_INITIAL_ARRAY,
  getSelectionTutorialStepInfo,
  getSelectionInspectionFeedback,
  getSelectionCommitFeedback,
} from "./selectionTutorialGuide";
import {
  createSelectionSortState,
  executeSelectionInspection,
  commitSelectionPass,
  getSelectionSortedIndices,
  isSelectionSortComplete,
} from "./selectionSortEngine";

describe("Selection Sort Tutorial Flow & Guide ([4, 1, 3])", () => {
  it("deve inicializar com o vetor fixo [4, 1, 3] na fase INSPECT com a engine como única fonte da verdade", () => {
    const state = createSelectionSortState(SELECTION_TUTORIAL_INITIAL_ARRAY);
    expect(state.currentValues).toEqual([4, 1, 3]);
    expect(state.i).toBe(0);
    expect(state.minIndex).toBe(0);
    expect(state.j).toBe(1);
    expect(state.phase).toBe("INSPECT");
    expect(state.completed).toBe(false);

    const step = getSelectionTutorialStepInfo(state);
    expect(step.phase).toBe("INSPECT");
    expect(step.passNumber).toBe(1);
    expect(step.targetIndex).toBe(0);
    expect(step.minIndex).toBe(0);
    expect(step.scanIndex).toBe(1);
    expect(step.hint).toContain("1 < 4");
    expect(step.hint).toContain("NOVO MÍNIMO");
  });

  it("deve rejeitar decisão errada (MANTER quando era NOVO MÍNIMO) sem avançar a engine", () => {
    const state = createSelectionSortState(SELECTION_TUTORIAL_INITIAL_ARRAY);
    // j=1 (val 1) vs minIndex=0 (val 4). Decisão esperada: SELECT_NEW_MIN.
    // Usuário tenta KEEP_MIN:
    const invalidResult = executeSelectionInspection(state, "KEEP_MIN");
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errorReason).toBeDefined();
    expect(invalidResult.errorReason).toContain("MENOR");
    expect(invalidResult.state.errors).toBe(1);

    const feedback = getSelectionInspectionFeedback(invalidResult, state, "KEEP_MIN");
    expect(feedback).toContain("MENOR");

    // Invariantes estritas de erro:
    expect(invalidResult.state.j).toBe(1); // Não avança scanner
    expect(invalidResult.state.minIndex).toBe(0); // Não altera minIndex
    expect(invalidResult.state.currentValues).toEqual([4, 1, 3]); // Não altera valores
    expect(invalidResult.state.history.length).toBe(0); // Não polui histórico
  });

  it("deve processar a sequência pedagógica canônica completa passo a passo até [1, 3, 4]", () => {
    let state = createSelectionSortState(SELECTION_TUTORIAL_INITIAL_ARRAY);

    // ==========================================
    // PASSADA 1: i = 0, minIndex = 0 (valor 4)
    // ==========================================

    // Passo 1.1: j = 1 (valor 1). 1 < 4 -> NOVO MÍNIMO
    let stepInfo = getSelectionTutorialStepInfo(state);
    expect(stepInfo.phase).toBe("INSPECT");
    expect(stepInfo.scanIndex).toBe(1);
    expect(stepInfo.targetIndex).toBe(0);
    expect(stepInfo.minIndex).toBe(0);

    const before1 = state;
    let result = executeSelectionInspection(state, "SELECT_NEW_MIN");
    expect(result.valid).toBe(true);
    const feedback1 = getSelectionInspectionFeedback(result, before1, "SELECT_NEW_MIN");
    expect(feedback1).toContain("Novo candidato mínimo");
    state = result.state;
    expect(state.minIndex).toBe(1); // Novo mínimo é índice 1
    expect(state.j).toBe(2); // Scanner avança para índice 2
    expect(state.phase).toBe("INSPECT");

    // Passo 1.2: j = 2 (valor 3). 3 < 1 é falso -> MANTER CANDIDATO
    stepInfo = getSelectionTutorialStepInfo(state);
    expect(stepInfo.phase).toBe("INSPECT");
    expect(stepInfo.scanIndex).toBe(2);
    expect(stepInfo.minIndex).toBe(1); // Candidato continua sendo 1
    expect(stepInfo.hint).toContain("3 < 1");
    expect(stepInfo.hint).toContain("MANTER CANDIDATO");

    // Teste de erro: tentar NOVO MÍNIMO quando 3 < 1 é falso
    const wrongNewMin = executeSelectionInspection(state, "SELECT_NEW_MIN");
    expect(wrongNewMin.valid).toBe(false);
    expect(wrongNewMin.state.errors).toBe(1);
    expect(wrongNewMin.state.j).toBe(2);

    // Decisão correta: MANTER
    const before2 = state;
    result = executeSelectionInspection(state, "KEEP_MIN");
    expect(result.valid).toBe(true);
    const feedback2 = getSelectionInspectionFeedback(result, before2, "KEEP_MIN");
    expect(feedback2).toContain("preservado");
    state = result.state;
    expect(state.minIndex).toBe(1); // Mantém índice 1
    // Como j era n-1 (2), a varredura encerra e transiciona para COMMIT
    expect(state.phase).toBe("COMMIT");

    // Passo 1.3: COMMIT da Passada 1
    stepInfo = getSelectionTutorialStepInfo(state);
    expect(stepInfo.phase).toBe("COMMIT");
    expect(stepInfo.canSwapOnCommit).toBe(true);
    expect(stepInfo.targetIndex).toBe(0);
    expect(stepInfo.minIndex).toBe(1);

    // Commit da passada: permuta A[0] e A[1] -> [1, 4, 3]
    const beforeCommit1 = state;
    const commit1 = commitSelectionPass(state);
    expect(commit1.valid).toBe(true);
    expect(commit1.didSwap).toBe(true);
    const commitFeedback1 = getSelectionCommitFeedback(commit1, beforeCommit1);
    expect(commitFeedback1).toContain("Transferência concluída");
    state = commit1.state;
    expect(state.currentValues).toEqual([1, 4, 3]);
    expect(state.swaps).toBe(1);
    expect(getSelectionSortedIndices(state)).toEqual([0]); // Índice 0 consolidado

    // ==========================================
    // PASSADA 2: i = 1, minIndex = 1 (valor 4)
    // ==========================================
    expect(state.phase).toBe("INSPECT");
    expect(state.i).toBe(1);
    expect(state.minIndex).toBe(1);
    expect(state.j).toBe(2); // Scanner no índice 2

    stepInfo = getSelectionTutorialStepInfo(state);
    expect(stepInfo.phase).toBe("INSPECT");
    expect(stepInfo.passNumber).toBe(2);
    expect(stepInfo.targetIndex).toBe(1);
    expect(stepInfo.minIndex).toBe(1);
    expect(stepInfo.scanIndex).toBe(2);
    // 3 < 4 -> NOVO MÍNIMO
    expect(stepInfo.hint).toContain("3 < 4");
    expect(stepInfo.hint).toContain("NOVO MÍNIMO");

    // Passo 2.1: j = 2 (valor 3). 3 < 4 -> NOVO MÍNIMO
    result = executeSelectionInspection(state, "SELECT_NEW_MIN");
    expect(result.valid).toBe(true);
    state = result.state;
    expect(state.minIndex).toBe(2); // Novo mínimo é índice 2
    // Como j era n-1 (2), transiciona para COMMIT
    expect(state.phase).toBe("COMMIT");

    // Passo 2.2: COMMIT da Passada 2
    stepInfo = getSelectionTutorialStepInfo(state);
    expect(stepInfo.phase).toBe("COMMIT");
    expect(stepInfo.canSwapOnCommit).toBe(true);
    expect(stepInfo.targetIndex).toBe(1);
    expect(stepInfo.minIndex).toBe(2);

    // Commit da passada: permuta A[1] e A[2] -> [1, 3, 4]
    const beforeCommit2 = state;
    const commit2 = commitSelectionPass(state);
    expect(commit2.valid).toBe(true);
    expect(commit2.didSwap).toBe(true);
    const commitFeedback2 = getSelectionCommitFeedback(commit2, beforeCommit2);
    expect(commitFeedback2).toContain("Transferência concluída");
    state = commit2.state;

    // ==========================================
    // CONCLUSÃO DO TUTORIAL
    // ==========================================
    expect(state.currentValues).toEqual([1, 3, 4]);
    expect(state.completed).toBe(true);
    expect(isSelectionSortComplete(state)).toBe(true);
    expect(state.phase).toBe("COMPLETED");
    expect(state.comparisons).toBe(3);
    expect(state.swaps).toBe(2);
    expect(getSelectionSortedIndices(state)).toEqual([0, 1, 2]);

    stepInfo = getSelectionTutorialStepInfo(state);
    expect(stepInfo.phase).toBe("COMPLETED");
    expect(stepInfo.instruction).toContain("[1, 3, 4]");
  });
});
