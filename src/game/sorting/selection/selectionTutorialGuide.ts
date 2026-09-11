/**
 * Guia pedagógico e scaffolding interativo para o tutorial do Selection Sort.
 * Utiliza exclusivamente a SelectionSortEngine como fonte de verdade algorítmica.
 */

import type {
  SelectionSortState,
  SelectionInspectionDecision,
  SelectionInspectionResult,
  SelectionCommitResult,
} from "./types";
import {
  getExpectedSelectionInspection,
  getExpectedSelectionCommit,
} from "./selectionSortEngine";

/**
 * Vetor fixo canônico para o tutorial do Selection Sort: [4, 1, 3]
 * - Passada 1 (i=0): min=0 (4), j=1 (1) -> NOVO MÍNIMO (min=1); j=2 (3) -> MANTER -> COMMIT swap [1, 4, 3]
 * - Passada 2 (i=1): min=1 (4), j=2 (3) -> NOVO MÍNIMO (min=2) -> COMMIT swap [1, 3, 4]
 * - Conclusão: [1, 3, 4]
 */
export const SELECTION_TUTORIAL_INITIAL_ARRAY: readonly number[] = Object.freeze([
  4, 1, 3,
]);

export interface SelectionTutorialStepInfo {
  readonly phase: "INSPECT" | "COMMIT" | "COMPLETED";
  readonly passNumber: number;
  readonly totalPasses: number;
  readonly targetIndex: number;
  readonly minIndex: number;
  readonly scanIndex: number | null;
  readonly title: string;
  readonly instruction: string;
  readonly hint: string;
  readonly targetValue: number;
  readonly currentMinValue: number;
  readonly inspectedValue: number | null;
  readonly canSwapOnCommit: boolean;
}

/**
 * Gera informações diagnósticas e pedagógicas contextualizadas a partir do estado atual da engine.
 */
export function getSelectionTutorialStepInfo(
  state: SelectionSortState
): SelectionTutorialStepInfo {
  const n = state.arrayLength;
  const totalPasses = Math.max(1, n - 1);
  const passNumber = Math.min(state.i + 1, totalPasses);

  if (state.completed || state.phase === "COMPLETED") {
    const lastVal = state.currentValues[n - 1] ?? 0;
    return {
      phase: "COMPLETED",
      passNumber: totalPasses,
      totalPasses,
      targetIndex: n - 1,
      minIndex: n - 1,
      scanIndex: null,
      title: "ORDENAÇÃO CONCLUÍDA!",
      instruction:
        "O lote de cargas [1, 3, 4] foi totalmente ordenado com sucesso. Todas as posições foram consolidadas com no máximo uma transferência por passada.",
      hint: "No Selection Sort, cada passada varre os elementos restantes e executa no máximo 1 transferência, garantindo estabilização progressiva.",
      targetValue: lastVal,
      currentMinValue: lastVal,
      inspectedValue: null,
      canSwapOnCommit: false,
    };
  }

  const targetValue = state.currentValues[state.i];
  const currentMinValue = state.currentValues[state.minIndex];

  if (state.phase === "INSPECT") {
    const scanIndex = state.j;
    const inspectedValue = state.currentValues[scanIndex];
    const expected = getExpectedSelectionInspection(state);
    const isSmaller = expected ? expected.isNewMin : false;

    return {
      phase: "INSPECT",
      passNumber,
      totalPasses,
      targetIndex: state.i,
      minIndex: state.minIndex,
      scanIndex,
      title: `PASSADA ${passNumber}/${totalPasses} • VARREDURA`,
      instruction: isSmaller
        ? `O sensor inspecionou a carga #${scanIndex + 1} (valor ${inspectedValue}). Como ${inspectedValue} < ${currentMinValue} (candidato #${state.minIndex + 1}), a ação correta é NOVO MÍNIMO.`
        : `O sensor inspecionou a carga #${scanIndex + 1} (valor ${inspectedValue}). Como ${inspectedValue} não é menor que ${currentMinValue} (candidato #${state.minIndex + 1}), a ação correta é MANTER CANDIDATO.`,
      hint: `Comparação formal: A[${scanIndex}] < A[${state.minIndex}] (${inspectedValue} < ${currentMinValue}). ${
        isSmaller
          ? `Verdadeiro: ${inspectedValue} é menor que ${currentMinValue}. Atualize o ponteiro com NOVO MÍNIMO.`
          : `Falso: ${inspectedValue} não é menor que ${currentMinValue}. Preserve o candidato atual com MANTER CANDIDATO.`
      }`,
      targetValue,
      currentMinValue,
      inspectedValue,
      canSwapOnCommit: false,
    };
  }

  // Phase: COMMIT
  const commitCheck = getExpectedSelectionCommit(state);
  const willSwap = commitCheck ? commitCheck.shouldSwap : false;

  return {
    phase: "COMMIT",
    passNumber,
    totalPasses,
    targetIndex: state.i,
    minIndex: state.minIndex,
    scanIndex: null,
    title: `PASSADA ${passNumber}/${totalPasses} • CONSOLIDAÇÃO`,
    instruction: willSwap
      ? `Varredura concluída! O menor elemento encontrado (#${state.minIndex + 1}, valor ${currentMinValue}) será transferido para a posição alvo (#${state.i + 1}, valor ${targetValue}).`
      : `Varredura concluída! O menor elemento já está na posição alvo (#${state.i + 1}, valor ${targetValue}). A posição será consolidada sem permuta física.`,
    hint: willSwap
      ? `A posição alvo #${state.i + 1} possui valor ${targetValue}, enquanto o menor elemento está em #${state.minIndex + 1} (valor ${currentMinValue}). Execute TRANSFERIR MENOR CARGA.`
      : `O candidato mínimo coincide com a posição alvo #${state.i + 1}. Execute CONSOLIDAR POSIÇÃO sem permuta.`,
    targetValue,
    currentMinValue,
    inspectedValue: null,
    canSwapOnCommit: willSwap,
  };
}

/**
 * Retorna mensagem formativa para a ação de inspeção do operador.
 */
export function getSelectionInspectionFeedback(
  result: SelectionInspectionResult,
  stateBefore: SelectionSortState,
  decision: SelectionInspectionDecision
): string {
  if (result.valid) {
    if (decision === "SELECT_NEW_MIN") {
      const newMin = result.state.minIndex;
      const val = result.state.currentValues[newMin];
      return `Excelente! Novo candidato mínimo registrado na posição #${newMin + 1} (valor ${val}).`;
    }
    const curMin = result.state.minIndex;
    const val = result.state.currentValues[curMin];
    return `Correto! Candidato mínimo na posição #${curMin + 1} (valor ${val}) preservado.`;
  }

  return (
    result.errorReason ??
    "A carga inspecionada não corresponde à decisão selecionada."
  );
}

/**
 * Retorna mensagem formativa para a ação de commit (fechamento de passada).
 */
export function getSelectionCommitFeedback(
  result: SelectionCommitResult,
  stateBefore: SelectionSortState
): string {
  if (result.valid) {
    if (result.didSwap) {
      const targetPos = stateBefore.i + 1;
      const minPos = stateBefore.minIndex + 1;
      const finalVal = result.state.currentValues[stateBefore.i];
      return `Transferência concluída! Posições #${targetPos} e #${minPos} permutadas. Posição #${targetPos} consolidada com valor ${finalVal} (selo OK).`;
    }
    const targetPos = stateBefore.i + 1;
    return `Consolidação sem permuta! A carga na posição #${targetPos} já era a menor da partição (selo OK).`;
  }

  return (
    result.errorReason ??
    "Não foi possível concluir a passada neste momento."
  );
}
