/**
 * Restrições procedurais e configurações de geração específicas do Selection Sort.
 * Reutiliza integralmente a infraestrutura de src/game/generation/.
 * A camada generation/ permanece pura e agnóstica (zero imports de engines).
 */

import {
  generateSortingArray,
  isNotSorted,
  isNotReverseSorted,
  DEFAULT_MIN_VALUE,
  DEFAULT_MAX_VALUE,
  DEFAULT_MAX_ATTEMPTS,
  type ArrayConstraint,
  type ArrayConstraintDefinition,
  type GeneratedArrayResult,
  type SeedInput,
} from "../../generation";

/**
 * Tamanhos canônicos dos lotes de carga para as 3 fases regulares da futura campanha de Selection Sort:
 * - Fase 1: 4 cargas
 * - Fase 2: 5 cargas
 * - Fase 3: 6 cargas
 */
export const SELECTION_CAMPAIGN_PHASE_LENGTHS = [4, 5, 6] as const;

/**
 * Predicado matemático puro:
 * Valida que o menor elemento global do vetor NÃO está localizado inicialmente no índice 0.
 * Isso garante pedagogicamente que a primeira passada terá trabalho ativo de busca e transferência.
 */
export const isGlobalMinNotInFirstPosition: ArrayConstraint = (arr) => {
  if (arr.length <= 1) return false;
  const minVal = Math.min(...arr);
  return arr[0] !== minVal;
};

/**
 * Predicado matemático puro:
 * Simula a varredura do Selection Sort sobre uma cópia local do vetor e valida
 * se haverá pelo menos uma inspeção com decisão MANTER CANDIDATO (KEEP_MIN),
 * isto é, onde arr[j] >= arr[currentMinSoFar].
 */
export const hasAtLeastOneKeepMin: ArrayConstraint = (arr) => {
  if (arr.length < 2) return false;
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) {
        minIdx = j;
      } else {
        // Encontrou ao menos uma situação onde o elemento inspecionado não é menor que o candidato
        return true;
      }
    }
    if (minIdx !== i) {
      const temp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = temp;
    }
  }
  return false;
};

/**
 * Predicado matemático puro:
 * Valida se existe ao menos uma passada onde o candidato a mínimo é atualizado
 * duas ou mais vezes (múltiplas atualizações de minIndex na mesma varredura).
 * Recomendado para enriquecer o aprendizado pedagógico nas fases maiores (fases 2 e 3).
 */
export const hasMultipleMinUpdatesInAtLeastOnePass: ArrayConstraint = (arr) => {
  if (arr.length < 4) return false;
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i;
    let updatesInPass = 0;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[minIdx]) {
        minIdx = j;
        updatesInPass++;
      }
    }
    if (updatesInPass >= 2) {
      return true;
    }
    if (minIdx !== i) {
      const temp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = temp;
    }
  }
  return false;
};

/**
 * Restrições procedurais fundamentais para Selection Sort:
 * 1. Não previamente ordenado;
 * 2. Não completamente invertido;
 * 3. Mínimo global fora do índice 0;
 * 4. Pelo menos uma decisão de MANTER CANDIDATO (KEEP_MIN).
 */
export const SELECTION_BASE_CONSTRAINTS: readonly ArrayConstraintDefinition[] = Object.freeze([
  {
    id: "selection-not-sorted",
    description: "O vetor não deve estar previamente ordenado",
    predicate: isNotSorted,
  },
  {
    id: "selection-not-reverse-sorted",
    description: "O vetor não deve estar totalmente invertido",
    predicate: isNotReverseSorted,
  },
  {
    id: "selection-min-not-at-zero",
    description: "O menor elemento não deve iniciar na primeira posição (índice 0)",
    predicate: isGlobalMinNotInFirstPosition,
  },
  {
    id: "selection-has-keep-min",
    description: "O vetor deve propiciar ao menos uma decisão MANTER CANDIDATO (KEEP_MIN)",
    predicate: hasAtLeastOneKeepMin,
  },
]);

/**
 * Retorna as constraints apropriadas para a fase informada (1, 2 ou 3).
 * Fases 2 e 3 incorporam a restrição de múltiplas atualizações para aprofundar o discernimento do operador.
 */
export function getSelectionPhaseConstraints(
  phase: number
): readonly ArrayConstraintDefinition[] {
  if (phase <= 1) {
    return SELECTION_BASE_CONSTRAINTS;
  }

  return Object.freeze([
    ...SELECTION_BASE_CONSTRAINTS,
    {
      id: "selection-multiple-min-updates",
      description:
        "O vetor deve favorecer ao menos uma passada com múltiplas atualizações do candidato mínimo",
      predicate: hasMultipleMinUpdatesInAtLeastOnePass,
    },
  ]);
}

/**
 * Gera deterministicamente um vetor procedural para as fases da futura campanha de Selection Sort.
 * - Fase 1: length = 4
 * - Fase 2: length = 5
 * - Fase 3: length = 6
 * - range: 1..99
 * - allowDuplicates: false
 *
 * Utiliza o gerador universal generateSortingArray de src/game/generation/.
 */
export function generateSelectionPhaseArray(
  phase: number,
  seed?: SeedInput
): GeneratedArrayResult {
  const clampedPhase = Math.max(
    1,
    Math.min(phase, SELECTION_CAMPAIGN_PHASE_LENGTHS.length)
  );
  const length = SELECTION_CAMPAIGN_PHASE_LENGTHS[clampedPhase - 1];
  const constraints = getSelectionPhaseConstraints(clampedPhase);

  return generateSortingArray({
    length,
    minValue: DEFAULT_MIN_VALUE,
    maxValue: DEFAULT_MAX_VALUE,
    allowDuplicates: false,
    seed,
    constraints,
    maxAttempts: DEFAULT_MAX_ATTEMPTS,
  });
}
