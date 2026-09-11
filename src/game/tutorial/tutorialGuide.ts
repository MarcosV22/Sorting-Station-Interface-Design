/**
 * Guia e definições pedagógicas para o Tutorial Interativo do Sorting Station.
 *
 * Módulo puramente funcional e desacoplado de React e UI.
 * Mapeia os estados da Bubble Sort Engine sobre o vetor [3, 1, 2]
 * para orientações passo a passo curtas e formativas.
 */

import type { BubbleSortState } from "../sorting/types"

export const TUTORIAL_INITIAL_ARRAY: readonly number[] = Object.freeze([3, 1, 2])

export interface TutorialPassNotice {
  readonly title: string
  readonly description: string
}

export interface TutorialStepInfo {
  readonly stepNumber: 1 | 2 | 3 | 4
  readonly title: string
  readonly subtitle: string
  readonly prompt: string
  readonly passNotice?: TutorialPassNotice
}

/**
 * Retorna as instruções pedagógicas contextuais correspondentes ao estado atual
 * da simulação interativa guiada do Bubble Sort.
 */
export function getTutorialStepInfo(state: BubbleSortState): TutorialStepInfo {
  if (state.completed) {
    return {
      stepNumber: 4,
      title: "TREINAMENTO BÁSICO CONCLUÍDO",
      subtitle: "PROTOCOLO BUBBLE",
      prompt:
        "Você concluiu todas as etapas do treinamento interativo e está pronto para o turno real.",
      passNotice: {
        title: "ORDENAÇÃO COMPLETA",
        description:
          "Todas as cargas foram verificadas e estabilizadas conforme as regras do algoritmo.",
      },
    }
  }

  // Passo 1: Passada 0, Comparação 0 (Par: 3 e 1)
  if (state.passIndex === 0 && state.comparisonIndex === 0) {
    return {
      stepNumber: 1,
      title: "ETAPA 1/3 — PRIMEIRA COMPARAÇÃO",
      subtitle: "OBSERVAÇÃO E DECISÃO",
      prompt:
        "No Bubble Sort, a esteira compara duas cargas vizinhas por vez. Observe o par destacado: 3 e 1. Como 3 é maior que 1, qual decisão deve ser tomada?",
    }
  }

  // Passo 2: Passada 0, Comparação 1 (Par: 3 e 2)
  if (state.passIndex === 0 && state.comparisonIndex === 1) {
    return {
      stepNumber: 2,
      title: "ETAPA 2/3 — SEGUNDA COMPARAÇÃO",
      subtitle: "AVANÇO DO LAÇO INTERNO",
      prompt:
        "A carga 3 avançou para o meio. Agora o algoritmo compara o próximo par vizinho: 3 e 2. Como 3 é maior que 2, qual decisão deve ser tomada?",
    }
  }

  // Passo 3: Passada 1, Comparação 0 (Par: 1 e 2)
  if (state.passIndex === 1 && state.comparisonIndex === 0) {
    return {
      stepNumber: 3,
      title: "ETAPA 3/3 — RECONHECENDO ELEMENTOS EM ORDEM",
      subtitle: "SEGUNDA PASSADA",
      prompt:
        "Agora comparamos o par 1 e 2. Como 1 é menor que 2, essas cargas já estão na ordem relativa correta. O que deve acontecer?",
      passNotice: {
        title: "PASSADA 1 CONCLUÍDA",
        description:
          "Uma passada é uma varredura da esquerda para a direita pela parte ainda não organizada da esteira. No Bubble Sort crescente, a maior carga da varredura (3) atingiu sua posição definitiva e foi consolidada.",
      },
    }
  }

  // Fallback seguro
  return {
    stepNumber: 1,
    title: "TREINAMENTO INTERATIVO",
    subtitle: "PROTOCOLO BUBBLE",
    prompt: "Observe o par destacado e decida entre TROCAR ou MANTER.",
  }
}
