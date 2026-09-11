import type { StorageAdapter } from "./types";

/**
 * Adaptador de armazenamento volátil em memória.
 * Ideal para testes unitários isolados e fallback em caso de indisponibilidade de localStorage.
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private readonly store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

/**
 * Cria uma nova instância de armazenamento puramente em memória.
 */
export function createMemoryStorageAdapter(
  initialState?: Record<string, string>
): MemoryStorageAdapter {
  const adapter = new MemoryStorageAdapter();
  if (initialState) {
    for (const [k, v] of Object.entries(initialState)) {
      adapter.setItem(k, v);
    }
  }
  return adapter;
}

/**
 * Detecta e valida o suporte real ao localStorage no ambiente do navegador.
 * Executa um teste canário de escrita/leitura para capturar SecurityError em iframes ou modo anônimo.
 */
export function getBrowserLocalStorage(): StorageAdapter | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  try {
    const canary = "__sorting_station_canary__";
    window.localStorage.setItem(canary, canary);
    const read = window.localStorage.getItem(canary);
    window.localStorage.removeItem(canary);
    if (read !== canary) {
      return null;
    }
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Envolve qualquer StorageAdapter com tratamento estrito de exceções e fallback em memória.
 * Garante que a aplicação nunca quebre se getItem ou setItem lançarem erros (QuotaExceededError, SecurityError).
 */
export function createSafeStorage(underlying?: StorageAdapter | null): StorageAdapter {
  const fallback = new MemoryStorageAdapter();
  const target = underlying !== undefined ? underlying : getBrowserLocalStorage();

  if (!target) {
    return fallback;
  }

  return {
    getItem(key: string): string | null {
      try {
        const item = target.getItem(key);
        // Se a chave não existia no target mas foi gravada no fallback de memória:
        if (item === null && fallback.getItem(key) !== null) {
          return fallback.getItem(key);
        }
        return item;
      } catch (err) {
        console.warn("[Persistence] Exceção ao ler storage; recorrendo à memória:", err);
        return fallback.getItem(key);
      }
    },
    setItem(key: string, value: string): void {
      try {
        target.setItem(key, value);
      } catch (err) {
        console.warn("[Persistence] Exceção ao gravar no storage; preservando na memória:", err);
        fallback.setItem(key, value);
      }
    },
    removeItem(key: string): void {
      try {
        if (typeof target.removeItem === "function") {
          target.removeItem(key);
        }
      } catch (err) {
        console.warn("[Persistence] Exceção ao remover chave do storage:", err);
      }
      fallback.removeItem(key);
    },
  };
}
