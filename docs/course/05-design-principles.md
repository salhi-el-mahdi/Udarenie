# Chapter 05: Design principles

## Why this matters

Code that works today but cannot be tested, changed or trusted tomorrow is a liability. A few design habits make code easier to test, change and reason about. They are small, they apply to every language, and they are the difference between a script and a system.

## 1. Pure functions and side effects

A **pure function** returns the same output for the same input and does nothing else: no files, no network, no changing outside variables. Anything else is a **side effect**.

```ts
function isVowel(letter: string): boolean {      // pure
  return "аеёиоуыэюя".includes(letter.toLowerCase());
}

async function save(text: string) {              // has a side effect (writes a file)
  await writeFile("out.txt", text);
}
```

Pure functions are trivial to test (call them, check the result), safe to reuse, and easy to reason about. A good design pushes side effects to the **edges** of the program and keeps the core pure.

## 2. Separation of concerns

Give each piece **one job**, and put different jobs in different places. Signs you are doing it right: a function's name describes everything it does, and a change in one concern (say, a display rule) touches one small file.

Examples of useful separations:

- **Build time vs run time.** Do slow, careful work (downloading, validating, converting) once in a build step, so that the running program can be simple and fast.
- **Rules vs mechanics.** "Should we show this mark?" (a rule that may change, or become a user setting) is separate from "insert the mark" (mechanical).
- **Wiring vs logic.** The code that *creates and connects* the parts (a server's startup file) is separate from the code that *does the work*.

## 3. Interfaces: depend on a shape, not on a thing

An **interface** describes what something can do without saying how:

```ts
interface StressDictionary {
  get(word: string): number | undefined;
  readonly size: number;
}
```

Any object with that shape qualifies: a hash table, a binary search over a file, a database, a test stub. Code written against the interface works with all of them.

## 4. Dependency injection

A **dependency** is something a function needs to do its job. **Dependency injection** means the function *receives* its dependencies (usually as parameters) instead of fetching or creating them itself.

```ts
// Hard-wired: knows where its dictionary comes from
import { dictionary } from "./load-dictionary";
function annotate(word: string) { return dictionary.get(word); }

// Injected: knows only the interface
function annotate(word: string, dictionary: StressDictionary) { return dictionary.get(word); }
```

The picture: a lamp wired into the wall can only use that wall; a lamp with a plug works with any socket.

What it buys you:

1. **Testability.** A test passes a tiny stub instead of loading a huge file.
2. **No hidden side effects on import.** Nothing is loaded just because a file was imported.
3. **Swappable parts.** Replace the implementation (a cache, a database) without touching the code that uses it.
4. **Wrappers.** A cache can be an object with the *same* interface that wraps another one:

```ts
function withCache(inner: StressDictionary): StressDictionary {
  const memory = new Map<string, number | undefined>();
  return {
    size: inner.size,
    get(word) {
      if (!memory.has(word)) memory.set(word, inner.get(word));
      return memory.get(word);
    },
  };
}
```

The place where the real parts are created and connected is called the **composition root**: usually a program's startup file. Frameworks such as NestJS automate this wiring with a "DI container", but the idea is the same: parameters.

## 5. Validate at the boundary, then trust the inside

Data entering your program from outside (a file, a user, a network request) cannot be trusted, and TypeScript types cannot check it, because types vanish at runtime.

- Validate it **once, where it enters**, with checks that run at runtime.
- Inside, functions trust their inputs, without re-checking everywhere.
- Order checks from cheap and structural to detailed, so later checks can assume earlier ones passed.
- Even data you wrote yourself earlier (a generated file) crosses a boundary when it is read later: it might be old, damaged or made by an older version. A single cheap sanity check there is worth it.

**Fail fast, with a useful message.** When data is wrong, stopping with a clear error ("Invalid stress index 99 for 'молоко'; rebuild the dictionary") is far better than producing quietly wrong output. A build step should be strict. A user-facing server should reject bad requests with a clear `4xx` error and keep running.

## 6. Make decisions with evidence

- **Measure before optimizing.** A famous saying calls premature optimization the root of much evil. Optimizing something that is not the bottleneck wastes time and adds complexity.
- **Keep your options open cheaply.** A seam (an interface) in the right place turns a future switch (hash table to trie, file to database) into a small change instead of a rewrite.
- **Write down decisions and their reasons.** "We chose X because of Y, and we would revisit it if Z" saves future you from redoing the analysis.
- **YAGNI** ("you aren't gonna need it"): do not build features for hypothetical needs. Build what the current step needs, with a seam where the next need will probably appear.

## 7. Contract first

When two parts of a system must talk (an API and its clients), agree on the **contract** first: the exact shapes of requests and responses, the limits, and the errors. Writing the contract as shared types means the compiler flags both sides when it changes. Design contracts so they can **grow**: adding a field to an object does not break existing users, while changing a bare value into an object does.

## Common mistakes

- Functions that quietly read global state or do I/O in the middle of logic.
- Re-validating the same thing in every function, or never validating at all.
- Swallowing errors and returning a default, so a corrupt input produces wrong output with no warning.
- Hard-wiring a concrete implementation where an interface would do.
- Optimizing by guess.

## Practice

1. Is a function that reads the current time pure? Why or why not?
2. Name two benefits of passing a dictionary into a function instead of importing a global.
3. Where should a program check that a JSON request body has a `text` string?
4. What does "composition root" mean?
5. Why is it better to return `{ result: "..." }` than a bare string from an API?

**Answers.** (1) No: the same call gives different results at different times (a hidden input). (2) Easier tests and swappable implementations (also no loading on import). (3) At the boundary, in the request handler, before the logic runs. (4) The one place where the real parts are created and connected. (5) You can add fields later without breaking existing clients.

## Where it appeared in Udarenie

`parseLine` (pure and strict), `shouldMarkStress` as a separate rules module, the injected `StressDictionary`, `loadDictionary` as the wiring point, the boundary check on stress indexes, `createApp(dictionary)` versus `server.ts`, and the shared API contract.
