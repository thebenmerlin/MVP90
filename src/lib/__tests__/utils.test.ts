import { expect, test, describe } from "bun:test";
import { cn, sanitizeUrl } from "../utils";

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

describe("sanitizeUrl utility", () => {
  test("allows valid http URLs", () => {
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
  });

  test("allows valid https URLs", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
  });

  test("allows valid URLs with mixed case", () => {
    expect(sanitizeUrl("HtTpS://example.com")).toBe("HtTpS://example.com");
  });

  test("trims whitespace around URLs", () => {
    expect(sanitizeUrl("  https://example.com  ")).toBe("https://example.com");
  });

  test("blocks javascript: URIs", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("#");
    expect(sanitizeUrl("javascript:alert('xss')")).toBe("#");
  });

  test("blocks data: URIs", () => {
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
  });

  test("blocks other invalid protocols", () => {
    expect(sanitizeUrl("ftp://example.com")).toBe("#");
    expect(sanitizeUrl("mailto:test@example.com")).toBe("#");
    expect(sanitizeUrl("file:///etc/passwd")).toBe("#");
  });

  test("handles empty, null, and undefined values", () => {
    expect(sanitizeUrl("")).toBe("#");
    expect(sanitizeUrl(null as unknown as string)).toBe("#");
    expect(sanitizeUrl(undefined as unknown as string)).toBe("#");
  });

  test("handles relative URLs", () => {
    // Current implementation only allows http:// and https:// prefixes.
    // Relative URLs will fall back to "#".
    expect(sanitizeUrl("/path/to/resource")).toBe("#");
  });
});
