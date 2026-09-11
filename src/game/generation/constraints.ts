/**
 * Predicados de restrições (constraints) para geração procedural de vetores.
 * Módulo puro, agnóstico a qualquer algoritmo ou motor de ordenação.
 */

import type {
  ArrayConstraint,
  ArrayConstraintDefinition,
  ConstraintResolvable,
} from "./types";

/**
 * Valida se o vetor NÃO está previamente ordenado em ordem não-decrescente.
 * Retorna true se houver ao menos uma inversão adjacente (arr[i] > arr[i+1]).
 */
export const isNotSorted: ArrayConstraint = (arr) => {
  if (arr.length <= 1) return true;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return true;
  }
  return false;
};

/**
 * Valida se o vetor NÃO está completamente invertido (pior caso em ordem não-crescente).
 * Retorna true se houver ao menos um par adjacente em ordem relativa (arr[i] <= arr[i+1]).
 */
export const isNotReverseSorted: ArrayConstraint = (arr) => {
  if (arr.length <= 1) return true;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] <= arr[i + 1]) return true;
  }
  return false;
};

/**
 * Valida se o vetor possui ao menos um par adjacente invertido (arr[i] > arr[i+1])
 * que force a decisão pedagógica TROCAR (SWAP).
 */
export const hasAtLeastOneSwapCandidate: ArrayConstraint = (arr) => {
  if (arr.length < 2) return false;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return true;
  }
  return false;
};

/**
 * Valida se o vetor possui ao menos um par adjacente já em ordem (arr[i] <= arr[i+1])
 * que force a decisão pedagógica MANTER (KEEP).
 */
export const hasAtLeastOneKeepCandidate: ArrayConstraint = (arr) => {
  if (arr.length < 2) return false;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] <= arr[i + 1]) return true;
  }
  return false;
};

/**
 * Valida se o vetor já está totalmente ordenado em ordem não-decrescente.
 * Útil para cenários de desafio Early Exit ou presets customizados.
 */
export const isAlreadySorted: ArrayConstraint = (arr) => {
  if (arr.length <= 1) return true;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
};

/**
 * Valida se o vetor está estritamente invertido (ordem decrescente completa).
 */
export const isReverseSorted: ArrayConstraint = (arr) => {
  if (arr.length <= 1) return true;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < arr[i + 1]) return false;
  }
  return true;
};

/**
 * Valida que não há elementos duplicados no vetor.
 */
export const hasNoDuplicates: ArrayConstraint = (arr) => {
  return new Set(arr).size === arr.length;
};

/**
 * Valida que há ao menos um par de elementos duplicados no vetor.
 */
export const hasDuplicates: ArrayConstraint = (arr) => {
  return new Set(arr).size < arr.length;
};

/**
 * Normaliza qualquer restrição resolúvel para o formato com id, descrição e predicado.
 */
export function resolveConstraint(constraint: ConstraintResolvable): {
  id: string;
  description: string;
  predicate: ArrayConstraint;
} {
  if (typeof constraint === "function") {
    return {
      id: constraint.name || "anonymous-constraint",
      description: "Restrição procedural personalizada",
      predicate: constraint,
    };
  }
  return constraint;
}

/**
 * Conjunto canônico de restrições pedagógicas para as fases regulares da campanha Bubble Sort:
 * 1. Não previamente ordenado;
 * 2. Não completamente invertido;
 * 3. Possui ao menos uma decisão de SWAP (TROCAR);
 * 4. Possui ao menos uma decisão de KEEP (MANTER).
 *
 * Definido externamente ao gerador universal, sem importar a BubbleSortEngine.
 */
export const BUBBLE_CAMPAIGN_CONSTRAINTS: readonly ArrayConstraintDefinition[] = Object.freeze([
  {
    id: "not-sorted",
    description: "O vetor não deve estar previamente ordenado",
    predicate: isNotSorted,
  },
  {
    id: "not-reverse-sorted",
    description: "O vetor não deve estar completamente invertido (pior caso)",
    predicate: isNotReverseSorted,
  },
  {
    id: "has-swap",
    description: "O vetor deve conter ao menos um par adjacente invertido para a ação TROCAR (SWAP)",
    predicate: hasAtLeastOneSwapCandidate,
  },
  {
    id: "has-keep",
    description: "O vetor deve conter ao menos um par adjacente ordenado para a ação MANTER (KEEP)",
    predicate: hasAtLeastOneKeepCandidate,
  },
]);
