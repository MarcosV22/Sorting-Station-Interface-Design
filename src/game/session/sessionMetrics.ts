/**
 * Camada pura de métricas de sessão pedagógica do Sorting Station.
 *
 * Desacoplada da Sorting Engine (domínio algorítmico puro):
 * métricas como dicas utilizadas (hintsUsed) pertencem à interação do jogador
 * e ao scaffolding didático, não às regras matemáticas do algoritmo.
 */

export interface PhaseSessionMetrics {
  readonly hintsUsed: number;
}

/**
 * Cria o estado inicial de métricas de sessão de uma fase.
 */
export function createPhaseSessionMetrics(): PhaseSessionMetrics {
  return Object.freeze({
    hintsUsed: 0,
  });
}

/**
 * Registra o uso intencional de uma dica de forma imutável.
 */
export function recordHintUsed(metrics: PhaseSessionMetrics): PhaseSessionMetrics {
  return Object.freeze({
    ...metrics,
    hintsUsed: metrics.hintsUsed + 1,
  });
}
