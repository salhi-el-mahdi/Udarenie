import { describe, it, expect } from "vitest";
import { parseLine } from "../parse-line";

describe("parseLine", () => {
    it("converts the position after the vowel to the vowel's index", () => {
        expect(parseLine("молоко\t6")).toEqual({ word: "молоко", index: 5 });
    });

    it("throws when the line has no tab", () => {
        expect(() => parseLine("молоко")).toThrow();
    });

    it("throws when the position is not a number", () => {
        expect(() => parseLine("молоко\tabc")).toThrow();
    });

    it("throws when the position is empty", () => {
        expect(() => parseLine("молоко\t")).toThrow();
    });

    it("throws when the position is 0", () => {
        expect(() => parseLine("молоко\t0")).toThrow();
    });

    it("throws when the position is past the end of the word", () => {
        expect(() => parseLine("молоко\t7")).toThrow();
    });

    it("throws when the stressed letter is not a vowel", () => {
        expect(() => parseLine("молоко\t5")).toThrow();
    });

    it("accepts ё as a vowel", () => {
        expect(parseLine("ёж\t1")).toEqual({ word: "ёж", index: 0 });
    });

    it("throws on uppercase letters", () => {
        expect(() => parseLine("Молоко\t6")).toThrow();
    });

    it("throws on non-Cyrillic characters", () => {
        expect(() => parseLine("milk\t1")).toThrow();
    });

    it("throws on a leading hyphen or a double hyphen", () => {
        expect(() => parseLine("-молоко\t2")).toThrow();
        expect(() => parseLine("мо--локо\t2")).toThrow();
    });

    it("throws on an empty word", () => {
        expect(() => parseLine("\t1")).toThrow();
    });

    it("counts the hyphen as a character", () => {
        expect(parseLine("кто-то\t3")).toEqual({ word: "кто-то", index: 2 });
        expect(parseLine("по-русски\t5")).toEqual({ word: "по-русски", index: 4 });
        expect(parseLine("а-ля\t4")).toEqual({ word: "а-ля", index: 3 });
    });
});
