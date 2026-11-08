import { describe, it, expect } from "vitest";
import { shouldReportUnknown, MAX_UNKNOWN_WORD_LENGTH } from "../rules/unknown-words";

describe("shouldReportUnknown", () => {
    it("returns true for a word with 2 or more vowels", () => {
        expect(shouldReportUnknown("тестирование")).toBe(true);
    });

    it("returns true for an uppercase word with 2 or more vowels", () => {
        expect(shouldReportUnknown("ТЕСТИРОВАНИЕ")).toBe(true);
    });

    it.each(["в", "не", "мир"])("returns false for a word with zero or one vowel: %s", (word) => {
        expect(shouldReportUnknown(word)).toBe(false);
    });

    it("returns false for an empty string", () => {
        expect(shouldReportUnknown("")).toBe(false);
    });

    it("returns false for a word which already has stress mark", () => {
        expect(shouldReportUnknown("тести\u0301рование")).toBe(false);
    });

    it("returns true for a word with the same length as maximum length", () => {
        expect(shouldReportUnknown("а".repeat(MAX_UNKNOWN_WORD_LENGTH))).toBe(true);
    });

    it("returns true, ё counts as a vowel ", () => {
        expect(shouldReportUnknown("ёлка")).toBe(true);
    });

    it("returns false for a word over the maximum length", () => {
        expect(shouldReportUnknown("а".repeat(MAX_UNKNOWN_WORD_LENGTH + 1))).toBe(false);
    });
});