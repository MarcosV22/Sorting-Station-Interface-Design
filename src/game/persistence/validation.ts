import { CURRENT_SCHEMA_VERSION, DEFAULT_MAX_PHASES } from "./constants";
import {
  type GameSaveSchema,
  type PhaseRecord,
  createDefaultSaveData,
} from "./types";

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseClampedInt(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  const integer = Math.floor(value);
  return Math.min(Math.max(integer, min), max);
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function parseIsoTimestamp(value: unknown): string {
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return value;
    }
  }
  return new Date().toISOString();
}

function sanitizePhaseRecords(
  rawRecords: unknown,
  maxPhases: number
): Record<number, PhaseRecord> {
  if (!isRecordObject(rawRecords)) {
    return Object.freeze({});
  }

  const sanitized: Record<number, PhaseRecord> = {};
  for (const [key, val] of Object.entries(rawRecords)) {
    const phaseIndex = Number(key);
    if (!Number.isInteger(phaseIndex) || phaseIndex < 1 || phaseIndex > maxPhases) {
      continue;
    }

    if (isRecordObject(val)) {
      const baseRecord = {
        completed: parseBoolean(val.completed, false),
        completedAt: parseIsoTimestamp(val.completedAt),
      };

      // No schema v2, sanitizamos os campos opcionais de melhor pontuação da fase
      const hasValidBestScore = typeof val.bestScore === "number" && Number.isFinite(val.bestScore);
      if (hasValidBestScore) {
        const clampedScore = Math.min(Math.max(Math.floor(val.bestScore as number), 0), 100);
        const bestScoreErrors =
          typeof val.bestScoreErrors === "number" && Number.isFinite(val.bestScoreErrors)
            ? Math.max(0, Math.floor(val.bestScoreErrors))
            : 0;
        const bestScoreHintsUsed =
          typeof val.bestScoreHintsUsed === "number" && Number.isFinite(val.bestScoreHintsUsed)
            ? Math.max(0, Math.floor(val.bestScoreHintsUsed))
            : 0;
        const bestScoreElapsedTimeMs =
          typeof val.bestScoreElapsedTimeMs === "number" && Number.isFinite(val.bestScoreElapsedTimeMs)
            ? Math.max(0, Math.floor(val.bestScoreElapsedTimeMs))
            : undefined;

        sanitized[phaseIndex] = Object.freeze({
          ...baseRecord,
          bestScore: clampedScore,
          bestScoreErrors,
          bestScoreHintsUsed,
          ...(bestScoreElapsedTimeMs !== undefined ? { bestScoreElapsedTimeMs } : {}),
        });
      } else {
        sanitized[phaseIndex] = Object.freeze(baseRecord);
      }
    }
  }

  return Object.freeze(sanitized);
}

/**
 * Validação defensiva pura e sem suposições cegas de tipo para dados deserializados.
 * Descarte seguro de schemas desconhecidos, dados corrompidos ou tipos incompatíveis.
 * Realiza migração explícita v1 -> v2 preservando integralmente o progresso existente.
 */
export function validateAndMigrateSaveData(
  raw: unknown,
  maxPhases: number = DEFAULT_MAX_PHASES
): GameSaveSchema {
  if (!isRecordObject(raw)) {
    return createDefaultSaveData(maxPhases);
  }

  // Validação estrita do controle de versão do schema
  const version = typeof raw.schemaVersion === "number" ? raw.schemaVersion : null;
  if (version === null || version < 1) {
    return createDefaultSaveData(maxPhases);
  }

  // Se for uma versão futura desconhecida pela versão atual do código:
  if (version > CURRENT_SCHEMA_VERSION) {
    console.warn(
      `[Persistence] Schema v${version} superior ao suportado (v${CURRENT_SCHEMA_VERSION}); redefinindo padrão.`
    );
    return createDefaultSaveData(maxPhases);
  }

  // Migração explícita v1 -> v2:
  // Se o save for v1, todos os dados existentes (campanha, preferências, registros de conclusão)
  // são rigorosamente preservados. Apenas a versão do schema é promovida para v2,
  // permitindo gravação futura de recordes sem perda de progresso.
  const isV1Migration = version === 1;
  if (isV1Migration) {
    // Migração transparente de v1 para v2
  }

  // 1. Validação do bloco de campanha (preservado integralmente de v1)
  const rawCampaign = isRecordObject(raw.campaign) ? raw.campaign : {};
  const unlockedPhases = parseClampedInt(rawCampaign.unlockedPhases, 1, maxPhases, 1);
  const highestPhaseReached = parseClampedInt(
    rawCampaign.highestPhaseReached,
    1,
    maxPhases,
    unlockedPhases
  );
  const hasCompletedTutorial = parseBoolean(
    rawCampaign.hasCompletedTutorial,
    unlockedPhases > 1
  );

  // 2. Validação do bloco de recordes factuais (preservado integralmente de v1, com suporte a v2)
  const records = sanitizePhaseRecords(raw.records, maxPhases);

  // 3. Validação do bloco de preferências do operador
  const rawPreferences = isRecordObject(raw.preferences) ? raw.preferences : {};
  const preferences = Object.freeze({
    soundEnabled: parseBoolean(rawPreferences.soundEnabled, true),
    reducedMotion: parseBoolean(rawPreferences.reducedMotion, false),
    highContrast: parseBoolean(rawPreferences.highContrast, false),
  });

  // 4. Timestamp
  const lastUpdated = parseIsoTimestamp(raw.lastUpdated);

  return Object.freeze({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastUpdated,
    campaign: Object.freeze({
      unlockedPhases,
      highestPhaseReached,
      hasCompletedTutorial,
    }),
    records,
    preferences,
  });
}
