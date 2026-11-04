# Chapter 01: TypeScript and JavaScript essentials

## Why this matters

Everything else in this course is written in TypeScript. A handful of ideas explain most of the errors beginners meet, and most of the code you will read.

## 1. What a type is, and why types disappear

A **type** describes the *shape* of a value: "a string", "an object with a `text` field that is a string".

```ts
const name: string = "Anna";
const count: number = 3;
const words: string[] = ["a", "b"];
```

TypeScript checks types **while you write** (in the editor and in the compiler), then **erases them**: the program that actually runs is plain JavaScript with no types in it.

Consequences you will meet again and again:

- Red underlines in the editor are TypeScript warning you *before* running. Pay attention to them.
- Tools like `tsx` and Vitest only strip the types; they do **not** check them. Code with type errors can still run, and then fail at runtime with confusing messages.
- Types cannot protect you from data that arrives from outside (a file, an HTTP request). That data must be **checked at runtime** (see chapter 05).

## 2. Describing shapes

```ts
interface User {            // the shape of an object
  name: string;
  age?: number;             // ? means optional
}

type Status = "ok" | "error";             // a union: exactly one of these strings
type Scores = Record<string, number>;     // an object with any string keys and number values

function greet(user: User, loud: boolean = false): string {   // default value, return type
  return loud ? user.name.toUpperCase() : user.name;
}
```

- `interface` and `type` overlap. Use `interface` for object shapes and `type` for unions and aliases. Consistency matters more than the choice.
- `"ok"` as a type means *exactly that string*. This makes mistakes like `"okk"` a compile error.
- `Promise<string>` means "a string that will arrive later" (chapter 04).
- `undefined` means "no value here". Functions that might not find something often return `T | undefined`, which forces callers to handle the missing case.

## 3. Modules: import and export

```ts
// math.ts
export function add(a: number, b: number): number { return a + b; }   // named export
export default function secret() {}                                    // default export (one per file)

// other.ts
import { add } from "./math";          // named import: braces, exact name
import secret from "./math";           // default import: any name you like
import type { User } from "./types";  // type-only import: erased at runtime
export type { User } from "./types";   // type-only re-export
export * from "./api";                 // re-export everything from a file
```

- `import type` documents that you only need the *description*, not any running code.
- `"type": "module"` in `package.json` switches the package to modern ES module syntax (`import`/`export`).
- An `index.ts` that re-exports things is a package's "front door": only what it exports is public.

## 3a. Everyday syntax

```ts
const total = 5;                       // cannot be reassigned. Prefer const.
let counter = 0;                       // can be reassigned
counter += 1;

const message = `Hello ${name}, you have ${count} messages`;   // template string

const [first, second] = ["a", "b"];                            // array destructuring
const { text, extra } = { text: "hi", extra: 1 };              // object destructuring

const double = (x: number) => x * 2;                           // arrow function

const port = Number(process.env.PORT ?? 4000);                 // ?? : use the right side only if the left is null/undefined
const length = user?.name?.length;                             // ?. : stop safely if something is missing

if (a === b) {}                        // always use ===, never ==
```

## 3b. Strings and quotes

A string is delimited by a matching pair of quotes, and it **ends at the next matching quote**. There are three kinds:

```ts
const a = "double quotes";
const b = 'single quotes';
const c = `backticks: can contain ${expressions} and span several lines`;
```

A quote of the **same kind** inside the string ends it early and causes a syntax error:

```ts
const bad = "Body like { "text": "..." }";        // ends after "Body like { "
const ok1 = 'Body like { "text": "..." }';        // different outer quote
const ok2 = `Body like { "text": "..." }`;        // backticks also work
const ok3 = "Body like { \"text\": \"...\" }";    // escape each inner quote with a backslash
```

- Choose the outer quote that does not appear inside the text, or escape the inner ones.
- Backticks (template literals) are also the way to insert values: `` `Limit is ${MAX} characters` ``.
- A syntax error at the top of a file makes the whole file fail to load. In a test run it shows up as a failed suite with `0 tests`, not as one failed test.

## 4. Arrays, strings and collections

```ts
const numbers = [3, 1, 2];
numbers.map((n) => n * 2);             // [6, 2, 4]  (new array)
numbers.filter((n) => n > 1);          // [3, 2]
numbers.includes(2);                   // true
numbers.join("-");                     // "3-1-2"
[...numbers].sort();                   // sorted COPY. sort() changes the original array!

"молоко".slice(0, 3);                  // from index 0 up to (not including) 3
"a-b".split("-");                      // ["a", "b"]
"abc".indexOf("c");                    // 2   (-1 when not found)
[..."abc"];                            // ["a", "b", "c"]  spread splits a string into characters

const seen = new Set(["a", "b"]);      // unique values, fast has()
seen.has("a");
const ages = new Map([["Anna", 30]]);  // key/value pairs, any key type
ages.get("Anna");
```

Two traps:

- **`.sort` is not `.sort()`.** Without parentheses you get the function itself instead of calling it, and the next line fails with "`x.map is not a function`".
- **Default `sort()` compares as text.** `[10, 9, 1].sort()` gives `[1, 10, 9]`. Give it a comparison function for numbers: `.sort((a, b) => a - b)`.

## 5. Errors

```ts
function parse(text: string): number {
  if (!/^\d+$/.test(text)) {
    throw new Error(`Not a number: "${text}"`);     // include the offending value
  }
  return Number(text);
}

try {
  parse("abc");
} catch (error) {
  console.error(error);                              // handle, log, or rethrow
  throw error;                                       // rethrow if you cannot fix it here
} finally {
  // runs in both cases (cleanup)
}
```

- Good error messages contain **what went wrong and the value that caused it**, and, if possible, how to fix it.
- A `catch` variable has no useful type. To read a field such as an error code you assert it: `(error as NodeJS.ErrnoException).code`. An `as` assertion is a *promise to the compiler*, not a conversion. If you are wrong, nothing checks you.

## 6. Numbers

- `Number("")` is `0` and `Number("abc")` is `NaN`. Neither throws. Validate text *before* converting (for example with the pattern `^\d+$`).
- `NaN` is not equal to anything, including itself. Test with `Number.isNaN(x)`.
- Integer halving: `(low + high) >> 1`.
- Typed arrays (`Uint32Array`) are compact arrays of one numeric type, much smaller than normal arrays for millions of numbers. A `Buffer` is Node's container for raw bytes.

## Common mistakes

- Forgetting `()` when calling a method (`sort`, `trim`, `toLowerCase`).
- Putting a double quote inside a double-quoted string (use a different outer quote or escape it).
- Using `=` (assign) where `===` (compare) was meant.
- Forgetting `await` (chapter 04).
- Trusting a type for data that came from outside the program.
- Mutating an array you meant to keep (`sort`, `reverse`, `splice` change the original).

## Practice

1. What does `[..."abc"].map((c) => c + c).join("")` return?
2. Why does `Number("")` being `0` matter when parsing a file?
3. You write `const words = text.split(" ").sort;` and the next line `words.map(...)` fails. What is wrong?
4. What is the difference between `import { x }` and `import type { X }`?
5. Why can a program that Vitest runs successfully still contain type errors?

**Answers.** (1) `"aabbcc"`. (2) An empty field would silently become `0` instead of being rejected. (3) `.sort` was not called. Needs `.sort()`. (4) The second is erased at runtime and only used for type checking. (5) Vitest strips types without checking them. Only the editor or `tsc` checks types.

## Where it appeared in Udarenie

The `StressDictionary` interface, `Record<string, number>` in the test helper, the `.sort`-without-parentheses bug, and `import type` in several files.
