# Chapter 04: Async code and Node.js

## Why this matters

Reading a file, calling a server or waiting for a database takes time. Programs that stop and wait are slow and unresponsive. Async code lets the program do other work while waiting, and it is everywhere in Node.js. It also explains a key limit of servers (one thread) that shapes API design.

## 1. The event loop in one picture

JavaScript runs your code on **one thread**: one thing at a time. Slow operations (disk, network) are handed to the system, and when they finish, their results are queued and picked up when the thread is free.

Two consequences:

- Waiting on a file or network does **not** block other work.
- **Heavy computation does block.** While a function crunches numbers for 2 seconds, nothing else runs: a server cannot answer other requests. This is why a server limits the size of one request, and why very large jobs are split into chunks or moved to worker threads.

## 2. Promises and `async` / `await`

A **Promise** is a ticket for a result that will arrive later. It is *pending*, then *fulfilled* (with a value) or *rejected* (with an error). A restaurant is the usual picture: you get a ticket, and you wait to be served.

```ts
import { readFile } from "node:fs/promises";

async function load(path: string): Promise<string> {   // async: this function returns a Promise
  const text = await readFile(path, "utf8");            // await: pause here until the Promise is done
  return text.trim();
}
```

The rules:

1. `await` only works inside an `async` function (or at the top level of an ES module).
2. An `async` function **always returns a Promise**, even if you `return` a plain value. Its type is `Promise<T>`.
3. Forgetting `await` is a classic bug: you get the Promise object itself (`Promise { <pending> }`) instead of the result.
4. Errors in awaited code can be caught with ordinary `try`/`catch`.

```ts
try {
  const text = await load("missing.txt");
} catch (error) {
  console.error("could not load", error);
}
```

Running things at the same time:

```ts
const [a, b] = await Promise.all([load("a.txt"), load("b.txt")]);   // both start together
```

A script's entry point often wraps its work in a function so `await` has an `async` function to live in:

```ts
async function main() { /* ... await things ... */ }
main().catch((error) => { console.error(error); process.exit(1); });
```

`process.exit(1)` ends the program with a **failure code** (non-zero), which tools and build pipelines use to detect that something went wrong.

## 3. Streams: data in pieces

A 70 MB file read into one string uses 70 MB or more of memory. A **stream** delivers it in small chunks, so memory use stays small whatever the file size.

```ts
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

const lines = createInterface({ input: createReadStream("big.txt") });
for await (const line of lines) {        // for await: one line at a time
  // process line
}
```

**Backpressure** is the problem of a fast producer and a slow consumer: if you do not slow down the reader, data piles up in memory. `pipeline(...)` from `node:stream/promises` connects streams and handles backpressure and cleanup for you.

## 4. Generators

A **generator** is a function that hands out values one at a time with `yield`, pausing in between.

```ts
function* count() { yield 1; yield 2; yield 3; }
async function* lines() { for await (const l of source) yield transform(l); }   // async version
```

Generators fit streams well: an `async function*` can read, validate and convert records lazily, and `pipeline` can connect it directly to an output file.

## 5. Safe file writing

- **Verify before you write.** Check a download's checksum in memory and only then save it, so a bad file never lands on disk and gets trusted later.
- **Write to a temporary file, then rename.** `rename` is effectively atomic: readers see either the old complete file or the new complete file, never a half-written one. On failure, delete the temp file.
- A **checksum** (SHA-256) is a fingerprint of a file's exact bytes: `createHash("sha256").update(bytes).digest("hex")`. Pinning a download to a specific version *and* a checksum makes a build reproducible.

## 6. Node specifics you will meet constantly

| Topic | What to know |
|---|---|
| Built-in modules | Import with the `node:` prefix: `node:fs/promises`, `node:path`, `node:url`, `node:crypto`, `node:zlib` |
| ES modules | `"type": "module"` in `package.json` enables `import`/`export` |
| Paths | Resolve paths from the **file's own location**, not from the folder where the command was started: `fileURLToPath(new URL("../data/x.txt", import.meta.url))`. `import.meta.url` is the address of the current file. |
| Joining paths | `join` from `node:path` uses the right separator for the operating system |
| Environment variables | Settings supplied from outside the code: `process.env.PORT`. Use `?? default` for a fallback, and `Number(...)` to convert text. |
| `fetch` | Built into modern Node (version 18 and later) |
| `Buffer` | Node's type for raw bytes |

Using the file's own location for paths is the difference between code that works only in your terminal and code that works from anywhere.

## Common mistakes

- Forgetting `await`.
- Using `await` in a function that is not `async`.
- Blocking the event loop with long computation in a server.
- Reading a huge file into memory when a stream would do.
- Resolving paths relative to the current working folder.
- Writing output directly to its final name and leaving a corrupt file after a crash.
- Ignoring errors from a Promise (an unhandled rejection).

## Practice

1. What does an `async` function return when it says `return 5`?
2. Why is a request-size limit part of the design of a Node server?
3. What is the advantage of writing to a temporary file and renaming?
4. Why resolve a data file's path with `import.meta.url` instead of `"data/file.txt"`?
5. What is wrong with `const text = readFile("a.txt");` followed by `text.length`?

**Answers.** (1) A Promise that resolves to 5. (2) One long request blocks every other request because there is one thread. (3) A failure never leaves a half-written file under the final name. (4) The relative path depends on where the command was started; the other works from anywhere. (5) Missing `await`: `text` is a Promise, which has no `length`.

## Where it appeared in Udarenie

The download-and-verify script, the streaming dictionary build with a generator and `pipeline`, `loadDictionary`, the temporary-file-then-rename write, `process.env.PORT` for the server, and the request-size limit.
