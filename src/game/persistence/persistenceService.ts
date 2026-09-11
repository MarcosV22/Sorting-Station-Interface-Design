import { STORAGE_KEY, DEFAULT_MAX_PHASES } from "./constants";
import { createSafeStorage } from "./storageAdapter";
import type {
  GameSaveSchema,
  PhaseRecord,
  PhaseScoreData,
  SaveOperationResult,
  StorageAdapter,
} from "./types";
import { createDefaultSaveData } from "./types";
import { validateAndMigrateSaveData } from "./validation";

/**
 * Carrega e valida o progresso persistente a partir do storage.
 * Retorna estado padrão seguro e resiliente em caso de ausência, corrupção ou exceções.
 */
export function loadGameProgress(
  storage?: StorageAdapter,
  maxPhases: number = DEFAULT_MAX_PHASES
): GameSaveSchema {
  const safeStorage = storage ?? createSafeStorage();

  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
      return createDefaultSaveData(maxPhases);
    }

    const parsed: unknown = JSON.parse(raw);
    return validateAndMigrateSaveData(parsed, maxPhases);
  } catch (err) {
    console.warn(
      "[Persistence] Falha ao processar dados de save do storage:",
      err instanceof Error ? err.message : String(err)
    );
    return createDefaultSaveData(maxPhases);
  }
}

/**
 * Grava o progresso do jogador de forma segura e encapsulada.
 */
export function saveGameProgress(
  data: GameSaveSchema,
  storage?: StorageAdapter,
  maxPhases: number = DEFAULT_MAX_PHASES
): SaveOperationResult {
  const safeStorage = storage ?? createSafeStorage();

  try {
    const validated = validateAndMigrateSaveData(data, maxPhases);
    const serialized = JSON.stringify(validated);
    safeStorage.setItem(STORAGE_KEY, serialized);
    return { success: true, fallbackUsed: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[Persistence] Erro ao gravar dados de save:", message);
    return { success: false, fallbackUsed: true, error: message };
  }
}

/**
 * Atualiza o progresso persistente após a conclusão com sucesso de uma fase.
 * Garante que:
 * 1. O desbloqueio nunca ultrapasse maxPhases;
 * 2. O progresso nunca sofra regressão ao rejogar fases anteriores;
 * 3. O registro factual da fase concluída seja preservado com timestamp;
 * 4. Recordes de pontuação sejam atualizados sob a regra canônica (P1.7):
 *    - newScore > bestScore; OU
 *    - newScore === bestScore E newErrors < bestScoreErrors;
 *    - Tempo NUNCA desempata nem incentiva pressa;
 * 5. O salvamento em storage seja executado imediatamente.
 */
export function recordPhaseCompletion(
  current: GameSaveSchema,
  completedPhase: number,
  maxPhases: number = DEFAULT_MAX_PHASES,
  storage?: StorageAdapter,
  scoreData?: PhaseScoreData
): GameSaveSchema {
  // Próxima fase elegível para desbloqueio
  const nextTarget = completedPhase < maxPhases ? completedPhase + 1 : maxPhases;
  const nextUnlocked = Math.min(
    maxPhases,
    Math.max(current.campaign.unlockedPhases, nextTarget)
  );
  const nextHighest = Math.min(
    maxPhases,
    Math.max(current.campaign.highestPhaseReached, nextUnlocked)
  );

  const existing = current.records[completedPhase];
  let bestScore = existing?.bestScore;
  let bestScoreErrors = existing?.bestScoreErrors;
  let bestScoreHintsUsed = existing?.bestScoreHintsUsed;
  let bestScoreElapsedTimeMs = existing?.bestScoreElapsedTimeMs;

  if (scoreData) {
    const isFirstScore = bestScore === undefined;
    const isHigherScore = bestScore !== undefined && scoreData.score > bestScore;
    const isTieWithFewerErrors =
      bestScore !== undefined &&
      scoreData.score === bestScore &&
      scoreData.errors < (bestScoreErrors ?? Infinity);

    if (isFirstScore || isHigherScore || isTieWithFewerErrors) {
      bestScore = scoreData.score;
      bestScoreErrors = scoreData.errors;
      bestScoreHintsUsed = scoreData.hintsUsed;
      bestScoreElapsedTimeMs = scoreData.elapsedTimeMs;
    }
  }

  const updatedRecord: PhaseRecord = Object.freeze({
    completed: true,
    completedAt: new Date().toISOString(),
    ...(bestScore !== undefined ? { bestScore } : {}),
    ...(bestScoreErrors !== undefined ? { bestScoreErrors } : {}),
    ...(bestScoreHintsUsed !== undefined ? { bestScoreHintsUsed } : {}),
    ...(bestScoreElapsedTimeMs !== undefined ? { bestScoreElapsedTimeMs } : {}),
  });

  const updatedRecords = {
    ...current.records,
    [completedPhase]: updatedRecord,
  };

  const updatedState: GameSaveSchema = Object.freeze({
    ...current,
    lastUpdated: new Date().toISOString(),
    campaign: Object.freeze({
      unlockedPhases: nextUnlocked,
      highestPhaseReached: nextHighest,
      hasCompletedTutorial: true,
    }),
    records: Object.freeze(updatedRecords),
  });

  saveGameProgress(updatedState, storage, maxPhases);
  return updatedState;
}

/**
 * Registra a conclusão do tutorial, permitindo pular diretamente para a esteira no futuro.
 */
export function recordTutorialCompletion(
  current: GameSaveSchema,
  storage?: StorageAdapter,
  maxPhases: number = DEFAULT_MAX_PHASES
): GameSaveSchema {
  if (current.campaign.hasCompletedTutorial) {
    return current;
  }

  const updatedState: GameSaveSchema = Object.freeze({
    ...current,
    lastUpdated: new Date().toISOString(),
    campaign: Object.freeze({
      ...current.campaign,
      hasCompletedTutorial: true,
    }),
  });

  saveGameProgress(updatedState, storage, maxPhases);
  return updatedState;
}

/**
 * Remove os dados persistidos do storage e retorna o estado padrão.
 * Operação puramente de manutenção/testes.
 */
export function clearGameProgress(
  storage?: StorageAdapter,
  maxPhases: number = DEFAULT_MAX_PHASES
): GameSaveSchema {
  const safeStorage = storage ?? createSafeStorage();
  try {
    if (typeof safeStorage.removeItem === "function") {
      safeStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn("[Persistence] Falha ao limpar storage:", err);
  }
  return createDefaultSaveData(maxPhases);
}

/**
 * Determina se o Modo Desafio (Variante Bubble Sort Early Exit) está desbloqueado
 * com base estritamente no progresso factual já persistido da campanha principal.
 * Não altera nem cria nenhum dado adicional no storage.
 */
export function isChallengeModeUnlocked(
  saveData: GameSaveSchema,
  maxPhases: number = DEFAULT_MAX_PHASES
): boolean {
  return Boolean(saveData.records[maxPhases]?.completed);
}

/**
 * Determina a tela inicial e a fase ao clicar em 'INICIAR TURNO' na Home.
 *
 * Semântica estrita:
 * - highestPhaseReached e unlockedPhases representam PROGRESSO e DESBLOQUEIO da campanha histórica;
 * - A fase ativa da sessão representa a rodada atual de jogo e SEMPRE inicia em 1;
 * - Se o operador ainda não concluiu o tutorial (hasCompletedTutorial === false),
 *   ele é direcionado primeiro à tela de "tutorial";
 * - Se o tutorial já foi concluído (hasCompletedTutorial === true),
 *   ele é direcionado diretamente à esteira da Fase 1 ("game").
 */
export function getInitialSessionRoute(saveData: GameSaveSchema): {
  screen: "tutorial" | "game";
  phase: number;
} {
  return {
    screen: saveData.campaign.hasCompletedTutorial ? "game" : "tutorial",
    phase: 1,
  };
}

