import { describe, it, expect } from "vitest";
import { shouldMarkStress } from "../stress-policy";

describe("shouldMarkStress",()=>{
    it("normal word",()=>{
        expect(shouldMarkStress("молоко", 5)).toBe(true);
    });

    it("one vowel",()=>{
        expect(shouldMarkStress("мир", 1)).toBe(false);
    });

    it("one vowel, capitalized",()=>{
        expect(shouldMarkStress("Мир", 1)).toBe(false);
    });

    it("the letter is ё",()=>{
        expect(shouldMarkStress("пришёл", 4)).toBe(false);
    });

    it("Uppercase Ё",()=>{
        expect(shouldMarkStress("Ёлка", 0)).toBe(false);
    });

    it("the е spelling still gets a mark",()=>{
        expect(shouldMarkStress("пришел", 4)).toBe(true);
    });

    it("two vowels in total",()=>{
        expect(shouldMarkStress("кто-то", 2)).toBe(true);
    });
});