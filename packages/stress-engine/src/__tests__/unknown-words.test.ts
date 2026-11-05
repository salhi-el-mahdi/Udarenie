import { describe, it } from "vitest";

describe("unknown words", () => {
    it.todo(
        "does not report a word with an entry in the dictionary",
    );

    it.todo(
        "does not report a found word that our rules do not mark (ё, one vowel)",
    );

    it.todo(
        "does not report a word not in the dictionary with 0 or 1 vowels",
    );

    it.todo(
        "reports a word not in the dictionary with 2 or more vowels",
    );

    it.todo(
        "does not report a word that already contains a stress mark",
    );

    it.todo(
        "reports a capitalized word whose lowercase form is missing, in lowercase",
    );

    it.todo(
        "does not report a hyphenated word missing as a whole when all parts are known",
    );

    it.todo(
        "reports the unknown part of a hyphenated word, not the whole word",
    );

    it.todo(
        "reports the same unknown word once with a frequency count",
    );

    it.todo(
        "does not report text containing Latin letters, digits, or punctuation",
    );

    it.todo(
        "does not report a token longer than 55 characters",
    );
});