import { describe, it, expect } from "vitest";
import { calculateProtocolScore, formatElapsedTime } from "./protocolScore";

describe("Protocol Score (P1.7)", () => {
  it("deve retornar 100 pontos para 0 erros e 0 dicas", () => {
    const score = calculateProtocolScore({ errors: 0, hintsUsed: 0 });
    expect(score).toBe(100);
  });

  it("deve penalizar 10 pontos por erro quando não há dicas", () => {
    expect(calculateProtocolScore({ errors: 1, hintsUsed: 0 })).toBe(90);
    expect(calculateProtocolScore({ errors: 2, hintsUsed: 0 })).toBe(80);
    expect(calculateProtocolScore({ errors: 5, hintsUsed: 0 })).toBe(50);
    expect(calculateProtocolScore({ errors: 9, hintsUsed: 0 })).toBe(10);
    expect(calculateProtocolScore({ errors: 10, hintsUsed: 0 })).toBe(0);
  });

  it("deve penalizar 5 pontos por dica quando não há erros", () => {
    expect(calculateProtocolScore({ errors: 0, hintsUsed: 1 })).toBe(95);
    expect(calculateProtocolScore({ errors: 0, hintsUsed: 2 })).toBe(90);
    expect(calculateProtocolScore({ errors: 0, hintsUsed: 4 })).toBe(80);
    expect(calculateProtocolScore({ errors: 0, hintsUsed: 10 })).toBe(50);
    expect(calculateProtocolScore({ errors: 0, hintsUsed: 20 })).toBe(0);
  });

  it("deve calcular corretamente a combinação de erros e dicas", () => {
    // 1 erro (-10) e 2 dicas (-10) = 80
    expect(calculateProtocolScore({ errors: 1, hintsUsed: 2 })).toBe(80);
    // 2 erros (-20) e 3 dicas (-15) = 65
    expect(calculateProtocolScore({ errors: 2, hintsUsed: 3 })).toBe(65);
    // 3 erros (-30) e 1 dica (-5) = 65
    expect(calculateProtocolScore({ errors: 3, hintsUsed: 1 })).toBe(65);
  });

  it("Rodadas B (1 erro, 0 dicas) e C (0 erros, 2 dicas) devem ambas produzir pontuação 90", () => {
    const roundB = calculateProtocolScore({ errors: 1, hintsUsed: 0 });
    const roundC = calculateProtocolScore({ errors: 0, hintsUsed: 2 });

    expect(roundB).toBe(90);
    expect(roundC).toBe(90);
    expect(roundB).toBe(roundC);
  });

  it("deve clampar em 0 e nunca produzir pontuação negativa", () => {
    expect(calculateProtocolScore({ errors: 11, hintsUsed: 0 })).toBe(0);
    expect(calculateProtocolScore({ errors: 20, hintsUsed: 10 })).toBe(0);
    expect(calculateProtocolScore({ errors: 0, hintsUsed: 30 })).toBe(0);
  });

  it("deve clampar entradas negativas ou inválidas com segurança", () => {
    expect(calculateProtocolScore({ errors: -2, hintsUsed: -1 })).toBe(100);
    expect(calculateProtocolScore({ errors: 1.8, hintsUsed: 0 })).toBe(90);
    expect(calculateProtocolScore({ errors: NaN as unknown as number, hintsUsed: 0 })).toBe(100);
  });

  it("deve ser uma função pura e perfeitamente determinística", () => {
    const input = Object.freeze({ errors: 2, hintsUsed: 1 });
    const first = calculateProtocolScore(input);
    const second = calculateProtocolScore(input);
    expect(first).toBe(75);
    expect(first).toBe(second);
  });
});

describe("Format Elapsed Time (P1.7)", () => {
  it("deve formatar tempos abaixo de 60 segundos com sufixo 's'", () => {
    expect(formatElapsedTime(0)).toBe("0s");
    expect(formatElapsedTime(500)).toBe("0s");
    expect(formatElapsedTime(1000)).toBe("1s");
    expect(formatElapsedTime(42000)).toBe("42s");
    expect(formatElapsedTime(59999)).toBe("59s");
  });

  it("deve formatar tempos a partir de 60 segundos em mm:ss", () => {
    expect(formatElapsedTime(60000)).toBe("01:00");
    expect(formatElapsedTime(78000)).toBe("01:18");
    expect(formatElapsedTime(125000)).toBe("02:05");
    expect(formatElapsedTime(600000)).toBe("10:00");
  });

  it("deve tratar valores inválidos, negativos ou NaN graciosamente", () => {
    expect(formatElapsedTime(-100)).toBe("0s");
    expect(formatElapsedTime(NaN)).toBe("0s");
    expect(formatElapsedTime(Infinity)).toBe("0s");
  });
});
