import dictionary from "./load-dictionary";
import { applyStress } from "./apply-stress";

export function annotateWord(word: string): string {
  const stressIndex = dictionary[word.toLowerCase()];

  if (stressIndex !== undefined) {
    return applyStress(word, stressIndex);
  }

  if (word.includes("-")) {
    return word.split("-").map((part) => annotateWord(part)).join("-");
  }

  return word;
}