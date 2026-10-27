import { describe, it, expect } from "vitest";
import { annotateText } from "../annotate-text";

describe("annotateText", () => {
  it("annotates a single capitalized word", () => {
    expect(annotateText("Русский"))
      .toBe("Ру́сский");
  });

  it("annotates a simple sentence", () => {
    expect(
      annotateText("Я люблю русский язык")
    ).toBe(
      "Я люблю́ ру́сский язы́к"
    );
  });

  it("preserves punctuation", () => {
    expect(
      annotateText("Я люблю русский язык.")
    ).toBe(
      "Я люблю́ ру́сский язы́к."
    );
  });

  it("preserves uppercase words", () => {
    expect(
      annotateText("РУССКИЙ")
    ).toBe(
      "РУ́ССКИЙ"
    );
  });

  it("does not add a second stress mark to an already-stressed word", () => {
    expect(annotateText("молоко\u0301")).toBe("молоко\u0301");
  });
});