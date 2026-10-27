import { describe, it, expect } from "vitest";
import { annotateWord } from "../annotate-word";
import { dictionaryFromEntries } from "./helpers/test-dictionary";

const dictionary = dictionaryFromEntries({
  русский: 1,
  язык: 2,
  люблю: 4,
  молоко: 5,
  "а-ля": 3,
});

describe("annotateWord hyphens", () => {
  it("annotates a hyphenated dictionary entry as a whole", () => {
    expect(annotateWord("а-ля", dictionary)).toBe("а-ля\u0301");
  });

  it("falls back to annotating each part", () => {
    expect(annotateWord("русский-язык", dictionary)).toBe("ру\u0301сский-язы\u0301к");
  });

  it("leaves a lone hyphen alone", () => {
    expect(annotateWord("-", dictionary)).toBe("-");
  });
});