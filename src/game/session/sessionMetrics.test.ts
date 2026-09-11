import { describe, it, expect } from "vitest";
import {
  createPhaseSessionMetrics,
  recordHintUsed,
  PhaseSessionMetrics,
} from "./sessionMetrics";

describe("Phase Session Metrics", () => {
  it("initializes with hintsUsed = 0", () => {
    const metrics = createPhaseSessionMetrics();
    expect(metrics.hintsUsed).toBe(0);
  });

  it("increments hintsUsed by 1 on single call", () => {
    const initial = createPhaseSessionMetrics();
    const updated = recordHintUsed(initial);
    expect(updated.hintsUsed).toBe(1);
  });

  it("increments hintsUsed to 2 on successive calls", () => {
    const initial = createPhaseSessionMetrics();
    const step1 = recordHintUsed(initial);
    const step2 = recordHintUsed(step1);
    expect(step2.hintsUsed).toBe(2);
  });

  it("preserves immutability without mutating original state", () => {
    const initial = createPhaseSessionMetrics();
    const updated = recordHintUsed(initial);
    expect(initial.hintsUsed).toBe(0);
    expect(updated.hintsUsed).toBe(1);
    expect(Object.isFrozen(initial)).toBe(true);
    expect(Object.isFrozen(updated)).toBe(true);
  });

  it("resets hintsUsed back to 0 when re-creating metrics", () => {
    let metrics: PhaseSessionMetrics = createPhaseSessionMetrics();
    metrics = recordHintUsed(metrics);
    metrics = recordHintUsed(metrics);
    expect(metrics.hintsUsed).toBe(2);

    // Reset de fase
    metrics = createPhaseSessionMetrics();
    expect(metrics.hintsUsed).toBe(0);
  });
});
