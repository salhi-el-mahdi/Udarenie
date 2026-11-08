import { describe, it, expect } from "vitest";
import { annotateTextWithReport } from "../annotate-with-report";
import { dictionaryFromEntries } from "./helpers/test-dictionary";
import { annotateText } from "../annotate-text";

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

describe("annotateTextWithReport", () => {
    it("reports one unknown word with count 1", () => {
        let annotationReport = annotateTextWithReport("Я люблю тестирование.", dictionary);

        expect(annotationReport.annotatedText).toBe(annotateText("Я люблю тестирование.", dictionary));

        expect(annotationReport.unknownWords).toEqual([{ word: "тестирование", count: 1 }]);
    });

    it("reports one unknown word with count 2", () => {
        let annotationReport = annotateTextWithReport("тестирование и тестирование", dictionary);

        expect(annotationReport.annotatedText).toBe(annotateText("тестирование и тестирование", dictionary));

        expect(annotationReport.unknownWords).toEqual([{ word: "тестирование", count: 2 }]);
    });

    it("reports an uppercase word and its lowercase version as one word with count 2", () => {
        let annotationReport = annotateTextWithReport("Тестирование тестирование", dictionary);

        expect(annotationReport.annotatedText).toBe(annotateText("Тестирование тестирование", dictionary));

        expect(annotationReport.unknownWords).toEqual([{ word: "тестирование", count: 2 }]);
    });

    it("reports two unknown words ordered by count", () => {
        let annotationReport = annotateTextWithReport("образование тестирование тестирование", dictionary);

        expect(annotationReport.annotatedText).toBe(annotateText("образование тестирование тестирование", dictionary));

        expect(annotationReport.unknownWords).toEqual([{ word: "тестирование", count: 2 }, { word: "образование", count: 1 }]);
    });

    it("reports two unknown words with the same count ,ordered alphabetically", () => {
        let annotationReport = annotateTextWithReport("образование тестирование", dictionary);

        expect(annotationReport.annotatedText).toBe(annotateText("образование тестирование", dictionary));

        expect(annotationReport.unknownWords).toEqual([{ word: "образование", count: 1 }, { word: "тестирование", count: 1 }]);
    });

    it("annotates text with no unknown words", () => {
        let annotationReport = annotateTextWithReport("Я люблю русский язык.", dictionary);

        expect(annotationReport.annotatedText).toBe(annotateText("Я люблю русский язык.", dictionary));

        expect(annotationReport.unknownWords).toEqual([]);
    });

    it("empty string", () => {
        let annotationReport = annotateTextWithReport("", dictionary);

        expect(annotationReport.annotatedText).toBe(annotateText("", dictionary));

        expect(annotationReport.unknownWords).toEqual([]);
    });

    it("reports unknown part of a hyphenated word", () => {
        let annotationReport = annotateTextWithReport("русский-тестирование", dictionary);

        expect(annotationReport.annotatedText).toBe(annotateText("русский-тестирование", dictionary));

        expect(annotationReport.unknownWords).toEqual([{ word: "тестирование", count: 1 }]);
    });
});