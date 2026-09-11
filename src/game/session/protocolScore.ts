/**
 * Módulo puro de cálculo da Pontuação do Protocolo e formatação de tempo descritivo.
 *
 * Desacoplado de React, DOM e UI.
 *
 * REGRA PEDAGÓGICA MANDATÓRIA:
 * A pontuação é uma mecânica lúdica e transparente da sessão para feedback imediato de
 * conformidade com as regras da esteira. Ela NÃO é uma medida validada de aprendizagem
 * nem avaliação cognitiva formal.
 */

export interface ProtocolScoreInput {
  readonly errors: number;
  readonly hintsUsed: number;
}

/**
 * Calcula a Pontuação do Protocolo em escala 0 a 100.
 *
 * Fórmula canônica:
 *   score = max(0, 100 - (errors * 10) - (hintsUsed * 5))
 *
 * Regras:
 * - 0 erros e 0 dicas = 100 pontos;
 * - Cada decisão incorreta (error) desconta 10 pontos;
 * - Cada dica utilizada (hintUsed) desconta 5 pontos;
 * - Comparações, trocas e tempo decorrido NÃO afetam a pontuação;
 * - O valor nunca fica abaixo de 0;
 * - Determinístico e sem variáveis ocultas.
 */
export function calculateProtocolScore(input: ProtocolScoreInput): number {
  const errors = Math.max(0, Math.floor(input.errors || 0));
  const hintsUsed = Math.max(0, Math.floor(input.hintsUsed || 0));

  const rawScore = 100 - errors * 10 - hintsUsed * 5;
  return Math.max(0, Math.min(100, rawScore));
}

/**
 * Formata um intervalo de tempo em milissegundos para exibição legível não punitiva.
 *
 * Exemplos:
 * - Menos de 60 segundos: "42s", "5s", "0s"
 * - 60 segundos ou mais: "01:18", "02:05", "10:30"
 */
export function formatElapsedTime(elapsedTimeMs: number): string {
  if (!Number.isFinite(elapsedTimeMs) || elapsedTimeMs <= 0) {
    return "0s";
  }

  const totalSeconds = Math.floor(elapsedTimeMs / 1000);

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(remainingSeconds).padStart(2, "0");

  return `${mm}:${ss}`;
}
