import { countVowels } from "../text/vowels";

// index must point inside word: annotateWord checks this
export function shouldMarkStress(
    word: string,
    index: number,
): boolean {
    if (
        word[index].toLowerCase() === "ё" ||
        countVowels(word) === 1
    ) {
        return false;
    }

    return true;
}