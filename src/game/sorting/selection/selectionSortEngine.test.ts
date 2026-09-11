import { describe, expect, it } from "vitest";
import {
  calculateSelectionSortProgress,
  calculateTotalExpectedSelectionComparisons,
  commitSelectionPass,
  createSelectionSortState,
  executeSelectionInspection,
  executeSelectionStep,
  getExpectedSelectionCommit,
  getExpectedSelectionInspection,
  getSelectionSortedIndices,
  isSelectionSortComplete,
} from "./selectionSortEngine";

describe("SelectionSortEngine", () => {
  describe("Cálculos Analíticos e Métricas", () => {
    it("deve calcular corretamente o número formal teórico de comparações n*(n-1)/2", () => {
      expect(calculateTotalExpectedSelectionComparisons(0)).toBe(0);
      expect(calculateTotalExpectedSelectionComparisons(1)).toBe(0);
      expect(calculateTotalExpectedSelectionComparisons(2)).toBe(1);
      expect(calculateTotalExpectedSelectionComparisons(3)).toBe(3);
      expect(calculateTotalExpectedSelectionComparisons(4)).toBe(6);
      expect(calculateTotalExpectedSelectionComparisons(5)).toBe(10);
      expect(calculateTotalExpectedSelectionComparisons(6)).toBe(15);
    });

    it("deve calcular o progresso da sessão corretamente", () => {
      const stateEmpty = createSelectionSortState([]);
      expect(calculateSelectionSortProgress(stateEmpty)).toBe(100);

      const stateSingle = createSelectionSortState([42]);
      expect(calculateSelectionSortProgress(stateSingle)).toBe(100);

      const state3 = createSelectionSortState([4, 1, 3]);
      expect(calculateSelectionSortProgress(state3)).toBe(0);

      // Após 1 comparação (de 3 totais): 1/3 = 33%
      const step1 = executeSelectionStep(state3);
      expect(calculateSelectionSortProgress(step1)).toBe(33);

      // Após 2 comparações (de 3 totais): 2/3 = 67%
      const step2 = executeSelectionStep(step1);
      expect(calculateSelectionSortProgress(step2)).toBe(67);

      // No commit, comparações continuam 2: 67%
      const step3 = executeSelectionStep(step2);
      expect(calculateSelectionSortProgress(step3)).toBe(67);

      // Após 3 comparações: 3/3 = 100%
      const step4 = executeSelectionStep(step3);
      expect(calculateSelectionSortProgress(step4)).toBe(100);

      const step5 = executeSelectionStep(step4);
      expect(calculateSelectionSortProgress(step5)).toBe(100);
      expect(step5.completed).toBe(true);
    });
  });

  describe("Casos de Borda Iniciais", () => {
    it("deve tratar vetor vazio como concluído de forma segura", () => {
      const state = createSelectionSortState([]);
      expect(state.arrayLength).toBe(0);
      expect(state.completed).toBe(true);
      expect(state.phase).toBe("COMPLETED");
      expect(state.status).toBe("COMPLETED");
      expect(state.sortedBoundary).toBe(0);
      expect(getSelectionSortedIndices(state)).toEqual([]);
      expect(isSelectionSortComplete(state)).toBe(true);
      expect(state.history).toEqual([]);
      expect(getExpectedSelectionInspection(state)).toBeNull();
      expect(getExpectedSelectionCommit(state)).toBeNull();
    });

    it("deve tratar vetor unitário como concluído de forma segura", () => {
      const state = createSelectionSortState([42]);
      expect(state.arrayLength).toBe(1);
      expect(state.completed).toBe(true);
      expect(state.phase).toBe("COMPLETED");
      expect(state.status).toBe("COMPLETED");
      expect(state.sortedBoundary).toBe(1);
      expect(getSelectionSortedIndices(state)).toEqual([0]);
      expect(isSelectionSortComplete(state)).toBe(true);
      expect(state.history).toEqual([]);
      expect(getExpectedSelectionInspection(state)).toBeNull();
      expect(getExpectedSelectionCommit(state)).toBeNull();
    });

    it("deve inicializar vetor de 2 elementos na fase INSPECT com valores corretos", () => {
      const state = createSelectionSortState([5, 2]);
      expect(state.arrayLength).toBe(2);
      expect(state.completed).toBe(false);
      expect(state.i).toBe(0);
      expect(state.j).toBe(1);
      expect(state.minIndex).toBe(0);
      expect(state.phase).toBe("INSPECT");
      expect(state.status).toBe("IDLE");
      expect(state.comparisons).toBe(0);
      expect(state.swaps).toBe(0);
      expect(state.errors).toBe(0);
      expect(state.sortedBoundary).toBe(0);
      expect(getSelectionSortedIndices(state)).toEqual([]);
    });
  });

  describe("Exemplo Canônico [4, 1, 3]", () => {
    it("deve executar rigorosamente o roteiro canônico completo com 3 comparações e 2 trocas", () => {
      let state = createSelectionSortState([4, 1, 3]);
      expect(state.currentValues).toEqual([4, 1, 3]);

      // --- PASSADA 0 (i = 0, alvo = índice 0, valor 4) ---
      // Passo 1: Inspeção de j = 1 (valor 1). Candidato atual minIndex = 0 (valor 4).
      // 1 < 4 -> SELECT_NEW_MIN
      const exp1 = getExpectedSelectionInspection(state);
      expect(exp1).not.toBeNull();
      expect(exp1?.scannerValue).toBe(1);
      expect(exp1?.currentMinValue).toBe(4);
      expect(exp1?.expectedDecision).toBe("SELECT_NEW_MIN");
      expect(exp1?.isNewMin).toBe(true);

      const res1 = executeSelectionInspection(state, "SELECT_NEW_MIN");
      expect(res1.valid).toBe(true);
      state = res1.state;
      expect(state.minIndex).toBe(1);
      expect(state.j).toBe(2);
      expect(state.phase).toBe("INSPECT");
      expect(state.comparisons).toBe(1);
      expect(state.swaps).toBe(0);
      expect(state.currentValues).toEqual([4, 1, 3]); // Nenhuma troca na esteira

      // Passo 2: Inspeção de j = 2 (valor 3). Candidato atual minIndex = 1 (valor 1).
      // 3 < 1 é falso -> KEEP_MIN
      const exp2 = getExpectedSelectionInspection(state);
      expect(exp2).not.toBeNull();
      expect(exp2?.scannerValue).toBe(3);
      expect(exp2?.currentMinValue).toBe(1);
      expect(exp2?.expectedDecision).toBe("KEEP_MIN");
      expect(exp2?.isNewMin).toBe(false);

      const res2 = executeSelectionInspection(state, "KEEP_MIN");
      expect(res2.valid).toBe(true);
      state = res2.state;
      expect(state.minIndex).toBe(1);
      expect(state.comparisons).toBe(2);
      expect(state.swaps).toBe(0);
      expect(state.currentValues).toEqual([4, 1, 3]); // Nenhuma troca física
      // Fim da varredura da passada 0!
      expect(state.phase).toBe("COMMIT");
      expect(state.status).toBe("PASS_COMPLETED");

      // Passo 3: Commit da Passada 0
      // minIndex = 1 !== i = 0 -> Troca A[0] e A[1] (4 e 1)
      const expCommit1 = getExpectedSelectionCommit(state);
      expect(expCommit1).not.toBeNull();
      expect(expCommit1?.shouldSwap).toBe(true);
      expect(expCommit1?.targetValue).toBe(4);
      expect(expCommit1?.minValue).toBe(1);

      const resCommit1 = commitSelectionPass(state);
      expect(resCommit1.valid).toBe(true);
      expect(resCommit1.didSwap).toBe(true);
      state = resCommit1.state;

      // Estado após commit 0:
      expect(state.currentValues).toEqual([1, 4, 3]);
      expect(state.swaps).toBe(1);
      expect(state.sortedBoundary).toBe(1);
      expect(getSelectionSortedIndices(state)).toEqual([0]);
      expect(state.completed).toBe(false);

      // Próxima passada inicializada: i = 1, minIndex = 1 (valor 4), j = 2 (valor 3)
      expect(state.i).toBe(1);
      expect(state.minIndex).toBe(1);
      expect(state.j).toBe(2);
      expect(state.phase).toBe("INSPECT");

      // --- PASSADA 1 (i = 1, alvo = índice 1, valor 4) ---
      // Passo 4: Inspeção de j = 2 (valor 3). Candidato atual minIndex = 1 (valor 4).
      // 3 < 4 -> SELECT_NEW_MIN
      const exp3 = getExpectedSelectionInspection(state);
      expect(exp3?.scannerValue).toBe(3);
      expect(exp3?.currentMinValue).toBe(4);
      expect(exp3?.expectedDecision).toBe("SELECT_NEW_MIN");

      const res3 = executeSelectionInspection(state, "SELECT_NEW_MIN");
      expect(res3.valid).toBe(true);
      state = res3.state;
      expect(state.minIndex).toBe(2);
      expect(state.comparisons).toBe(3);
      expect(state.phase).toBe("COMMIT");

      // Passo 5: Commit da Passada 1
      // minIndex = 2 !== i = 1 -> Troca A[1] e A[2] (4 e 3)
      const resCommit2 = commitSelectionPass(state);
      expect(resCommit2.valid).toBe(true);
      expect(resCommit2.didSwap).toBe(true);
      state = resCommit2.state;

      // Estado final:
      expect(state.currentValues).toEqual([1, 3, 4]);
      expect(state.comparisons).toBe(3);
      expect(state.swaps).toBe(2);
      expect(state.errors).toBe(0);
      expect(state.completed).toBe(true);
      expect(state.phase).toBe("COMPLETED");
      expect(state.status).toBe("COMPLETED");
      expect(state.sortedBoundary).toBe(3);
      expect(getSelectionSortedIndices(state)).toEqual([0, 1, 2]);
      expect(isSelectionSortComplete(state)).toBe(true);
    });
  });

  describe("FSM e Comportamento em Ações Incorretas", () => {
    it("deve penalizar erro em SELECT_NEW_MIN quando o esperado era KEEP_MIN sem alterar estado", () => {
      const state = createSelectionSortState([2, 5]); // j = 1 (5), minIndex = 0 (2). 5 < 2 é falso -> KEEP_MIN
      expect(getExpectedSelectionInspection(state)?.expectedDecision).toBe("KEEP_MIN");

      const result = executeSelectionInspection(state, "SELECT_NEW_MIN");
      expect(result.valid).toBe(false);
      expect(result.expectedDecision).toBe("KEEP_MIN");
      expect(result.errorReason).toContain("Decisão incorreta");

      const nextState = result.state;
      expect(nextState.errors).toBe(1);
      expect(nextState.j).toBe(1); // NÃO avançou j
      expect(nextState.minIndex).toBe(0); // NÃO alterou minIndex
      expect(nextState.comparisons).toBe(0); // NÃO incrementou comparações
      expect(nextState.currentValues).toEqual([2, 5]); // NÃO alterou vetor
      expect(nextState.history).toHaveLength(0); // NÃO gravou no history
      expect(nextState.phase).toBe("INSPECT");
    });

    it("deve penalizar erro em KEEP_MIN quando o esperado era SELECT_NEW_MIN sem alterar estado", () => {
      const state = createSelectionSortState([5, 2]); // j = 1 (2), minIndex = 0 (5). 2 < 5 é verdadeiro -> SELECT_NEW_MIN
      expect(getExpectedSelectionInspection(state)?.expectedDecision).toBe("SELECT_NEW_MIN");

      const result = executeSelectionInspection(state, "KEEP_MIN");
      expect(result.valid).toBe(false);
      expect(result.expectedDecision).toBe("SELECT_NEW_MIN");
      expect(result.errorReason).toContain("Decisão incorreta");

      const nextState = result.state;
      expect(nextState.errors).toBe(1);
      expect(nextState.j).toBe(1); // NÃO avançou j
      expect(nextState.minIndex).toBe(0); // NÃO alterou minIndex
      expect(nextState.comparisons).toBe(0); // NÃO incrementou comparações
      expect(nextState.currentValues).toEqual([5, 2]); // NÃO alterou vetor
      expect(nextState.history).toHaveLength(0);
      expect(nextState.phase).toBe("INSPECT");
    });

    it("não deve permitir commitSelectionPass durante a fase INSPECT", () => {
      const state = createSelectionSortState([4, 1, 3]);
      expect(state.phase).toBe("INSPECT");

      const result = commitSelectionPass(state);
      expect(result.valid).toBe(false);
      expect(result.didSwap).toBe(false);
      expect(result.errorReason).toContain("ainda está em fase de inspeção");
      expect(result.state.errors).toBe(1);
      expect(result.state.phase).toBe("INSPECT");
      expect(result.state.currentValues).toEqual([4, 1, 3]);
    });

    it("não deve permitir executeSelectionInspection durante a fase COMMIT", () => {
      let state = createSelectionSortState([2, 1]);
      // Inspeção válida que leva para COMMIT:
      state = executeSelectionInspection(state, "SELECT_NEW_MIN").state;
      expect(state.phase).toBe("COMMIT");

      const result = executeSelectionInspection(state, "SELECT_NEW_MIN");
      expect(result.valid).toBe(false);
      expect(result.errorReason).toContain("aguardando confirmação de transferência (COMMIT)");
      expect(result.state.errors).toBe(1);
      expect(result.state.phase).toBe("COMMIT");
    });

    it("não deve permitir ações após o algoritmo estar concluído", () => {
      const state = createSelectionSortState([1]);
      expect(state.completed).toBe(true);

      const inspectResult = executeSelectionInspection(state, "SELECT_NEW_MIN");
      expect(inspectResult.valid).toBe(false);
      expect(inspectResult.errorReason).toContain("já está concluído");

      const commitResult = commitSelectionPass(state);
      expect(commitResult.valid).toBe(false);
      expect(commitResult.errorReason).toContain("já está concluído");
    });
  });

  describe("Commit sem Troca e Limite Máximo de Trocas", () => {
    it("deve lidar corretamente com passadas onde o elemento já está na posição correta (didSwap = false)", () => {
      // Vetor já ordenado: [10, 20, 30]
      let state = createSelectionSortState([10, 20, 30]);

      // Passada 0: comparações com 10. Nenhuma troca necessária.
      state = executeSelectionInspection(state, "KEEP_MIN").state; // 20 vs 10
      state = executeSelectionInspection(state, "KEEP_MIN").state; // 30 vs 10
      expect(state.phase).toBe("COMMIT");
      expect(state.minIndex).toBe(0);

      const commitRes1 = commitSelectionPass(state);
      expect(commitRes1.valid).toBe(true);
      expect(commitRes1.didSwap).toBe(false);
      state = commitRes1.state;
      expect(state.swaps).toBe(0); // Zero trocas físicas
      expect(state.currentValues).toEqual([10, 20, 30]);
      expect(state.sortedBoundary).toBe(1);

      // Passada 1: 30 vs 20 -> KEEP_MIN
      state = executeSelectionInspection(state, "KEEP_MIN").state;
      expect(state.phase).toBe("COMMIT");
      expect(state.minIndex).toBe(1);

      const commitRes2 = commitSelectionPass(state);
      expect(commitRes2.valid).toBe(true);
      expect(commitRes2.didSwap).toBe(false);
      state = commitRes2.state;
      expect(state.swaps).toBe(0); // Continua 0 trocas
      expect(state.completed).toBe(true);
      expect(state.currentValues).toEqual([10, 20, 30]);
    });

    it("garante que o número de trocas nunca excede n - 1 em qualquer vetor", () => {
      const vectors = [
        [3, 2, 1],
        [5, 4, 3, 2, 1],
        [1, 2, 3, 4, 5],
        [42, 10, 99, 5, 23, 1],
      ];

      for (const vec of vectors) {
        let state = createSelectionSortState(vec);
        while (!state.completed) {
          state = executeSelectionStep(state);
        }
        expect(state.swaps).toBeLessThanOrEqual(vec.length - 1);
        expect(state.comparisons).toBe(calculateTotalExpectedSelectionComparisons(vec.length));
        // Vetor final deve estar ordenado
        const sorted = [...vec].sort((a, b) => a - b);
        expect(state.currentValues).toEqual(sorted);
      }
    });
  });

  describe("Tratamento de Duplicados e Negativos", () => {
    it("deve tratar duplicados com critério estrito A[j] < A[minIndex] (valores iguais resultam em KEEP_MIN)", () => {
      let state = createSelectionSortState([3, 3, 1]);

      // Passada 0:
      // j = 1 (3), minIndex = 0 (3): 3 < 3 é falso -> KEEP_MIN
      const exp1 = getExpectedSelectionInspection(state);
      expect(exp1?.expectedDecision).toBe("KEEP_MIN");
      state = executeSelectionInspection(state, "KEEP_MIN").state;
      expect(state.minIndex).toBe(0);

      // j = 2 (1), minIndex = 0 (3): 1 < 3 é verdadeiro -> SELECT_NEW_MIN
      const exp2 = getExpectedSelectionInspection(state);
      expect(exp2?.expectedDecision).toBe("SELECT_NEW_MIN");
      state = executeSelectionInspection(state, "SELECT_NEW_MIN").state;
      expect(state.minIndex).toBe(2);

      // Commit 0: troca A[0] e A[2] -> [1, 3, 3]
      state = commitSelectionPass(state).state;
      expect(state.currentValues).toEqual([1, 3, 3]);

      // Passada 1:
      // j = 2 (3), minIndex = 1 (3): 3 < 3 é falso -> KEEP_MIN
      state = executeSelectionInspection(state, "KEEP_MIN").state;
      state = commitSelectionPass(state).state;

      expect(state.completed).toBe(true);
      expect(state.currentValues).toEqual([1, 3, 3]);
      expect(state.comparisons).toBe(3);
    });

    it("deve ordenar corretamente vetores com números negativos e zero", () => {
      let state = createSelectionSortState([0, -5, 10, -2]);

      while (!state.completed) {
        state = executeSelectionStep(state);
      }

      expect(state.currentValues).toEqual([-5, -2, 0, 10]);
      expect(state.comparisons).toBe(6);
      expect(state.completed).toBe(true);
    });
  });

  describe("Estrutura do Histórico (History)", () => {
    it("deve registrar fidedignamente passos de INSPECTION e COMMIT sem conter erros", () => {
      let state = createSelectionSortState([4, 1, 3]);

      // Tenta uma ação incorreta propositalmente
      const errRes = executeSelectionInspection(state, "KEEP_MIN");
      state = errRes.state;
      expect(state.errors).toBe(1);
      expect(state.history).toHaveLength(0); // Erros NÃO entram no histórico algorítmico

      // Agora executa o passo correto
      state = executeSelectionInspection(state, "SELECT_NEW_MIN").state;
      expect(state.history).toHaveLength(1);

      const rec1 = state.history[0];
      expect(rec1.type).toBe("INSPECTION");
      if (rec1.type === "INSPECTION") {
        expect(rec1.stepNumber).toBe(1);
        expect(rec1.i).toBe(0);
        expect(rec1.j).toBe(1);
        expect(rec1.minIndexBefore).toBe(0);
        expect(rec1.minIndexAfter).toBe(1);
        expect(rec1.comparedValues.scannerValue).toBe(1);
        expect(rec1.comparedValues.currentMinValue).toBe(4);
        expect(rec1.expectedDecision).toBe("SELECT_NEW_MIN");
        expect(rec1.executedDecision).toBe("SELECT_NEW_MIN");
        expect(rec1.isNewMinFound).toBe(true);
        expect(rec1.valuesSnapshot).toEqual([4, 1, 3]);
      }

      // Segundo passo de inspeção
      state = executeSelectionInspection(state, "KEEP_MIN").state;
      expect(state.history).toHaveLength(2);

      // Passo de commit
      state = commitSelectionPass(state).state;
      expect(state.history).toHaveLength(3);

      const recCommit = state.history[2];
      expect(recCommit.type).toBe("COMMIT");
      if (recCommit.type === "COMMIT") {
        expect(recCommit.stepNumber).toBe(3);
        expect(recCommit.i).toBe(0);
        expect(recCommit.minIndex).toBe(1);
        expect(recCommit.didSwap).toBe(true);
        expect(recCommit.valuesBefore).toEqual([4, 1, 3]);
        expect(recCommit.valuesAfter).toEqual([1, 4, 3]);
        expect(recCommit.targetValueBefore).toBe(4);
        expect(recCommit.minValueBefore).toBe(1);
        expect(recCommit.sortedIndices).toEqual([0]);
      }
    });
  });

  describe("Imutabilidade e Determinismo", () => {
    it("deve garantir imutabilidade estrita em todos os objetos de estado e histórico", () => {
      const state = createSelectionSortState([30, 20, 10]);
      expect(Object.isFrozen(state)).toBe(true);
      expect(Object.isFrozen(state.initialValues)).toBe(true);
      expect(Object.isFrozen(state.currentValues)).toBe(true);
      expect(Object.isFrozen(state.history)).toBe(true);

      const step1 = executeSelectionStep(state);
      expect(Object.isFrozen(step1)).toBe(true);
      expect(Object.isFrozen(step1.currentValues)).toBe(true);
      expect(Object.isFrozen(step1.history)).toBe(true);
      expect(Object.isFrozen(step1.history[0])).toBe(true);

      // Não muta o estado anterior
      expect(state.comparisons).toBe(0);
      expect(step1.comparisons).toBe(1);
    });

    it("deve ser puramente determinístico para a mesma entrada", () => {
      const input = [50, 12, 88, 3, 24];

      let stateA = createSelectionSortState(input);
      let stateB = createSelectionSortState(input);

      while (!stateA.completed) {
        stateA = executeSelectionStep(stateA);
      }
      while (!stateB.completed) {
        stateB = executeSelectionStep(stateB);
      }

      expect(stateA.currentValues).toEqual(stateB.currentValues);
      expect(stateA.comparisons).toBe(stateB.comparisons);
      expect(stateA.swaps).toBe(stateB.swaps);
      expect(stateA.history).toEqual(stateB.history);
    });
  });
});
