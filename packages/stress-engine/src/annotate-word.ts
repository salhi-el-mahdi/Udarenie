import { applyStress } from "./apply-stress";
import type { StressDictionary } from "./binary-dictionary.js";

export function annotateWord(word: string, dictionary: StressDictionary): string {
  const stressIndex = dictionary.get(word.toLowerCase());

  if (stressIndex !== undefined) {
    return applyStress(word, stressIndex);
  }

  if (word.includes("-")) {
    return word.split("-").map((part) => annotateWord(part,dictionary)).join("-");
  }

  return word;
}