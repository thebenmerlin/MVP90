import { expect, test, describe } from "bun:test";
import { getScoreColor, MVP90_THEME } from "../theme";

describe("theme utility", () => {
  describe("getScoreColor", () => {
    test("returns high score color for scores >= 80%", () => {
      expect(getScoreColor(8)).toBe(MVP90_THEME.colors.scores.high);
      expect(getScoreColor(9)).toBe(MVP90_THEME.colors.scores.high);
      expect(getScoreColor(10)).toBe(MVP90_THEME.colors.scores.high);

      // With custom maxScore
      expect(getScoreColor(80, 100)).toBe(MVP90_THEME.colors.scores.high);
      expect(getScoreColor(100, 100)).toBe(MVP90_THEME.colors.scores.high);
    });

    test("returns medium score color for scores between 60% and 79%", () => {
      expect(getScoreColor(6)).toBe(MVP90_THEME.colors.scores.medium);
      expect(getScoreColor(7)).toBe(MVP90_THEME.colors.scores.medium);
      expect(getScoreColor(7.9)).toBe(MVP90_THEME.colors.scores.medium);

      // With custom maxScore
      expect(getScoreColor(60, 100)).toBe(MVP90_THEME.colors.scores.medium);
      expect(getScoreColor(75, 100)).toBe(MVP90_THEME.colors.scores.medium);
    });

    test("returns low score color for scores < 60%", () => {
      expect(getScoreColor(0)).toBe(MVP90_THEME.colors.scores.low);
      expect(getScoreColor(5)).toBe(MVP90_THEME.colors.scores.low);
      expect(getScoreColor(5.9)).toBe(MVP90_THEME.colors.scores.low);

      // With custom maxScore
      expect(getScoreColor(0, 100)).toBe(MVP90_THEME.colors.scores.low);
      expect(getScoreColor(59, 100)).toBe(MVP90_THEME.colors.scores.low);
    });

    test("handles edge cases correctly", () => {
      // Exactly 80%
      expect(getScoreColor(8)).toBe(MVP90_THEME.colors.scores.high);

      // Exactly 60%
      expect(getScoreColor(6)).toBe(MVP90_THEME.colors.scores.medium);

      // Just below 60%
      expect(getScoreColor(5.99)).toBe(MVP90_THEME.colors.scores.low);

      // Just below 80%
      expect(getScoreColor(7.99)).toBe(MVP90_THEME.colors.scores.medium);
    });
  });
});
