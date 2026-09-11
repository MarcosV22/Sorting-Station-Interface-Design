import { describe, it, expect } from "vitest"
import {
  createBubbleSortState,
  getExpectedComparison,
  executeBubbleSortStep,
  executeUserStep,
  isBubbleSortComplete,
  getSortedIndices,
  isIndexPermanentlySorted,
  calculateTotalExpectedComparisons,
  calculateBubbleSortProgress,
} from "./index"
import type { BubbleSortState } from "./types"

describe("Bubble Sort Engine — Suíte Pedagógica P0.2", () => {
  // --------------------------------------------------
  // 1. Inicialização
  // --------------------------------------------------
  describe("1. Inicialização (createBubbleSortState)", () => {
    it("deve inicializar o estado padrão com todos os campos e contadores zerados", () => {
      const input = [5, 2, 4, 1]
      const state = createBubbleSortState(input)

      expect(state.initialValues).toEqual([5, 2, 4, 1])
      expect(state.currentValues).toEqual([5, 2, 4, 1])
      expect(state.arrayLength).toBe(4)
      expect(state.passIndex).toBe(0)
      expect(state.comparisonIndex).toBe(0)
      expect(state.comparisons).toBe(0)
      expect(state.swaps).toBe(0)
      expect(state.swapsInCurrentPass).toBe(0)
      expect(state.errors).toBe(0)
      expect(state.completed).toBe(false)
      expect(state.status).toBe("IN_PROGRESS")
      expect(state.sortedBoundary).toBe(4)
      expect(state.history).toEqual([])
    })

    it("não deve modificar o array recebido por parâmetro (cópia defensiva)", () => {
      const input = [5, 2, 4, 1]
      createBubbleSortState(input)
      expect(input).toEqual([5, 2, 4, 1])
    })

    it("deve inicializar sem nenhum índice consolidado para vetores de tamanho >= 2", () => {
      const state = createBubbleSortState([5, 2, 4, 1])
      expect(getSortedIndices(state)).toEqual([])
      expect(isIndexPermanentlySorted(state, 0)).toBe(false)
      expect(isIndexPermanentlySorted(state, 1)).toBe(false)
      expect(isIndexPermanentlySorted(state, 2)).toBe(false)
      expect(isIndexPermanentlySorted(state, 3)).toBe(false)
    })

    it("deve congelar o estado inicial para impedir mutação acidental", () => {
      const state = createBubbleSortState([5, 2, 4, 1])
      expect(Object.isFrozen(state)).toBe(true)
      expect(Object.isFrozen(state.currentValues)).toBe(true)
      expect(Object.isFrozen(state.initialValues)).toBe(true)
      expect(Object.isFrozen(state.history)).toBe(true)
    })
  })

  // --------------------------------------------------
  // 2. Par esperado
  // --------------------------------------------------
  describe("2. Par esperado (getExpectedComparison)", () => {
    it("deve retornar o par inicial [0, 1] com valores corretos e sinalização de troca", () => {
      const state = createBubbleSortState([5, 2, 4, 1])
      const comparison = getExpectedComparison(state)

      expect(comparison).not.toBeNull()
      expect(comparison?.passIndex).toBe(0)
      expect(comparison?.comparisonIndex).toBe(0)
      expect(comparison?.leftIndex).toBe(0)
      expect(comparison?.rightIndex).toBe(1)
      expect(comparison?.leftValue).toBe(5)
      expect(comparison?.rightValue).toBe(2)
      expect(comparison?.shouldSwap).toBe(true)
    })

    it("deve avançar o par esperado para [1, 2] após o primeiro passo", () => {
      const state0 = createBubbleSortState([5, 2, 4, 1])
      const state1 = executeBubbleSortStep(state0)
      const comparison = getExpectedComparison(state1)

      expect(comparison).not.toBeNull()
      expect(comparison?.passIndex).toBe(0)
      expect(comparison?.comparisonIndex).toBe(1)
      expect(comparison?.leftIndex).toBe(1)
      expect(comparison?.rightIndex).toBe(2)
      expect(comparison?.leftValue).toBe(5)
      expect(comparison?.rightValue).toBe(4)
      expect(comparison?.shouldSwap).toBe(true)
    })

    it("deve retornar ao início da partição não consolidada [0, 1] ao iniciar nova passada", () => {
      let state = createBubbleSortState([5, 2, 4, 1])
      // Passada 0 realiza 3 comparações:
      state = executeBubbleSortStep(state) // passo 1: comp [0,1]
      state = executeBubbleSortStep(state) // passo 2: comp [1,2]
      state = executeBubbleSortStep(state) // passo 3: comp [2,3] -> conclui passada 0

      expect(state.passIndex).toBe(1)
      expect(state.comparisonIndex).toBe(0)

      const comparison = getExpectedComparison(state)
      expect(comparison).not.toBeNull()
      expect(comparison?.passIndex).toBe(1)
      expect(comparison?.comparisonIndex).toBe(0)
      expect(comparison?.leftIndex).toBe(0)
      expect(comparison?.rightIndex).toBe(1)
      expect(comparison?.leftValue).toBe(2)
      expect(comparison?.rightValue).toBe(4)
      expect(comparison?.shouldSwap).toBe(false)
    })
  })

  // --------------------------------------------------
  // 3. Execução automática do passo
  // --------------------------------------------------
  describe("3. Execução automática do passo (executeBubbleSortStep)", () => {
    it("deve executar a sequência canônica completa do vetor [5, 2, 4, 1] com 6 comparações e 5 trocas", () => {
      let state = createBubbleSortState([5, 2, 4, 1])

      // Passo 1: comp [0, 1] -> 5 > 2 -> swap
      state = executeBubbleSortStep(state)
      expect(state.currentValues).toEqual([2, 5, 4, 1])
      expect(state.comparisons).toBe(1)
      expect(state.swaps).toBe(1)
      expect(state.passIndex).toBe(0)
      expect(state.comparisonIndex).toBe(1)

      // Passo 2: comp [1, 2] -> 5 > 4 -> swap
      state = executeBubbleSortStep(state)
      expect(state.currentValues).toEqual([2, 4, 5, 1])
      expect(state.comparisons).toBe(2)
      expect(state.swaps).toBe(2)
      expect(state.passIndex).toBe(0)
      expect(state.comparisonIndex).toBe(2)

      // Passo 3: comp [2, 3] -> 5 > 1 -> swap -> fim da passada 0
      state = executeBubbleSortStep(state)
      expect(state.currentValues).toEqual([2, 4, 1, 5])
      expect(state.comparisons).toBe(3)
      expect(state.swaps).toBe(3)
      expect(state.passIndex).toBe(1)
      expect(state.comparisonIndex).toBe(0)
      expect(state.sortedBoundary).toBe(3)

      // Passo 4: comp [0, 1] -> 2 <= 4 -> KEEP (sem swap)
      state = executeBubbleSortStep(state)
      expect(state.currentValues).toEqual([2, 4, 1, 5])
      expect(state.comparisons).toBe(4)
      expect(state.swaps).toBe(3) // swaps não incrementa
      expect(state.passIndex).toBe(1)
      expect(state.comparisonIndex).toBe(1)

      // Passo 5: comp [1, 2] -> 4 > 1 -> swap -> fim da passada 1
      state = executeBubbleSortStep(state)
      expect(state.currentValues).toEqual([2, 1, 4, 5])
      expect(state.comparisons).toBe(5)
      expect(state.swaps).toBe(4)
      expect(state.passIndex).toBe(2)
      expect(state.comparisonIndex).toBe(0)
      expect(state.sortedBoundary).toBe(2)

      // Passo 6: comp [0, 1] -> 2 > 1 -> swap -> fim da passada 2 e conclusão
      state = executeBubbleSortStep(state)
      expect(state.currentValues).toEqual([1, 2, 4, 5])
      expect(state.comparisons).toBe(6)
      expect(state.swaps).toBe(5)
      expect(state.completed).toBe(true)
      expect(state.status).toBe("COMPLETED")
      expect(state.sortedBoundary).toBe(0)
      expect(isBubbleSortComplete(state)).toBe(true)
    })
  })

  // --------------------------------------------------
  // 4. Interação do jogador
  // --------------------------------------------------
  describe("4. Interação do jogador (executeUserStep)", () => {
    it("deve aceitar ação válida SWAP quando leftValue > rightValue", () => {
      const state = createBubbleSortState([5, 2, 4, 1])
      const result = executeUserStep(state, "SWAP")

      expect(result.valid).toBe(true)
      expect(result.state.currentValues).toEqual([2, 5, 4, 1])
      expect(result.state.comparisons).toBe(1)
      expect(result.state.swaps).toBe(1)
      expect(result.state.errors).toBe(0)
      expect(result.explanation).toContain("Correto")
    })

    it("deve aceitar ação válida KEEP quando leftValue <= rightValue", () => {
      // Avança até o passo 4 onde currentValues = [2, 4, 1, 5] e par é (2, 4)
      let state = createBubbleSortState([5, 2, 4, 1])
      state = executeBubbleSortStep(state)
      state = executeBubbleSortStep(state)
      state = executeBubbleSortStep(state)

      const result = executeUserStep(state, "KEEP")
      expect(result.valid).toBe(true)
      expect(result.state.currentValues).toEqual([2, 4, 1, 5])
      expect(result.state.comparisons).toBe(4)
      expect(result.state.swaps).toBe(3) // não houve swap
      expect(result.state.errors).toBe(0)
      expect(result.explanation).toContain("Correto")
    })

    it("deve rejeitar KEEP quando troca é necessária e NÃO avançar a máquina de estados", () => {
      const state = createBubbleSortState([5, 2, 4, 1]) // par [0, 1] são 5 e 2 -> troca obrigatória
      const result = executeUserStep(state, "KEEP")

      expect(result.valid).toBe(false)
      expect(result.expectedDecision).toBe("SWAP")
      expect(result.actualDecision).toBe("KEEP")
      expect(result.explanation).toContain("devem ser trocados")

      // Verificações rigorosas de NÃO-AVANÇO:
      expect(result.state.passIndex).toBe(state.passIndex)
      expect(result.state.comparisonIndex).toBe(state.comparisonIndex)
      expect(result.state.comparisons).toBe(state.comparisons)
      expect(result.state.swaps).toBe(state.swaps)
      expect(result.state.currentValues).toEqual(state.currentValues)
      expect(result.state.history.length).toBe(state.history.length)
      // Único campo que deve mudar em caso de erro é o contador de erros:
      expect(result.state.errors).toBe(1)
    })

    it("deve rejeitar SWAP quando nenhuma troca é necessária e NÃO avançar a máquina de estados", () => {
      let state = createBubbleSortState([5, 2, 4, 1])
      state = executeBubbleSortStep(state)
      state = executeBubbleSortStep(state)
      state = executeBubbleSortStep(state) // par agora é (2, 4)

      const result = executeUserStep(state, "SWAP")

      expect(result.valid).toBe(false)
      expect(result.expectedDecision).toBe("KEEP")
      expect(result.actualDecision).toBe("SWAP")
      expect(result.explanation).toContain("NÃO devem ser trocados")

      // Verificações de NÃO-AVANÇO:
      expect(result.state.passIndex).toBe(state.passIndex)
      expect(result.state.comparisonIndex).toBe(state.comparisonIndex)
      expect(result.state.comparisons).toBe(state.comparisons)
      expect(result.state.swaps).toBe(state.swaps)
      expect(result.state.currentValues).toEqual(state.currentValues)
      expect(result.state.history.length).toBe(state.history.length)
      expect(result.state.errors).toBe(1)
    })

    it("deve rejeitar tentativas de submissão em estado já concluído", () => {
      let state = createBubbleSortState([2, 1])
      state = executeBubbleSortStep(state) // conclui [1, 2]
      expect(state.completed).toBe(true)

      const result = executeUserStep(state, "SWAP")
      expect(result.valid).toBe(false)
      expect(result.explanation).toContain("já foi concluído")
    })
  })

  // --------------------------------------------------
  // 5. Passadas
  // --------------------------------------------------
  describe("5. Passadas", () => {
    it("deve respeitar a contagem teórica de comparações por passada: (n-1) + (n-2) + ... + 1", () => {
      // Para n = 4: 3 + 2 + 1 = 6
      expect(calculateTotalExpectedComparisons(4)).toBe(6)

      let state = createBubbleSortState([5, 2, 4, 1])

      // Passada 0 realiza 3 comparações (j = 0, 1, 2)
      expect(state.passIndex).toBe(0)
      state = executeBubbleSortStep(state)
      expect(state.passIndex).toBe(0)
      state = executeBubbleSortStep(state)
      expect(state.passIndex).toBe(0)
      state = executeBubbleSortStep(state)

      // Passada 1 realiza 2 comparações (j = 0, 1)
      expect(state.passIndex).toBe(1)
      state = executeBubbleSortStep(state)
      expect(state.passIndex).toBe(1)
      state = executeBubbleSortStep(state)

      // Passada 2 realiza 1 comparação (j = 0)
      expect(state.passIndex).toBe(2)
      state = executeBubbleSortStep(state)

      expect(state.completed).toBe(true)
      expect(state.comparisons).toBe(6)
    })

    it("deve calcular o total esperado de comparações corretamente para diferentes tamanhos", () => {
      expect(calculateTotalExpectedComparisons(0)).toBe(0)
      expect(calculateTotalExpectedComparisons(1)).toBe(0)
      expect(calculateTotalExpectedComparisons(2)).toBe(1)
      expect(calculateTotalExpectedComparisons(3)).toBe(3)
      expect(calculateTotalExpectedComparisons(4)).toBe(6)
      expect(calculateTotalExpectedComparisons(5)).toBe(10)
      expect(calculateTotalExpectedComparisons(6)).toBe(15)
    })
  })

  // --------------------------------------------------
  // 6. Elementos definitivamente posicionados
  // --------------------------------------------------
  describe("6. Elementos definitivamente posicionados (sortedBoundary & getSortedIndices)", () => {
    it("deve consolidar estritamente com base na conclusão formal da passada e não por heurística", () => {
      let state = createBubbleSortState([5, 2, 4, 1])

      // Antes do fim da passada 0: nenhum índice consolidado
      expect(getSortedIndices(state)).toEqual([])
      expect(isIndexPermanentlySorted(state, 3)).toBe(false)

      state = executeBubbleSortStep(state) // comp 1
      expect(getSortedIndices(state)).toEqual([])
      state = executeBubbleSortStep(state) // comp 2
      expect(getSortedIndices(state)).toEqual([])

      // Fim da passada 0: índice 3 consolidado
      state = executeBubbleSortStep(state) // comp 3
      expect(state.sortedBoundary).toBe(3)
      expect(getSortedIndices(state)).toEqual([3])
      expect(isIndexPermanentlySorted(state, 3)).toBe(true)
      expect(isIndexPermanentlySorted(state, 2)).toBe(false)

      // Durante passada 1
      state = executeBubbleSortStep(state) // comp 4
      expect(getSortedIndices(state)).toEqual([3])

      // Fim da passada 1: índices 2 e 3 consolidados
      state = executeBubbleSortStep(state) // comp 5
      expect(state.sortedBoundary).toBe(2)
      expect(getSortedIndices(state)).toEqual([2, 3])
      expect(isIndexPermanentlySorted(state, 2)).toBe(true)
      expect(isIndexPermanentlySorted(state, 3)).toBe(true)
      expect(isIndexPermanentlySorted(state, 1)).toBe(false)

      // Fim da passada 2: todos consolidados (0, 1, 2, 3)
      state = executeBubbleSortStep(state) // comp 6
      expect(state.sortedBoundary).toBe(0)
      expect(getSortedIndices(state)).toEqual([0, 1, 2, 3])
      expect(isIndexPermanentlySorted(state, 0)).toBe(true)
      expect(isIndexPermanentlySorted(state, 1)).toBe(true)
    })
  })

  // --------------------------------------------------
  // 7. Histórico
  // --------------------------------------------------
  describe("7. Histórico (history e StepRecord)", () => {
    it("deve registrar o histórico completo de 6 passos para [5, 2, 4, 1] com dados suficientes para replay", () => {
      let state = createBubbleSortState([5, 2, 4, 1])
      for (let k = 0; k < 6; k++) {
        state = executeBubbleSortStep(state)
      }

      expect(state.history.length).toBe(6)

      // 1º Registro: Passo 1 (troca 5 > 2)
      const first = state.history[0]
      expect(first.stepNumber).toBe(1)
      expect(first.passIndex).toBe(0)
      expect(first.comparisonIndex).toBe(0)
      expect(first.indices).toEqual([0, 1])
      expect(first.leftValue).toBe(5)
      expect(first.rightValue).toBe(2)
      expect(first.swapped).toBe(true)
      expect(first.valuesBefore).toEqual([5, 2, 4, 1])
      expect(first.valuesAfter).toEqual([2, 5, 4, 1])
      expect(first.explanation).toBeTruthy()

      // Registro onde NÃO ocorreu troca: Passo 4 (2 <= 4)
      const nonSwap = state.history[3]
      expect(nonSwap.stepNumber).toBe(4)
      expect(nonSwap.passIndex).toBe(1)
      expect(nonSwap.comparisonIndex).toBe(0)
      expect(nonSwap.indices).toEqual([0, 1])
      expect(nonSwap.leftValue).toBe(2)
      expect(nonSwap.rightValue).toBe(4)
      expect(nonSwap.swapped).toBe(false)
      expect(nonSwap.valuesBefore).toEqual([2, 4, 1, 5])
      expect(nonSwap.valuesAfter).toEqual([2, 4, 1, 5])

      // Último Registro: Passo 6 (troca 2 > 1)
      const last = state.history[5]
      expect(last.stepNumber).toBe(6)
      expect(last.passIndex).toBe(2)
      expect(last.comparisonIndex).toBe(0)
      expect(last.indices).toEqual([0, 1])
      expect(last.leftValue).toBe(2)
      expect(last.rightValue).toBe(1)
      expect(last.swapped).toBe(true)
      expect(last.valuesBefore).toEqual([2, 1, 4, 5])
      expect(last.valuesAfter).toEqual([1, 2, 4, 5])
    })
  })

  // --------------------------------------------------
  // 8. Imutabilidade
  // --------------------------------------------------
  describe("8. Imutabilidade", () => {
    it("não deve modificar o estado anterior ao executar um passo algorítmico", () => {
      const state1 = createBubbleSortState([5, 2, 4, 1])
      const state2 = executeBubbleSortStep(state1)

      expect(state1.currentValues).toEqual([5, 2, 4, 1])
      expect(state1.comparisons).toBe(0)
      expect(state1.swaps).toBe(0)
      expect(state1.passIndex).toBe(0)
      expect(state1.comparisonIndex).toBe(0)
      expect(state1.history).toEqual([])

      expect(state2.currentValues).toEqual([2, 5, 4, 1])
      expect(state2.comparisons).toBe(1)
      expect(state2.swaps).toBe(1)
      expect(state2.history.length).toBe(1)
    })

    it("não deve permitir mutação em arrays internos congelados", () => {
      const state = createBubbleSortState([5, 2, 4, 1])
      expect(() => {
        // @ts-expect-error teste de mutação intencional
        state.currentValues[0] = 99
      }).toThrow()
    })
  })

  // --------------------------------------------------
  // 9. Vetor vazio
  // --------------------------------------------------
  describe("9. Vetor vazio ([])", () => {
    it("deve inicializar como completed com métricas zeradas sem erros", () => {
      const state = createBubbleSortState([])

      expect(state.completed).toBe(true)
      expect(state.status).toBe("COMPLETED")
      expect(state.arrayLength).toBe(0)
      expect(state.comparisons).toBe(0)
      expect(state.swaps).toBe(0)
      expect(getExpectedComparison(state)).toBeNull()
      expect(getSortedIndices(state)).toEqual([])
      expect(isBubbleSortComplete(state)).toBe(true)

      // Passo sobre vetor vazio deve ser no-op seguro
      const next = executeBubbleSortStep(state)
      expect(next).toBe(state)
    })
  })

  // --------------------------------------------------
  // 10. Vetor unitário
  // --------------------------------------------------
  describe("10. Vetor unitário ([42])", () => {
    it("deve inicializar como completed com o único elemento consolidado", () => {
      const state = createBubbleSortState([42])

      expect(state.completed).toBe(true)
      expect(state.status).toBe("COMPLETED")
      expect(state.arrayLength).toBe(1)
      expect(state.comparisons).toBe(0)
      expect(state.swaps).toBe(0)
      expect(state.sortedBoundary).toBe(0)
      expect(getExpectedComparison(state)).toBeNull()
      expect(getSortedIndices(state)).toEqual([0])
      expect(isIndexPermanentlySorted(state, 0)).toBe(true)

      const next = executeBubbleSortStep(state)
      expect(next).toBe(state)
    })
  })

  // --------------------------------------------------
  // 11. Vetor já ordenado
  // --------------------------------------------------
  describe("11. Vetor já ordenado ([1, 2, 3])", () => {
    it("deve executar todas as passadas canônicas (3 comparações e 0 swaps) honrando a decisão sem early exit", () => {
      let state = createBubbleSortState([1, 2, 3])

      // N = 3 requer (3-1) + (3-2) = 2 + 1 = 3 comparações
      while (!state.completed) {
        state = executeBubbleSortStep(state)
      }

      expect(state.comparisons).toBe(3)
      expect(state.swaps).toBe(0)
      expect(state.currentValues).toEqual([1, 2, 3])
      expect(state.completed).toBe(true)
    })
  })

  // --------------------------------------------------
  // 12. Duplicados
  // --------------------------------------------------
  describe("12. Duplicados ([3, 1, 3, 2])", () => {
    it("deve ordenar corretamente e preservar estabilidade (sem troca para valores iguais)", () => {
      let state = createBubbleSortState([3, 1, 3, 2])

      while (!state.completed) {
        state = executeBubbleSortStep(state)
      }

      expect(state.currentValues).toEqual([1, 2, 3, 3])
      expect(state.completed).toBe(true)

      // Verificar que nenhum passo com valores iguais realizou swap
      const equalComparisons = state.history.filter(
        (h) => h.leftValue === h.rightValue,
      )
      expect(equalComparisons.length).toBeGreaterThan(0)
      for (const record of equalComparisons) {
        expect(record.swapped).toBe(false)
      }
    })
  })

  // --------------------------------------------------
  // 13. Valores negativos
  // --------------------------------------------------
  describe("13. Valores negativos ([-5, 2, -10, 0])", () => {
    it("deve ordenar corretamente vetores com elementos negativos", () => {
      let state = createBubbleSortState([-5, 2, -10, 0])

      while (!state.completed) {
        state = executeBubbleSortStep(state)
      }

      expect(state.currentValues).toEqual([-10, -5, 0, 2])
      expect(state.completed).toBe(true)
    })
  })

  // --------------------------------------------------
  // 14. Determinismo
  // --------------------------------------------------
  describe("14. Determinismo", () => {
    it("duas execuções independentes de [5, 2, 4, 1] devem produzir sequências idênticas", () => {
      let stateA = createBubbleSortState([5, 2, 4, 1])
      let stateB = createBubbleSortState([5, 2, 4, 1])

      while (!stateA.completed) {
        stateA = executeBubbleSortStep(stateA)
      }
      while (!stateB.completed) {
        stateB = executeBubbleSortStep(stateB)
      }

      expect(stateA.currentValues).toEqual(stateB.currentValues)
      expect(stateA.comparisons).toBe(stateB.comparisons)
      expect(stateA.swaps).toBe(stateB.swaps)
      expect(stateA.history.length).toBe(stateB.history.length)
      expect(stateA.history).toEqual(stateB.history)
    })
  })

  // --------------------------------------------------
  // 15. Conclusão
  // --------------------------------------------------
  describe("15. Conclusão e No-Op Seguro", () => {
    it("quando completed = true, getExpectedComparison deve retornar null", () => {
      let state = createBubbleSortState([3, 1])
      state = executeBubbleSortStep(state)
      expect(state.completed).toBe(true)
      expect(getExpectedComparison(state)).toBeNull()
    })

    it("chamar executeBubbleSortStep em estado concluído deve ser um no-op seguro", () => {
      let state = createBubbleSortState([3, 1])
      state = executeBubbleSortStep(state)
      expect(state.completed).toBe(true)

      const next = executeBubbleSortStep(state)
      expect(next).toBe(state)
      expect(next.comparisons).toBe(1)
      expect(next.swaps).toBe(1)
    })

    it("chamar executeUserStep em estado concluído não deve corromper os dados", () => {
      let state = createBubbleSortState([3, 1])
      state = executeBubbleSortStep(state)

      const result = executeUserStep(state, "KEEP")
      expect(result.valid).toBe(false)
      expect(result.state.comparisons).toBe(1)
      expect(result.state.swaps).toBe(1)
      expect(result.state.currentValues).toEqual([1, 3])
    })
  })

  // --------------------------------------------------
  // 16. Progresso Algorítmico Real
  // --------------------------------------------------
  describe("16. Progresso Algorítmico Real (calculateBubbleSortProgress)", () => {
    it("deve retornar 100% para vetores vazios e unitários", () => {
      expect(calculateBubbleSortProgress(createBubbleSortState([]))).toBe(100)
      expect(calculateBubbleSortProgress(createBubbleSortState([42]))).toBe(100)
    })

    it("deve calcular progressão precisa para vetor de 4 elementos (total 6 passos)", () => {
      let state = createBubbleSortState([5, 2, 4, 1])
      expect(calculateBubbleSortProgress(state)).toBe(0) // 0/6 = 0%

      state = executeBubbleSortStep(state)
      expect(calculateBubbleSortProgress(state)).toBe(17) // 1/6 = 16.67% -> 17%

      state = executeBubbleSortStep(state)
      expect(calculateBubbleSortProgress(state)).toBe(33) // 2/6 = 33.33% -> 33%

      state = executeBubbleSortStep(state)
      expect(calculateBubbleSortProgress(state)).toBe(50) // 3/6 = 50%

      state = executeBubbleSortStep(state)
      expect(calculateBubbleSortProgress(state)).toBe(67) // 4/6 = 66.67% -> 67%

      state = executeBubbleSortStep(state)
      expect(calculateBubbleSortProgress(state)).toBe(83) // 5/6 = 83.33% -> 83%

      state = executeBubbleSortStep(state)
      expect(calculateBubbleSortProgress(state)).toBe(100) // 6/6 = 100%
      expect(state.completed).toBe(true)
    })
  })

  // --------------------------------------------------
  // 17. Simulação Completa do Fluxo GameScreen P0.3
  // --------------------------------------------------
  describe("17. Simulação Completa do Fluxo GameScreen P0.3 ([5, 2, 4, 1])", () => {
    it("deve simular a jornada interativa com tentativas erradas e acertos até ordenação final", () => {
      let state = createBubbleSortState([5, 2, 4, 1])

      // Passo 1: [5, 2] -> decisão errada: KEEP
      let stepResult = executeUserStep(state, "KEEP")
      expect(stepResult.valid).toBe(false)
      expect(stepResult.state.errors).toBe(1)
      expect(stepResult.state.comparisons).toBe(0)
      expect(stepResult.state.swaps).toBe(0)
      expect(stepResult.state.currentValues).toEqual([5, 2, 4, 1])
      state = stepResult.state // atualiza estado com penalidade

      // Passo 1: [5, 2] -> decisão correta: SWAP
      stepResult = executeUserStep(state, "SWAP")
      expect(stepResult.valid).toBe(true)
      state = stepResult.state
      expect(state.currentValues).toEqual([2, 5, 4, 1])
      expect(state.comparisons).toBe(1)
      expect(state.swaps).toBe(1)

      // Passo 2: [5, 4] -> decisão correta: SWAP
      stepResult = executeUserStep(state, "SWAP")
      expect(stepResult.valid).toBe(true)
      state = stepResult.state
      expect(state.currentValues).toEqual([2, 4, 5, 1])
      expect(state.comparisons).toBe(2)
      expect(state.swaps).toBe(2)

      // Passo 3: [5, 1] -> decisão correta: SWAP -> fim da passada 0
      stepResult = executeUserStep(state, "SWAP")
      expect(stepResult.valid).toBe(true)
      state = stepResult.state
      expect(state.currentValues).toEqual([2, 4, 1, 5])
      expect(state.comparisons).toBe(3)
      expect(state.swaps).toBe(3)
      expect(state.passIndex).toBe(1)
      expect(getSortedIndices(state)).toEqual([3]) // 5 consolidado

      // Passo 4: [2, 4] -> decisão errada: SWAP
      stepResult = executeUserStep(state, "SWAP")
      expect(stepResult.valid).toBe(false)
      expect(stepResult.state.errors).toBe(2)
      state = stepResult.state

      // Passo 4: [2, 4] -> decisão correta: KEEP
      stepResult = executeUserStep(state, "KEEP")
      expect(stepResult.valid).toBe(true)
      state = stepResult.state
      expect(state.currentValues).toEqual([2, 4, 1, 5])
      expect(state.comparisons).toBe(4)
      expect(state.swaps).toBe(3)

      // Passo 5: [4, 1] -> decisão correta: SWAP -> fim da passada 1
      stepResult = executeUserStep(state, "SWAP")
      expect(stepResult.valid).toBe(true)
      state = stepResult.state
      expect(state.currentValues).toEqual([2, 1, 4, 5])
      expect(state.comparisons).toBe(5)
      expect(state.swaps).toBe(4)
      expect(state.passIndex).toBe(2)
      expect(getSortedIndices(state)).toEqual([2, 3]) // 4 e 5 consolidados

      // Passo 6: [2, 1] -> decisão correta: SWAP -> fim da passada 2 e conclusão
      stepResult = executeUserStep(state, "SWAP")
      expect(stepResult.valid).toBe(true)
      state = stepResult.state
      expect(state.currentValues).toEqual([1, 2, 4, 5])
      expect(state.comparisons).toBe(6)
      expect(state.swaps).toBe(5)
      expect(state.errors).toBe(2)
      expect(state.completed).toBe(true)
      expect(isBubbleSortComplete(state)).toBe(true)
      expect(getSortedIndices(state)).toEqual([0, 1, 2, 3])
      expect(calculateBubbleSortProgress(state)).toBe(100)
    })
  })
})
