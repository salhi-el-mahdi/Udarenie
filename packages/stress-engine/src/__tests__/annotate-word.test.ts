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

describe("annotateWord: hyphens", () => {
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

describe("annotateWord: stress rules", () => {
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

describe("annotateWord: unknown word reporting", () => {
  function reportedFor(word: string): string[] {
    const reported: string[] = [];

    annotateWord(
      word,
      dictionary,
      (w) => reported.push(w),
    );

    return reported;
  }

  it("reports an unknown word with 2 or more vowels", () => {
    expect(
      reportedFor("тестирование"),
    ).toEqual(["тестирование"]);
  });

  it("reports an unknown uppercase word with 2 or more vowels", () => {
    expect(
      reportedFor("Тестирование"),
    ).toEqual(["тестирование"]);
  });

  it("does not report a known word", () => {
    expect(
      reportedFor("молоко"),
    ).toEqual([]);
  });

  it("does not report a found word that the stress policy does not mark", () => {
    expect(
      reportedFor("пришёл"),
    ).toEqual([]);
  });

  it("does not report an unknown one-vowel word", () => {
    expect(
      reportedFor("дом"),
    ).toEqual([]);
  });

  it("does not report a word that already contains a stress mark", () => {
    expect(
      reportedFor("тести́рование"),
    ).toEqual([]);
  });

  it("does not report a hyphenated word when all parts are known", () => {
    expect(
      reportedFor("русский-язык"),
    ).toEqual([]);
  });

  it("reports the unknown part of a hyphenated word", () => {
    expect(
      reportedFor("русский-тестирование"),
    ).toEqual(["тестирование"]);
  });

  it("reports both unknown parts of a hyphenated word in order", () => {
    expect(
      reportedFor("тестирование-образование"),
    ).toEqual([
      "тестирование",
      "образование",
    ]);
  });

  it("works without a reporting callback", () => {
    expect(annotateWord("тестирование", dictionary)).toBe("тестирование");
  });
});