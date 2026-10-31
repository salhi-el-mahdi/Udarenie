# Chapter 10: Express in depth

## Why this matters

A server that works for good requests is easy. A good server is judged by what it does with bad ones: it answers clearly, never crashes, never reveals its insides, and tells the client exactly what to fix. This chapter covers how Express handles requests step by step, and how to build that behavior.

## 1. The request's journey

```
request ──▶ middleware 1 ──▶ middleware 2 ──▶ matching route handler ──▶ response
               │ error           │ error             │ error
               └─────────────────┴───────────────────┴──▶ error handler ──▶ response
no route matched ──▶ "not found" handler ──▶ response
```

- A request passes through **middleware in the order you register it**. Each middleware either answers, or passes the request on.
- The **first** thing that sends a response ends the journey. A handler must send exactly one response.
- If anything throws (or a middleware reports an error), Express skips the rest of the normal chain and goes to the **error handler**.

**Order is the single most important rule.** A body-reading middleware must come before the routes that need the body. A "not found" handler must come after all routes. The error handler comes last.

## 2. Middleware

A middleware is a function that sees every request before the route does. It receives `(req, res, next)`.

```ts
app.use((req, res, next) => {
  console.log(req.method, req.path);   // do something with the request
  next();                              // pass it on (or answer and do NOT call next)
});
```

`app.use(fn)` runs `fn` for every request. Express comes with some built in; `express.json({ limit: "1mb" })` reads a JSON body and puts the parsed object in `req.body`.

Behavior worth knowing (Express 5):

| Request | What `express.json()` does |
|---|---|
| valid JSON with the JSON content type | `req.body` is the parsed value |
| no body, or a different content type | `req.body` is `undefined`, so your code must handle that |
| malformed JSON | an error with `type: "entity.parse.failed"` (status 400) |
| body over the size limit | an error with `type: "entity.too.large"` (status 413) |
| a JSON array or number instead of an object | passes through as is, so you must check it |

## 3. Validate the request

`req.body` is untrusted: a stranger sent it. Check it at the entrance, in one place, before the logic runs (chapter 05). A validation function takes `unknown` and returns the cleaned, correctly typed value, or throws.

```ts
function parseRequest(body: unknown): { text: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) throw /* 400 */;
  const { text } = body as Record<string, unknown>;     // honest: we just proved it is an object
  if (typeof text !== "string") throw /* 400 */;
  if (text.length > MAX) throw /* 413 */;
  return { text };                                      // TypeScript now knows text is a string
}
```

Ideas used here:

- **`unknown`** forces you to prove what a value is before using it.
- **Narrowing:** after a check like `typeof text !== "string"` throws, TypeScript knows the type below it. The order of the checks matters because each one proves something the next needs.
- **Traps:** `typeof null` is `"object"`; arrays are objects too.
- Put the rules in their own file: the handler stays short, and the rules can be tested without HTTP.

## 4. Errors that know their status

Create an error class that carries what the response needs:

```ts
class HttpError extends Error {
  constructor(readonly status: number, readonly code: ApiErrorCode, message: string) {
    super(message);
  }
}
```

Code that detects a problem simply throws `new HttpError(400, "INVALID_REQUEST", "...")`. It does not need to know how a response is built.

## 5. The error handler

One place turns every problem into a response in your contract's shape:

```ts
function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) { /* use its status, code and message */ return; }
  // errors from express.json() have a `type` field: map them to 400 / 413
  console.error(err);                                  // details go to the server log
  // send a generic 500: never the real error
}
```

- Express recognizes an error handler by its **four parameters**. Declare all four even if you do not use `next`.
- Register it **last**, after all routes and other middleware.
- **Never send internal details** to the client: no stack traces, file paths, library names or the original error message. A default Express error page shows exactly those, so replacing it is a security measure as well as a polish.
- Log the real error on the server so you can debug.
- In Express 5, an error thrown in a handler, and a rejected promise in an `async` handler, are both passed to the error handler automatically.

A **not-found handler** is a normal middleware placed after all routes: if a request got that far, no route matched.

```ts
app.use(notFoundHandler);   // after all routes
app.use(errorHandler);      // very last
```

## 6. Writing good error messages

The `code` is for programs; the `message` is for people. A good message:

1. says **what is wrong**,
2. says **what was expected**, ideally with an example,
3. covers every situation that leads to it (one check may catch several different mistakes, such as a missing body, a wrong content type and an array),
4. contains no internal details.

Weak: `Invalid request.` Better: `Request body must be a JSON object like { "text": "..." }, sent with Content-Type: application/json.`

In tests, assert on the **status and the code** (the contract), and only check that the message is a string. A test that compares the exact text breaks every time you improve the wording.

## 7. Reading a crash page

Unhandled errors produce a message and a **stack trace**: the chain of function calls, innermost first.

```
TypeError: Cannot destructure property 'text' of 'req.body' as it is undefined.
    at app.ts:18:17          <-- the first line inside YOUR code is usually the culprit
    at Layer.handleRequest   <-- library internals below: ignore
```

Read the first line (what), then find the first location inside your own project (where). Then ask "which value was not what I assumed?" The `console.log` of that value is the fastest tool for checking.

## 8. Structure of a small API

| File | Job |
|---|---|
| `app.ts` | `createApp(dependencies)`: builds the app, registers middleware, routes and handlers, **does not listen** |
| `server.ts` | Loads real resources, calls `createApp`, calls `listen` on `process.env.PORT ?? 4000` |
| `validate.ts` | Rules for incoming data |
| `http-error.ts` | The error type with status and code |
| `error-handlers.ts` | The not-found and error handlers |
| `__tests__/` | Tests that use `supertest` against `createApp(stub)` |

Building the app in a function that receives its dependencies is what lets tests run it without a network or real data.

## 9. Testing error paths

- Write the failing test first for each bad input: no body, wrong content type, array, missing field, wrong type, `null`, one over the limit, exactly at the limit, empty string.
- Test **boundaries**: the limit itself should pass, one more should fail.
- Make a failure happen on purpose with a **stub that throws**, to test the generic 500.
- Use a **spy** (`vi.spyOn(console, "error")`) to silence the expected log and to check that the error was logged.
- Check that the response never contains the internal error text.

## 10. Things we have not covered yet

CORS (browsers calling your API from another origin), authentication, rate limiting, request logging, configuration per environment, HTTPS, and hiding the `X-Powered-By` header. Each becomes relevant as the API meets real users.

## Common mistakes

- Registering a handler before the middleware it depends on.
- Forgetting that `req.body` can be `undefined`.
- An error handler with three parameters instead of four, so Express never uses it.
- Sending `err.message` or a stack trace to the client.
- Two responses from one handler (forgetting `return` after `res.status(...).json(...)`).
- Messages that say "invalid" without saying what is wrong.
- Testing the exact wording of messages instead of the code.

## Practice

1. Where must the "not found" handler be registered, and why?
2. How does Express know a function is an error handler?
3. A client sends `[1, 2]`. Which of your checks should reject it, and with which status?
4. Why does the handler log the error but send a generic message?
5. What is the first thing to look for in a stack trace?

**Answers.** (1) After every route, because it answers requests that nothing else matched. Before them it would answer everything. (2) It has four parameters, `(err, req, res, next)`. (3) The "must be a plain JSON object" check (arrays are objects), with `400`. (4) The log is for you; the client must never learn internals. (5) The first line inside your own code.

## Where it appeared in Udarenie

`createApp` and `server.ts`, `express.json({ limit })`, the validation file with three rules, `HttpError`, the error and not-found handlers, the 14-test suite for `/stress`, and the curl experiments that showed HTML crash pages leaking file paths.
