import { expect, test, describe } from "bun:test";
import { MetricsCalculator } from "../api-services";

describe("MetricsCalculator", () => {
  describe("calculateOriginalityScore", () => {
    test("calculates score with entirely common words and no tags", () => {
      const description = "app platform software tool service system";
      const tags: string[] = [];
      const score = MetricsCalculator.calculateOriginalityScore(description, tags);
      expect(score).toBe(15);
    });

    test("calculates score with entirely unique words and 5 tags", () => {
      const description = "unique innovative groundbreaking stellar brilliant";
      const tags = ["tag1", "tag2", "tag3", "tag4", "tag5"];
      const score = MetricsCalculator.calculateOriginalityScore(description, tags);
      expect(score).toBe(70);
    });

    test("calculates score with mixed words and 1 tag", () => {
      const description = "app is a tool";
      const tags = ["tag1"];
      const score = MetricsCalculator.calculateOriginalityScore(description, tags);
      expect(score).toBe(59);
    });

    test("calculates score with mixed words and > 5 tags", () => {
      const description = "app incredible";
      const tags = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
      const score = MetricsCalculator.calculateOriginalityScore(description, tags);
      expect(score).toBe(35);
    });

    test("handles extra whitespaces in description", () => {
      const description = "  hello   world  ";
      const tags: string[] = [];
      const score = MetricsCalculator.calculateOriginalityScore(description, tags);
      expect(score).toBe(85);
    });

    test("handles empty description", () => {
      const description = "";
      const tags: string[] = [];
      const score = MetricsCalculator.calculateOriginalityScore(description, tags);
      expect(score).toBe(85);
    });

    test("handles mixed casing and punctuation", () => {
      const description = "App! Platform. software tool Service SYSTEM";
      const tags: string[] = [];
      const score = MetricsCalculator.calculateOriginalityScore(description, tags);
      expect(score).toBe(38);
    });
  });
});
