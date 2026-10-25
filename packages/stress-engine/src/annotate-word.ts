import { dictionary } from "./dictionary";

export function annotateWord(word: string): string {
  return dictionary[word] ?? word;
}