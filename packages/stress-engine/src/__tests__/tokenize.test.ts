import { describe, it, expect } from "vitest";
import { tokenize, isWord } from "../tokenize";

describe("tokenize", () => {
  it("never loses characters", () => {
    const input = "«Привет», — сказал он.\n2 words: ok… hello";
    expect(tokenize(input).join("")).toBe(input);
  });

  it("returns no tokens for an empty string", () => {
    expect(tokenize("")).toEqual([]);
  });

  it("splits words, spaces and punctuation", () => {
    expect(tokenize("Я люблю.")).toEqual(["Я", " ", "люблю", "."]);
  });

  it("keeps a hyphenated word together", () => {
    expect(tokenize("кто-то")).toEqual(["кто-то"]);
  });

  it("treats a leading or trailing hyphen as separate", () => {
    expect(tokenize("слово-")).toEqual(["слово", "-"]);
    expect(tokenize("-слово")).toEqual(["-", "слово"]);
  });

  it("keeps an already-stressed word as one token", () => {
  expect(tokenize("молоко\u0301")).toEqual(["молоко\u0301"]);
  });
});

describe("isWord", () => {
  it("accepts plain and hyphenated words", () => {
    expect(isWord("слово")).toBe(true);
    expect(isWord("кто-то")).toBe(true);
  });

  it("rejects hyphens alone and edge hyphens", () => {
    expect(isWord("-")).toBe(false);
    expect(isWord("слово-")).toBe(false);
  });
});