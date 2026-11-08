import { createBinaryDictionary } from "../../dictionary/binary-dictionary";
import type { StressDictionary } from "../../dictionary/binary-dictionary";

export function dictionaryFromEntries(
    entries: Record<string, number>
): StressDictionary {
    const words = Object.keys(entries).sort();
    const lines = words.map(
        (word) => `${word}\t${entries[word]}`
    );
    const text = lines.join("\n") + "\n";
    return createBinaryDictionary(
        Buffer.from(text, "utf8")
    );
}