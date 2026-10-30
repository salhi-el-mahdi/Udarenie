# Chapter 02: Text, Unicode and regular expressions

## Why this matters

Almost every program handles text, and text has surprises: characters that are two bytes long, accents that are separate characters, patterns that silently skip input. Understanding these saves hours of debugging.

## 1. Characters, code points, code units, bytes

These four words describe different things:

| Word | Meaning | Example |
|---|---|---|
| **Code point** | The number Unicode assigns to a character | `Я` is U+042F |
| **UTF-16 code unit** | JavaScript's internal unit; `.length` and indexing count these | most characters are 1 unit, emoji are 2 |
| **UTF-8 byte** | What files and networks usually contain | ASCII letters 1 byte, Cyrillic 2, emoji 4 |
| **Glyph** | What you see on screen | |

```js
"Привет".length                 // 6   (code units)
Buffer.byteLength("Привет")     // 12  (UTF-8 bytes: Cyrillic is 2 bytes per letter)
"😀".length                     // 2   (two code units)
[..."😀"].length                // 1   (spread counts code points)
```

Practical rules:

- When you work with **file positions**, think in **bytes**. When you work with **string indexes**, think in **code units**.
- For characters in the "basic" range (Latin, Cyrillic, Greek...), code points and code units coincide, so indexes behave as expected.
- Letter case conversion can change length in some languages (`"ß".toUpperCase()` is `"SS"`), but not in Cyrillic. Check before assuming a lowercase copy has the same indexes as the original.

## 2. Combining characters

Some characters have no width of their own and attach to the one before them. The classic example is the combining acute accent **U+0301**:

```js
"а\u0301"                // "а́"  (two code points, displayed as one accented letter)
"é".normalize("NFD").length   // 2  (e + combining accent)
"é".normalize("NFC").length   // 1  (single precomposed character)
```

- Write them in source code as **escape sequences** (`"\u0301"`) so they are visible and cannot be altered by editors or copy-paste.
- A combining mark attaches to the **preceding** character. Some terminals display it over the *next* one; that is a rendering quirk, not an error in the string. Check by printing code points:

```js
[..."Это"].map((c) => c.codePointAt(0).toString(16))   // ["42d", "442", "43e"]
```

- *Normalization* (NFC / NFD) converts between composed and decomposed forms. Comparing text from different sources may require normalizing first.

## 3. Regular expressions: the building blocks

A regular expression (regex) is a pattern that describes a set of strings.

| Piece | Meaning |
|---|---|
| `abc` | the literal text |
| `[abc]` | any one of these characters |
| `[a-z]` | any one in the range |
| `[^abc]` | any one character **except** these |
| `.` | any character except line terminators |
| `[\s\S]` | any character at all (including newlines) |
| `\d` `\s` | a digit, a whitespace character |
| `+` `*` `?` | one or more / zero or more / zero or one of the previous thing |
| `{2,4}` | between 2 and 4 of the previous thing |
| `a\|b` | `a` or `b` |
| `(...)` | a group (also captures what it matched) |
| `(?:...)` | a group that does **not** capture (just groups) |
| `^` `$` | start of text, end of text |

Flags go after the closing slash: `g` (find all matches), `u` (treat text as Unicode), `i` (ignore case), `s` (let `.` match newlines).

```js
/^\d+$/.test("123")        // true:  the WHOLE text is digits
/^\d+$/.test("12a")        // false
/\d+(?:\.\d+)*/.exec("v1.2.3")[0]   // "1.2.3": digits, then zero or more (dot, digits)
"a1b22".match(/\d+/g)      // ["1", "22"]  (note: the "a" and "b" are skipped)
/a|ab/.exec("ab")[0]       // "a"   (alternatives are tried LEFT to RIGHT; the first that matches wins)
```

**Read a regex out loud, piece by piece.** `/[А-Яа-я]+(?:-[А-Яа-я]+)*/` is: "one or more letters, then zero or more groups of (a hyphen, then one or more letters)".

## 4. Regex habits that prevent bugs

- **Order of alternatives matters.** Put the most specific first and a catch-all last.
- **`match` with `g` returns only the matches** and silently discards everything in between. If you need the *whole* text split into pieces, add a catch-all alternative so nothing is skipped.
- **A shape you use in two places should be defined once.** Write each piece as a regex literal, take its `.source`, and combine them:

```js
const WORD = /[a-z]+(?:-[a-z]+)*/;
const TOKEN = new RegExp([WORD, /\s+/, /[\s\S]/].map((r) => r.source).join("|"), "gu");
const WORD_ONLY = new RegExp(`^(?:${WORD.source})$`, "u");
```

This avoids the backslash-doubling problems of writing regexes inside strings, and keeps the two copies in sync.

- **Anchors `^` and `$` turn "contains" into "is".** `/\d+/.test("a1")` is true, `/^\d+$/.test("a1")` is false.
- Avoid nested repeats like `(a+)+`. They can take exponential time on bad input.
- Test regexes on a site like regex101.com (choose the *ECMAScript / JavaScript* flavor and the same flags).

## 5. Lossless tokenizing

A **tokenizer** cuts text into pieces. The safe rule is the **round-trip invariant**: joining the tokens must give back the exact input.

```js
tokens.join("") === input
```

Test it with nasty input (quotes, dashes, digits, newlines, an empty string). Any character not claimed by a specific pattern must be claimed by a catch-all.

## Common mistakes

- Assuming `.length` is the number of visible characters or the number of bytes.
- Putting an invisible character in source code and not being able to see it.
- Forgetting that `match(/.../g)` drops unmatched text.
- Expecting a pattern without anchors to check the whole string.
- Ordering alternatives so that a short pattern swallows the match a longer one should have made.

## Practice

1. What is `Buffer.byteLength("абв")`?
2. Write a pattern for "one or more digits, optionally followed by a dot and more digits" (like `3` or `3.14`).
3. Why does `"x1y22".match(/\d+/g)` not let you rebuild the original text?
4. What does `/^(?:a|ab)$/.test("ab")` return, and why?
5. Why write `"\u0301"` instead of pasting the accent?

**Answers.** (1) 6. (2) `/^\d+(?:\.\d+)?$/`. (3) The letters between the matches are not in the result. (4) `true`: with the anchors the engine tries `a`, fails at `$`, then backtracks and tries `ab`. (5) The mark is invisible and may be altered; the escape is explicit.

## Where it appeared in Udarenie

The tokenizer with its catch-all, the shared word pattern for `tokenize` and `isWord`, the `\u0301` escapes in tests, the byte-oriented dictionary file.
