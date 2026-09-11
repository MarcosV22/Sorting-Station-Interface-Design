/**
 * Gerador de Números Pseudoaleatórios (PRNG) determinístico e utilitários de seed.
 *
 * Utiliza o algoritmo Mulberry32 com hash determinístico FNV-1a para sementes.
 * - Rápido, determinístico e com excelente dispersão estatística de 32 bits;
 * - Zero dependências externas;
 * - Suporta sementes numéricas e textuais de qualquer tamanho.
 */

import type { SeedInput } from "./types";

/**
 * Converte qualquer seed de entrada (número ou texto) em um inteiro unsigned de 32 bits determinístico.
 *
 * - Inteiros não-negativos de 32 bits utilizam unsigned bitwise shift (>>> 0).
 * - Outros números (decimais, negativos) ou strings utilizam o algoritmo de dispersão FNV-1a de 32 bits.
 */
export function hashSeed(seed: SeedInput): number {
  if (typeof seed === "number") {
    if (Number.isFinite(seed) && Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff) {
      return seed >>> 0;
    }
    seed = String(seed);
  }

  const str = String(seed);
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Cria uma instância determinística do PRNG Mulberry32 a partir de uma semente de 32 bits.
 * Retorna uma função `() => number` que produz números no intervalo semi-aberto [0, 1).
 */
export function createMulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function nextFloat(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Produz um inteiro pseudoaleatório no intervalo fechado [min, max] (inclusivo).
 */
export function nextInt(prng: () => number, min: number, max: number): number {
  if (min > max) {
    throw new Error(`min (${min}) não pode ser maior que max (${max})`);
  }
  const f = prng();
  return Math.floor(f * (max - min + 1)) + min;
}

/**
 * Gera uma nova semente usando entropia do ambiente (timestamp e Math.random).
 * A entropia é utilizada unicamente para instanciar a semente textual;
 * a partir do momento em que a semente é fixada, toda a geração subsequente é determinística.
 */
export function generateRandomSeed(): string {
  const timePart = Date.now().toString(36);
  const randPart = Math.floor(Math.random() * 0xffffffff).toString(36);
  return `sort-${timePart}-${randPart}`;
}
