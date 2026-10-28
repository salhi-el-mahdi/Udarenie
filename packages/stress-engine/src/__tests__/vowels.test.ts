import { describe, it, expect } from "vitest";
import { countVowels } from "../vowels.js";

describe("countVowels", () => {
    it("single word", () => {
        expect(countVowels("молоко")).toBe(3);
    });

    it("single uppercase word", () => {
        expect(countVowels("МОЛОКО")).toBe(3);
    });

    it("single syllable word", () => {
        expect(countVowels("мир")).toBe(1);
    });

    it("single syllable word with ё", () => {
        expect(countVowels("ёж")).toBe(1);
    });

    it("a hyphenated word", () => {
        expect(countVowels("кто-то")).toBe(2);
    });

    it("empty string", () => {
        expect(countVowels("")).toBe(0);
    });
});