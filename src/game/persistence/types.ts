import { CURRENT_SCHEMA_VERSION, DEFAULT_MAX_PHASES } from "./constants";

/**
 * Registro factual da conclusão de uma fase individual.
 * No schema v2, armazena opcionalmente os dados da execução de melhor pontuação.
 */
export interface PhaseRecord {
  readonly completed: boolean;
  readonly completedAt: string;
  readonly bestScore?: number;
  readonly bestScoreErrors?: number;
  readonly bestScoreHintsUsed?: number;
  readonly bestScoreElapsedTimeMs?: number;
}

/**
 * Dados de desempenho de uma rodada para avaliação de recorde.
 */
export interface PhaseScoreData {
  readonly score: number;
  readonly errors: number;
  readonly hintsUsed: number;
  readonly elapsedTimeMs?: number;
}

/**
 * Progresso persistente de longo prazo da campanha.
 */
export interface CampaignSaveData {
  readonly unlockedPhases: number;
  readonly highestPhaseReached: number;
  readonly hasCompletedTutorial: boolean;
}

/**
 * Preferências locais do operador da estação.
 */
export interface PreferencesSaveData {
  readonly soundEnabled: boolean;
  readonly reducedMotion: boolean;
  readonly highContrast: boolean;
}

/**
 * Schema canônico e versionado do salvamento local (v2).
 */
export interface GameSaveSchema {
  readonly schemaVersion: number;
  readonly lastUpdated: string;
  readonly campaign: CampaignSaveData;
  readonly records: Record<number, PhaseRecord>;
  readonly preferences: PreferencesSaveData;
}

/**
 * Contrato mínimo abstrato de armazenamento chave-valor.
 * Permite isolamento completo de localStorage e injeção de adaptadores de teste em memória.
 */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

/**
 * Resultado descritivo de uma tentativa de gravação em storage.
 */
export interface SaveOperationResult {
  readonly success: boolean;
  readonly fallbackUsed: boolean;
  readonly error?: string;
}

/**
 * Retorna o estado de salvamento padrão, imutável e válido para novas instalações.
 */
export function createDefaultSaveData(maxPhases: number = DEFAULT_MAX_PHASES): GameSaveSchema {
  return Object.freeze({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastUpdated: new Date().toISOString(),
    campaign: Object.freeze({
      unlockedPhases: Math.min(1, maxPhases),
      highestPhaseReached: Math.min(1, maxPhases),
      hasCompletedTutorial: false,
    }),
    records: Object.freeze({}),
    preferences: Object.freeze({
      soundEnabled: true,
      reducedMotion: false,
      highContrast: false,
    }),
  });
}
