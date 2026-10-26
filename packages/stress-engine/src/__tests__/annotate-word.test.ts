import { describe, it, expect } from "vitest";
import { annotateWord } from "../annotate-word";

describe("annotateWord hyphens", () => {
  it("annotates a hyphenated dictionary entry as a whole", () => {
    expect(annotateWord("а-ля")).toBe("а-ля\u0301");
  });

  it("falls back to annotating each part", () => {
    expect(annotateWord("русский-язык")).toBe("ру\u0301сский-язы\u0301к");
  });

  it("leaves a lone hyphen alone", () => {
    expect(annotateWord("-")).toBe("-");
  });
});