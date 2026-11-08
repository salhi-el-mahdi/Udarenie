import { annotateText } from "./annotate-text";
import type { StressDictionary } from "./binary-dictionary";

export interface UnknownWordCount { word: string; count: number }
export interface AnnotationReport { annotatedText: string; unknownWords: UnknownWordCount[] }

export function annotateTextWithReport(text: string, dictionary: StressDictionary): AnnotationReport {

    const unknownWordCount = new Map<string, number>();

    const annotatedText = annotateText(text, dictionary, (word) => {
        unknownWordCount.set(word, (unknownWordCount.get(word) ?? 0) + 1);
    });

    const unknownWords = [...unknownWordCount]
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => {
            if (a.count !== b.count) return b.count - a.count;
            return a.word < b.word ? -1 : 1;
        });

    const annotationReport: AnnotationReport = {
        annotatedText,
        unknownWords,
    };

    return annotationReport;

}