import { countVowels } from "../text/vowels";

export const MAX_UNKNOWN_WORD_LENGTH = 55;
export function shouldReportUnknown(word: string): boolean {
    if (word.length > MAX_UNKNOWN_WORD_LENGTH) { return false; }
    if (word.includes("\u0301")) { return false; }
    return countVowels(word) >= 2;
}
