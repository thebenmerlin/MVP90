import { expect, test, describe } from "bun:test";
import { cn } from "../utils";

describe("cn utility", () => {
  test("merges strings correctly", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  test("handles conditional classes correctly", () => {
    expect(cn("a", true && "b", false && "c")).toBe("a b");
  });

  test("handles object inputs correctly", () => {
    expect(cn({ a: true, b: false, c: true })).toBe("a c");
  });

  test("handles array inputs correctly", () => {
    expect(cn(["a", "b"], ["c"])).toBe("a b c");
  });

  test("handles nested array and object inputs", () => {
    expect(cn("a", ["b", { c: true, d: false }])).toBe("a b c");
  });

  test("resolves tailwind class conflicts (tailwind-merge)", () => {
    // These tests specifically check if tailwind-merge is working correctly.
    // If tailwind-merge is working, the last conflicting class should win.
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("m-4", "m-2")).toBe("m-2");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  test("handles complex combinations", () => {
    const isActive = true;
    const isError = false;
    const classes = ["font-bold", { "bg-green-500": isActive, "bg-red-500": isError }];
    expect(cn("p-4 m-2", classes, "p-8")).toBe("m-2 font-bold bg-green-500 p-8");
  });
});
