# Chapter 03: Testing

## Why this matters

Tests are code that checks your code. They let you change things without fear: when something breaks, a test tells you at once, instead of a user telling you weeks later. They also shape your design, because code that is hard to test is usually badly structured.

## 1. The anatomy of a test

A test has three parts, often called **Arrange, Act, Assert**:

```ts
import { describe, it, expect } from "vitest";
import { add } from "./add";

describe("add", () => {                       // groups tests about one thing
  it("adds two numbers", () => {              // one behavior, named as a sentence
    const a = 2, b = 3;                       // Arrange: set up
    const result = add(a, b);                 // Act: call the thing
    expect(result).toBe(5);                   // Assert: check the outcome
  });
});
```

Common assertions:

| Assertion | Use |
|---|---|
| `expect(x).toBe(y)` | primitives (strict equality) |
| `expect(obj).toEqual(other)` | objects and arrays (compares contents) |
| `expect(fn).toThrow()` / `.toThrow("text")` | a function throws |
| `await expect(promise).rejects.toThrow("text")` | an async function fails |
| `expect(x).toBeUndefined()` | nothing was found |

To test that something throws, **wrap the call in a function** so the assertion can catch the error: `expect(() => parse("x")).toThrow()`. If you write `expect(parse("x")).toThrow()`, the error is thrown before `expect` can catch it.

## 2. Kinds of tests

| Kind | What it checks | Speed | Example |
|---|---|---|---|
| **Unit test** | One small piece (usually a function) in isolation | milliseconds | a parser given one line, a rule given a word |
| **Integration test** | Several pieces working together, often with something real (a file, a database, HTTP) | slower | the API with the real dictionary file loaded |
| **Smoke test** | A quick check that the system starts and the main path works. It is shallow on purpose. | seconds | a script that imports the packages and prints one result |
| **End-to-end (E2E) test** | The whole system as a user sees it | slowest | a browser opens the web app, pastes text, sees the result |
| **Regression test** | A test added *after a bug* so it never returns | fast | the case that once crashed |

The name "smoke test" comes from hardware: switch it on and see if smoke comes out.

**The testing pyramid:** many unit tests at the bottom (cheap, precise), fewer integration tests in the middle, very few end-to-end tests at the top (expensive, fragile). When a unit test fails you know *where* the bug is. When an E2E test fails you only know *something* is wrong.

**A distinction worth knowing:** a test that sends a request into an Express app using `supertest`, with a fake dictionary, exercises the HTTP layer (routes, status codes, JSON) but not the real data. Teams call that a *route test* or a *light integration test*. A fuller integration test would also load the real dictionary file. Such a test needs a generated file to exist, so it is usually kept separate from the fast unit tests (or skipped when the file is missing).

## 3. Test-driven development (TDD)

The cycle, repeated in tiny steps:

1. **Red:** write a test for behavior that does not exist yet and watch it **fail**.
2. **Green:** write the smallest code that makes it pass.
3. **Refactor:** tidy up, keeping the tests green.

Why watch it fail first? A test that has never failed has not proved that it can detect anything. TDD also forces you to think about the *interface* before the details.

## 4. What to test

- **The happy path:** a normal input.
- **Boundaries:** the edges of a range. If valid positions are 1 to N, test 0, 1, N and N+1.
- **Empty and minimal input:** `""`, an empty list, one item.
- **Invalid input and error paths:** what should happen when the input is wrong? Error handling is code too, and the code that is never tested is the code that breaks.
- **Bugs you found:** turn every bug into a regression test.

Test **behavior** (what the code promises), not **implementation** (how it does it). Tests tied to the internals break whenever you refactor.

A good test is **deterministic** (same result every run), **independent** (does not rely on another test having run), and **fast**. Avoid depending on the clock, the network or random numbers.

## 5. Test doubles: stubs, fakes, mocks

When a piece needs a collaborator (a database, a dictionary, a web service), tests use a stand-in:

- **Stub:** returns canned answers. `{ size: 2, get: () => undefined }` stands in for a dictionary.
- **Fake:** a simplified but *working* implementation, such as an in-memory store.
- **Mock / spy:** records how it was called, so the test can check the calls (Vitest provides `vi.fn()`).

This is only possible because the code **receives** its collaborators as parameters (see chapter 05).

**Fixtures** are sample data for tests. **Helpers** are small functions that build fixtures or simplify setup. They live in a `helpers/` folder and their filenames must not end in `.test.ts`, or the test runner would try to run them as tests.

## 6. Vitest in practice

```powershell
pnpm --filter <package> test        # run everything once
pnpm --filter <package> test:watch  # re-run on every save
```

- Files named `*.test.ts` are found automatically.
- `describe` / `it` / `expect` come from `import { ... } from "vitest"`.
- `it.each` runs the same test over a table of inputs:

```ts
it.each([
  [2, 3, 5],
  [0, 0, 0],
])("adds %i + %i = %i", (a, b, expected) => {
  expect(add(a, b)).toBe(expected);
});
```

- `it.only(...)` runs only that test and `it.skip(...)` skips it. Both are handy while working, and both must never be committed by accident.
- `beforeEach(() => { ... })` runs setup before every test in a group.
- Reading a failure: the output shows the test name, `Expected` and `Received`, and the file and line. A file listed under **Failed Suites** with `0 tests` crashed while *loading* (often an error in setup code at the top of the file), so none of its tests ran.

## 7. Testing an HTTP API with supertest

```ts
import request from "supertest";
import { createApp } from "../app";

it("answers the health check", async () => {
  const response = await request(createApp(fakeDictionary)).get("/health");
  expect(response.status).toBe(200);
  expect(response.body).toEqual({ status: "ok", dictionaryEntries: 2 });
});
```

`supertest` sends the request **straight into the app object**, without opening a network port: fast and no port conflicts. This works because the app is built by a function (`createApp`) separate from the code that starts listening.

## 8. Smoke tests

A smoke test is the shortest possible check that "the pieces connect": a script that imports the packages and prints one result. When you first wire two packages together, run a smoke test **before** writing real code on top, so configuration problems show up in isolation.

## Common mistakes

- Never seeing a test fail.
- Writing the test and the code together so the test just mirrors the code's mistakes.
- A test that depends on a big real file, which makes the whole suite slow.
- Forgetting to wrap a throwing call in a function.
- Leaving `it.only` in the code.
- Testing at the wrong level: a bug in a tokenizer needs a tokenizer test, not only a test one layer up that never reaches it.

## Practice

1. List the boundary values you would test for a function that accepts a percentage from 0 to 100.
2. A test file shows `(0 tests)` under *Failed Suites*. What does that usually mean?
3. What is the difference between a stub and a fake?
4. Why is an end-to-end test a poor first line of defense?
5. You fixed a bug where `""` crashed a function. What test do you add, and what is it called?

**Answers.** (1) -1, 0, 1, 99, 100, 101 (and maybe a non-number). (2) The file crashed while loading, so no test ran; look for a setup error at the top. (3) A stub returns canned answers; a fake actually works, in simplified form. (4) It is slow, fragile, and when it fails it does not tell you where. (5) A regression test that calls the function with `""` and checks the correct outcome.

## Where it appeared in Udarenie

Unit tests for the parser, tokenizer and rules; `dictionaryFromEntries` as a helper; the `{ size, get }` stub; failing tests written first; the `smoke.ts` script; supertest for `/health`. Not yet written: an integration test against the real generated dictionary.
