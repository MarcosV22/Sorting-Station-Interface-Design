/**
 * Definições canônicas dos cenários do Modo Desafio (Variante Bubble Sort Early Exit).
 *
 * Cada cenário foi selecionado para ilustrar propriedades computacionais específicas
 * da heurística de término antecipado por ausência de permutas.
 */

export interface ChallengeScenario {
  readonly id: number
  readonly title: string
  readonly subtitle: string
  readonly array: readonly number[]
  readonly expectedComparisons: number
  readonly canonicalComparisons: number
  readonly comparisonsAvoided: number
  readonly pedagogicalDescription: string
}

export const CHALLENGE_SCENARIOS: readonly ChallengeScenario[] = Object.freeze([
  Object.freeze({
    id: 1,
    title: "Cenário 1 — Vetor Já Ordenado",
    subtitle: "Melhor Caso Formal (Ω(n))",
    array: Object.freeze([12, 25, 47, 63, 88]),
    expectedComparisons: 4,
    canonicalComparisons: 10,
    comparisonsAvoided: 6,
    pedagogicalDescription:
      "A esteira já chega ordenada. Uma única passada completa (4 comparações) sem nenhuma troca é suficiente para certificar a estabilidade e encerrar a execução antecipadamente, economizando 60% das operações em relação ao Bubble Sort canônico.",
  }),
  Object.freeze({
    id: 2,
    title: "Cenário 2 — Quase Ordenado",
    subtitle: "Estabilização Precoce",
    array: Object.freeze([15, 8, 23, 42, 60]),
    expectedComparisons: 7,
    canonicalComparisons: 10,
    comparisonsAvoided: 3,
    pedagogicalDescription:
      "Apenas o primeiro par vizinho requer troca na Passada 1. A Passada 2 confirma a ausência de novas permutas (0 trocas), ativando o término antecipado após 7 comparações (economia de 30% em relação ao limite canônico de 10).",
  }),
  Object.freeze({
    id: 3,
    title: "Cenário 3 — Pior Caso para Otimização",
    subtitle: "Inversão Crítica (Elemento Tartaruga)",
    array: Object.freeze([30, 45, 60, 75, 10]),
    expectedComparisons: 10,
    canonicalComparisons: 10,
    comparisonsAvoided: 0,
    pedagogicalDescription:
      "O menor elemento (10) está posicionado no fim da esteira e avança apenas uma posição por passada. Como ocorrem permutas em todas as passadas, o Early Exit não é acionado e o algoritmo executa todas as 10 comparações, evidenciando que a variante otimizada não traz economia no pior caso.",
  }),
])
