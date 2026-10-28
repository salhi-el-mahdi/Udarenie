import { describe, it, expect } from "vitest";
import { annotateText } from "../annotate-text";
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

describe("annotateText", () => {
  it("annotates a single capitalized word", () => {
    expect(annotateText("Русский", dictionary))
      .toBe("Ру́сский");
  });

  it("annotates a simple sentence", () => {
    expect(
      annotateText("Я люблю русский язык", dictionary)
    ).toBe(
      "Я люблю́ ру́сский язы́к"
    );
  });

  it("preserves punctuation", () => {
    expect(
      annotateText("Я люблю русский язык.", dictionary)
    ).toBe(
      "Я люблю́ ру́сский язы́к."
    );
  });

  it("preserves uppercase words", () => {
    expect(
      annotateText("РУССКИЙ", dictionary)
    ).toBe(
      "РУ́ССКИЙ"
    );
  });

  it("does not add a second stress mark to an already-stressed word", () => {
    expect(annotateText("молоко\u0301", dictionary)).toBe("молоко\u0301");
  });

  it("first word should be annotated and the second one is only one syllable", () => {
    expect(annotateText("Привет, мир!", dictionary)).toBe("Приве\u0301т, мир!");
  });
});