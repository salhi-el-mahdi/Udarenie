import { describe, it, expect } from "vitest";
import { createBinaryDictionary } from "../dictionary/binary-dictionary";

const sample = Buffer.from(
    "а-ля\t3\nкто-то\t2\nмолоко\t5\nрусский\t1\n",
);

describe("createBinaryDictionary", () => {
    it("reports the correct size", () => {
        const dictionary = createBinaryDictionary(sample);

        expect(dictionary.size).toBe(4);
    });

    it("finds the first entry", () => {
        const dictionary = createBinaryDictionary(sample);

        expect(dictionary.get("а-ля")).toBe(3);
    });

    it("finds a middle entry", () => {
        const dictionary = createBinaryDictionary(sample);

        expect(dictionary.get("молоко")).toBe(5);
    });

    it("finds the last entry", () => {
        const dictionary = createBinaryDictionary(sample);

        expect(dictionary.get("русский")).toBe(1);
    });

    it("returns undefined for a word before the first entry", () => {
        const dictionary = createBinaryDictionary(sample);

        expect(dictionary.get("а")).toBeUndefined();
    });

    it("returns undefined for a word between entries", () => {
        const dictionary = createBinaryDictionary(sample);

        expect(dictionary.get("лук")).toBeUndefined();
    });

    it("returns undefined for a word after the last entry", () => {
        const dictionary = createBinaryDictionary(sample);

        expect(dictionary.get("ящик")).toBeUndefined();
    });

    it("returns undefined for a prefix of an entry", () => {
        const dictionary = createBinaryDictionary(sample);

        expect(dictionary.get("молок")).toBeUndefined();
    });

    it("returns undefined for a longer variant", () => {
        const dictionary = createBinaryDictionary(sample);

        expect(dictionary.get("молокоо")).toBeUndefined();
    });

    it("returns undefined for an accented variant", () => {
        const dictionary = createBinaryDictionary(sample);

        expect(dictionary.get("молоко\u0301")).toBeUndefined();
    });

    it("returns undefined for an empty string", () => {
        const dictionary = createBinaryDictionary(sample);

        expect(dictionary.get("")).toBeUndefined();
    });

    it("returns undefined for uppercase words", () => {
        const dictionary = createBinaryDictionary(sample);

        expect(dictionary.get("МОЛОКО")).toBeUndefined();
    });

    it("works without a final newline", () => {
        const dictionary = createBinaryDictionary(
            Buffer.from("а-ля\t3\nрусский\t1"),
        );

        expect(dictionary.get("а-ля")).toBe(3);
        expect(dictionary.get("русский")).toBe(1);
        expect(dictionary.size).toBe(2);
    });

    it("works with a single-line file", () => {
        const dictionary = createBinaryDictionary(
            Buffer.from("русский\t1"),
        );

        expect(dictionary.get("русский")).toBe(1);
        expect(dictionary.size).toBe(1);
    });

    it("works with an empty buffer", () => {
        const dictionary =
            createBinaryDictionary(Buffer.from(""));

        expect(dictionary.size).toBe(0);
        expect(
            dictionary.get("русский"),
        ).toBeUndefined();
    });
});