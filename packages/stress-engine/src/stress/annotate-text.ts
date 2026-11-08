import { annotateWord } from "./annotate-word";
import type { StressDictionary } from "../dictionary/binary-dictionary";
import { tokenize, isWord } from "../text/tokenize";

export function annotateText(text: string, dictionary: StressDictionary, onUnknown?: (word: string) => void): string {
  return tokenize(text)
    .map((token) => {
      if (!isWord(token)) {
        return token;
      }

      return annotateWord(token, dictionary, onUnknown);
    })
    .join("");
}