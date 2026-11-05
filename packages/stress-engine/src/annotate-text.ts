import { annotateWord } from "./annotate-word";
import type { StressDictionary } from "./binary-dictionary";
import { tokenize, isWord } from "./tokenize";

export function annotateText(text: string, dictionary: StressDictionary): string {
  return tokenize(text)
    .map((token) => {
      if (!isWord(token)) {
        return token;
      }

      return annotateWord(token, dictionary);
    })
    .join("");
}