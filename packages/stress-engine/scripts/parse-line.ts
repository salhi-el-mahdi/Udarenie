const VOWELS = new Set([
    "а", "е", "ё", "и", "о", "у", "ы", "э", "ю", "я",
]);

const WORD_SHAPE = /^[а-яё]+(?:-[а-яё]+)*$/u;

export function parseLine(
    line: string
): { word: string; index: number } {
    const parts = line.split("\t");

    if (parts.length !== 2) {
        throw new Error(`Malformed line: ${line}`);
    }

    const [word, position] = parts;

    if (!/^\d+$/.test(position)) {
        throw new Error(
            `Invalid position "${position}" in line: ${line}`
        );
    }

    if (
        !WORD_SHAPE.test(word)
    ) {
        throw new Error(
            `Invalid word "${word}" in line: ${line}`
        );
    }

    const datasetPosition = Number(position);

    if (
        datasetPosition < 1 ||
        datasetPosition > word.length
    ) {
        throw new Error(
            `Out of bounds position ${datasetPosition} in line: ${line}`
        );
    }

    const index = datasetPosition - 1;

    if (!VOWELS.has(word[index])) {
        throw new Error(
            `Position ${datasetPosition} does not point to a vowel in line: ${line}`
        );
    }

    return {
        word,
        index,
    };
}