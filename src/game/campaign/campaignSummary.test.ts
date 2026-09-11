import { describe, it, expect } from "vitest";
import { calculateCampaignSummary, PhaseResult } from "./campaignSummary";

describe("Campaign Summary Aggregation", () => {
  it("calculates summary correctly with empty results", () => {
    const summary = calculateCampaignSummary([], 3);
    expect(summary).toEqual({
      totalPhases: 3,
      completedPhases: 0,
      totalComparisons: 0,
      totalSwaps: 0,
      totalErrors: 0,
      totalHintsUsed: 0,
    });
  });

  it("calculates summary correctly with single phase", () => {
    const results: PhaseResult[] = [
      {
        phase: 1,
        comparisons: 6,
        swaps: 5,
        errors: 1,
        hintsUsed: 2,
        finalArray: [1, 2, 4, 5],
      },
    ];
    const summary = calculateCampaignSummary(results, 3);
    expect(summary).toEqual({
      totalPhases: 3,
      completedPhases: 1,
      totalComparisons: 6,
      totalSwaps: 5,
      totalErrors: 1,
      totalHintsUsed: 2,
    });
  });

  it("calculates summary correctly for all three phases of bubble sort campaign with errors and hints", () => {
    const results: PhaseResult[] = [
      {
        phase: 1,
        comparisons: 6,
        swaps: 5,
        errors: 1,
        hintsUsed: 2,
        finalArray: [1, 2, 4, 5],
      },
      {
        phase: 2,
        comparisons: 10,
        swaps: 6,
        errors: 0,
        hintsUsed: 1,
        finalArray: [2, 3, 5, 6, 8],
      },
      {
        phase: 3,
        comparisons: 15,
        swaps: 9,
        errors: 2,
        hintsUsed: 0,
        finalArray: [1, 3, 4, 6, 7, 9],
      },
    ];
    const summary = calculateCampaignSummary(results, 3);
    expect(summary).toEqual({
      totalPhases: 3,
      completedPhases: 3,
      totalComparisons: 31,
      totalSwaps: 20,
      totalErrors: 3,
      totalHintsUsed: 3,
    });
  });

  it("calculates summary correctly for an ideal flawless run", () => {
    const results: PhaseResult[] = [
      {
        phase: 1,
        comparisons: 6,
        swaps: 5,
        errors: 0,
        hintsUsed: 0,
        finalArray: [1, 2, 4, 5],
      },
      {
        phase: 2,
        comparisons: 10,
        swaps: 6,
        errors: 0,
        hintsUsed: 0,
        finalArray: [2, 3, 5, 6, 8],
      },
      {
        phase: 3,
        comparisons: 15,
        swaps: 9,
        errors: 0,
        hintsUsed: 0,
        finalArray: [1, 3, 4, 6, 7, 9],
      },
    ];
    const summary = calculateCampaignSummary(results, 3);
    expect(summary).toEqual({
      totalPhases: 3,
      completedPhases: 3,
      totalComparisons: 31,
      totalSwaps: 20,
      totalErrors: 0,
      totalHintsUsed: 0,
    });
  });
});
