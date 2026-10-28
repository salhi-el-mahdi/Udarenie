import { describe, it, expect } from "vitest";
import { annotateWord } from "../annotate-word";
import { dictionaryFromEntries } from "./helpers/test-dictionary";

const dictionary = dictionaryFromEntries({
  русский: 1,
  язык: 2,
  люблю: 4,
  молоко: 5,
  "а-ля": 3,
  привет: 4,
  мир: 1,
  пришёл: 4,
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

describe("annotateWord stress rules", () => {
  it("word with ё ", () => {
    expect(annotateWord("пришёл", dictionary)).toBe("пришёл");
  });

  it("throws when the index is greater than the word length", () => {
    const bad = dictionaryFromEntries({
      молоко: 99,
    });

    expect(() =>
      annotateWord("молоко", bad)
    ).toThrow();
  });

  it("throws when the index points to a consonant", () => {
    const bad = dictionaryFromEntries({
      молоко: 4,
    });

    expect(() =>
      annotateWord("молоко", bad)
    ).toThrow();
  });

  it("throws when the index is negative", () => {
    const bad = dictionaryFromEntries({
      молоко: -1,
    });

    expect(() =>
      annotateWord("молоко", bad)
    ).toThrow();
  });
});