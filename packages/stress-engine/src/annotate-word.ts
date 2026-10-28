import { applyStress } from "./apply-stress";
import type { StressDictionary } from "./binary-dictionary.js";
import { isVowel } from "./vowels.js";
import { shouldMarkStress } from "./stress-policy.js";

export function annotateWord(word: string, dictionary: StressDictionary): string {
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
    return word.split("-").map((part) => annotateWord(part, dictionary)).join("-");
  }

  return word;
}