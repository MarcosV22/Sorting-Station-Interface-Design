import { describe, it, expect } from "vitest"
import {
  TUTORIAL_INITIAL_ARRAY,
  getTutorialStepInfo,
} from "./tutorialGuide"
import {
  createBubbleSortState,
  executeUserStep,
  getExpectedComparison,
  isIndexPermanentlySorted,
} from "../sorting/bubbleSortEngine"

describe("tutorialGuide pedagógico", () => {
  it("inicia com o vetor pedagógico [3, 1, 2] na Etapa 1", () => {
    expect(TUTORIAL_INITIAL_ARRAY).toEqual([3, 1, 2])
    const state = createBubbleSortState(TUTORIAL_INITIAL_ARRAY)

    const stepInfo = getTutorialStepInfo(state)
    expect(stepInfo.stepNumber).toBe(1)
    expect(stepInfo.title).toContain("ETAPA 1/3")
    expect(stepInfo.prompt).toContain("3 e 1")

    const expected = getExpectedComparison(state)
    expect(expected).not.toBeNull()
    expect(expected?.leftValue).toBe(3)
    expect(expected?.rightValue).toBe(1)
    expect(expected?.shouldSwap).toBe(true)
  })

  it("permanece na Etapa 1 se o usuário escolher MANTER incorretamente", () => {
    const state = createBubbleSortState(TUTORIAL_INITIAL_ARRAY)
    const result = executeUserStep(state, "KEEP")

    expect(result.valid).toBe(false)
    expect(result.state.currentValues).toEqual([3, 1, 2])

    const stepInfo = getTutorialStepInfo(result.state)
    expect(stepInfo.stepNumber).toBe(1)
  })

  it("avança para a Etapa 2 após TROCAR o primeiro par (3 e 1)", () => {
    const state = createBubbleSortState(TUTORIAL_INITIAL_ARRAY)
    const result = executeUserStep(state, "SWAP")

    expect(result.valid).toBe(true)
    expect(result.state.currentValues).toEqual([1, 3, 2])

    const stepInfo = getTutorialStepInfo(result.state)
    expect(stepInfo.stepNumber).toBe(2)
    expect(stepInfo.title).toContain("ETAPA 2/3")
    expect(stepInfo.prompt).toContain("3 e 2")

    const expected = getExpectedComparison(result.state)
    expect(expected?.leftValue).toBe(3)
    expect(expected?.rightValue).toBe(2)
    expect(expected?.shouldSwap).toBe(true)
  })

  it("avança para a Etapa 3 após TROCAR o segundo par (3 e 2), concluindo a Passada 1", () => {
    let state = createBubbleSortState(TUTORIAL_INITIAL_ARRAY)
    state = executeUserStep(state, "SWAP").state // [1, 3, 2]
    state = executeUserStep(state, "SWAP").state // [1, 2, 3]

    expect(state.currentValues).toEqual([1, 2, 3])
    expect(isIndexPermanentlySorted(state, 2)).toBe(true) // 3 está consolidado
    expect(state.passIndex).toBe(1)
    expect(state.comparisonIndex).toBe(0)

    const stepInfo = getTutorialStepInfo(state)
    expect(stepInfo.stepNumber).toBe(3)
    expect(stepInfo.title).toContain("ETAPA 3/3")
    expect(stepInfo.passNotice).toBeDefined()
    expect(stepInfo.passNotice?.title).toBe("PASSADA 1 CONCLUÍDA")
    expect(stepInfo.passNotice?.description).toContain("varredura da esquerda para a direita")

    const expected = getExpectedComparison(state)
    expect(expected?.leftValue).toBe(1)
    expect(expected?.rightValue).toBe(2)
    expect(expected?.shouldSwap).toBe(false)
  })

  it("conclui o tutorial na Etapa 4 após MANTER o terceiro par (1 e 2)", () => {
    let state = createBubbleSortState(TUTORIAL_INITIAL_ARRAY)
    state = executeUserStep(state, "SWAP").state // [1, 3, 2]
    state = executeUserStep(state, "SWAP").state // [1, 2, 3]
    const finalResult = executeUserStep(state, "KEEP")

    expect(finalResult.valid).toBe(true)
    expect(finalResult.state.completed).toBe(true)
    expect(finalResult.state.currentValues).toEqual([1, 2, 3])

    const stepInfo = getTutorialStepInfo(finalResult.state)
    expect(stepInfo.stepNumber).toBe(4)
    expect(stepInfo.title).toBe("TREINAMENTO BÁSICO CONCLUÍDO")
  })
})
