const WORD = /[А-Яа-яЁё\u0301]+(?:-[А-Яа-яЁё\u0301]+)*/;

const TOKEN = new RegExp(
  [WORD, /[.,!?;:()]/, /\s+/, /[\s\S]/].map((r) => r.source).join("|"),
  "gu"
);

const WORD_ONLY = new RegExp(`^(?:${WORD.source})$`, "u");

export function tokenize(text: string): string[] {
  return text.match(TOKEN) ?? [];
}

export function isWord(token: string): boolean {
  return WORD_ONLY.test(token);
}