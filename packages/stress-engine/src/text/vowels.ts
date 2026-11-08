const VOWELS = new Set([
    "а", "е", "ё", "и", "о", "у", "ы", "э", "ю", "я",
]);


export function isVowel(letter: string): boolean {
    return VOWELS.has(letter.toLowerCase());
}
export function countVowels(word: string): number {
    return [...word].filter(isVowel).length;
}