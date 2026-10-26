import { annotateWord } from "./annotate-word";
import { tokenize, isWord } from "./tokenize";

export function annotateText(text: string): string {
  return tokenize(text)
    .map((token) => {
      if (!isWord(token)) {
        return token;
      }

      return annotateWord(token);
    })
    .join("");
}