import { applyStress } from "./apply-stress";
import type { StressDictionary } from "../dictionary/binary-dictionary";
import { isVowel } from "../text/vowels";
import { shouldMarkStress } from "../rules/stress-policy";
import { shouldReportUnknown } from "../rules/unknown-words";

export function annotateWord(word: string, dictionary: StressDictionary, onUnknown?: (word: string) => void): string {
  const stressIndex = dictionary.get(word.toLowerCase());

  if (stressIndex !== undefined) {
    const letter = word[stressIndex];

    if (letter === undefined || !isVowel(letter)) {
      throw new Error(
        `Invalid stress index ${stressIndex} for "${word}". The dictionary file may be corrupt or outdated; rebuild it with build:dictionary.`,
      );
    }
    if (shouldMarkStress(word, stressIndex)) {
      return applyStress(word, stressIndex);
    }
    return word;
  }

  if (word.includes("-")) {
    return word.split("-").map((part) => annotateWord(part, dictionary, onUnknown)).join("-");
  }
  if (shouldReportUnknown(word)) {
    onUnknown?.(word.toLowerCase());
  }
  return word;
}