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

describe("annotateText: unknown word reporting", () => {
  function reportedFor(text: string): string[] {
    const reported: string[] = [];
    annotateText(text, dictionary, (w) => reported.push(w));
    return reported;
  }

  it("reports only the unknown word, not the other words or the punctuation”", () => {
    expect(reportedFor("Я люблю тестирование.")).toEqual(["тестирование"]);
  })

  it("reports more than one unknown word", () => {
    expect(reportedFor("тестирование и образование")).toEqual(["тестирование", "образование"]);
  })

  it("does not report known and short words", () => {
    expect(reportedFor("Привет, мир!")).toEqual([]);
  })

  it("does not report latin words and digits", () => {
    expect(reportedFor("test 123 тестирование")).toEqual(["тестирование"]);
  })

  it("does not report empty strings", () => {
    expect(reportedFor("")).toEqual([]);
  })

  it("reports each occurence of an unknown word", () => {
    expect(reportedFor("тестирование тестирование")).toEqual(["тестирование", "тестирование"]);
  });

  it("reports the unknown part of hyphenated word inside a text", () => {
    expect(reportedFor("Я люблю русский-тестирование.")).toEqual(["тестирование"]);
  })

  it("works without a reporting callback", () => {
    expect(annotateText("Я люблю тестирование.", dictionary)).toBe("Я люблю\u0301 тестирование.");
  });

  it("works with a reporting callback", () => {
    const reported: string[] = [];
    expect(annotateText("Я люблю тестирование.", dictionary, (w) => reported.push(w))).toBe("Я люблю\u0301 тестирование.");
  });

})