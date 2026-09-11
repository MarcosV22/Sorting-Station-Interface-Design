/**
 * Tipos e contratos canônicos da infraestrutura global de geração procedural de vetores.
 * Módulo puro, agnóstico a qualquer algoritmo ou interface gráfica.
 */

export type SeedInput = number | string;

export type ArrayConstraint = (array: readonly number[]) => boolean;

export interface ArrayConstraintDefinition {
  readonly id: string;
  readonly description: string;
  readonly predicate: ArrayConstraint;
}

export type ConstraintResolvable = ArrayConstraint | ArrayConstraintDefinition;

export interface ArrayGenerationConfig {
  readonly length: number;
  readonly minValue?: number; // default: 1
  readonly maxValue?: number; // default: 99
  readonly allowDuplicates?: boolean; // default: false
  readonly seed?: SeedInput; // opcional; se ausente, gerada com entropia externa
  readonly constraints?: readonly ConstraintResolvable[];
  readonly maxAttempts?: number; // default: 50
}

export interface ResolvedGenerationConfig {
  readonly length: number;
  readonly minValue: number;
  readonly maxValue: number;
  readonly allowDuplicates: boolean;
  readonly seed: SeedInput;
  readonly normalizedSeed: number;
  readonly maxAttempts: number;
  readonly constraintsCount: number;
}

export interface GeneratedArrayResult {
  readonly values: readonly number[];
  readonly seed: SeedInput;
  readonly normalizedSeed: number;
  readonly attempts: number;
  readonly isFallback: boolean;
  readonly config: ResolvedGenerationConfig;
}

export class ArrayGenerationError extends Error {
  public readonly details?: {
    length?: number;
    minValue?: number;
    maxValue?: number;
    allowDuplicates?: boolean;
    attempts?: number;
    violatedConstraints?: string[];
    cause?: unknown;
  };

  constructor(
    message: string,
    details?: {
      length?: number;
      minValue?: number;
      maxValue?: number;
      allowDuplicates?: boolean;
      attempts?: number;
      violatedConstraints?: string[];
      cause?: unknown;
    }
  ) {
    super(message);
    this.name = "ArrayGenerationError";
    this.details = details;
    Object.setPrototypeOf(this, ArrayGenerationError.prototype);
  }
}
