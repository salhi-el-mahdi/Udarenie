# Chapter 13: Working with files in Node.js

## Why this matters

Sooner or later every program reads or writes a file: a dictionary, a log, a configuration, a downloaded document. Files are where a program's memory survives after it stops. They are also slow, they can be missing, locked or full, and mistakes with them lose data. This chapter explains how files work and how to handle them safely, from the ground up.

## 1. The mental model: a filing cabinet

- A **file** is a named sequence of **bytes** stored on a disk.
- A **folder** (directory) is a drawer that holds files and other folders.
- A **path** is the address of a file: which drawers to open, in what order, to reach it.

```text
C:\Users\anna\project\data\words.jsonl      (Windows)
/home/anna/project/data/words.jsonl         (macOS and Linux)
```

Everything a program does with a file goes through the operating system: your code asks, the system does the work on the disk, and it answers with a result or an error. That request-and-wait nature is why file functions in Node are **asynchronous**.

## 2. Paths

| Kind | Example | Meaning |
|---|---|---|
| **Absolute** | `C:\Users\anna\data\words.jsonl` | The full address, from the root of the disk |
| **Relative** | `data\words.jsonl` | An address from "where I am now" |

"Where I am now" is the **current working directory**: the folder the program was started from. It is the single most common source of "works on my machine" bugs: a relative path means different files depending on where you launched the program.

Safe habits:

- Build paths with the `path` module, never by gluing strings. `join("data", "words.jsonl")` uses the right separator for the operating system (backslash on Windows, slash elsewhere).
- Anchor paths to **the file you are writing** instead of the working directory:

```ts
import { fileURLToPath } from "node:url";
const dataFile = fileURLToPath(new URL("../data/words.jsonl", import.meta.url));
```

`import.meta.url` is the address of the current source file, and `new URL("../data/...", ...)` means "from here, one folder up, then into `data`". It works wherever the program is launched from.

Useful `path` functions:

| Function | What it does | Example result |
|---|---|---|
| `join(a, b, ...)` | Joins parts with the right separator | `join("data", "x.txt")` |
| `dirname(p)` | The folder part | `dirname("a/b/c.txt")` is `a/b` |
| `basename(p)` | The file name | `basename("a/b/c.txt")` is `c.txt` |
| `extname(p)` | The extension | `.txt` |
| `resolve(...)` | Makes an absolute path | |

## 3. What is inside a file: bytes and encodings

A file contains only bytes. **Text** is bytes plus an agreement on how to read them: the **encoding**. The standard is **UTF-8**: ASCII characters take 1 byte, Cyrillic letters 2, many symbols 3, emoji 4.

```text
"тест" + newline  →  5 characters, 9 bytes
```

So:

- Always name the encoding when reading or writing text (`"utf8"`). Without it, `readFile` gives you raw bytes (a `Buffer`), not text.
- The number of characters and the number of bytes differ for non-ASCII text. Offsets inside a file are byte offsets.
- A **BOM** (byte order mark) is an invisible few bytes some tools put at the start of a UTF-8 file. Some readers choke on it. Prefer UTF-8 without BOM.

## 4. The toolbox: `node:fs/promises`

```ts
import { readFile, writeFile, appendFile, mkdir, readdir, rename, rm, mkdtemp } from "node:fs/promises";
```

| Function | Picture | Notes |
|---|---|---|
| `readFile(path, "utf8")` | Read the whole page | Without `"utf8"` you get a `Buffer` of bytes |
| `writeFile(path, text)` | **Replace** the page with new text | Destroys the old contents. Creates the file if it does not exist |
| `appendFile(path, text)` | **Add a line at the end** of the notebook | Keeps what is there. Creates the file if needed |
| `mkdir(path, { recursive: true })` | Make the drawer (and the drawers it sits in) | With `recursive: true` it does not fail if the folder already exists |
| `readdir(path)` | List what is in a drawer | Returns names; the order is not guaranteed, so sort if the order matters |
| `rename(from, to)` | Move or rename | Effectively one step, which is why it is used for safe writes |
| `rm(path, { recursive: true, force: true })` | Throw away a file or a whole folder | `force: true` means "no error if it is already gone". Dangerous: it does not ask |
| `mkdtemp(prefix)` | Create a **new folder with a unique name** | Used for temporary workspaces |

`writeFile` versus `appendFile` is the distinction that matters most: one replaces, the other adds.

There are also synchronous versions (`readFileSync` and friends) that block everything while they work. They are acceptable in a short script at startup, and wrong in a server's request handling (chapter 04: one thread).

## 5. Try it: a runnable experiment

Save this as `experiment-files.mjs` in a scratch folder (not in your repository) and run `node experiment-files.mjs`. It works in a temporary folder and cleans up after itself.

```js
import { writeFile, appendFile, readFile, mkdir, mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = await mkdtemp(join(tmpdir(), "files-lesson-"));
console.log("1. scratch folder created inside the temp folder:", dir.startsWith(tmpdir()));
const file = join(dir, "notes.txt");

await writeFile(file, "first\n");
await writeFile(file, "second\n");
console.log("2. after two writeFile calls:", JSON.stringify(await readFile(file, "utf8")));

await appendFile(file, "third\n");
await appendFile(file, "fourth\n");
console.log("3. after two appendFile calls:", JSON.stringify(await readFile(file, "utf8")));

await mkdir(join(dir, "a", "b"), { recursive: true });
console.log("4. entries in the scratch folder:", (await readdir(dir)).sort());

try { await readFile(join(dir, "missing.txt"), "utf8"); }
catch (error) { console.log("5. reading a missing file fails with code:", error.code); }

try { await readFile(dir, "utf8"); }
catch (error) { console.log("6. reading a folder as a file fails with code:", error.code); }

await writeFile(file, "тест\n");
const bytes = await readFile(file);
console.log("7. 'тест' + newline is", "тест\n".length, "characters but", bytes.length, "bytes");

await rm(dir, { recursive: true, force: true });
try { await readdir(dir); } catch (error) { console.log("8. after rm, the folder is gone:", error.code); }
```

Expected output (I ran it):

```text
1. scratch folder created inside the temp folder: true
2. after two writeFile calls: "second\n"
3. after two appendFile calls: "second\nthird\nfourth\n"
4. entries in the scratch folder: [ 'a', 'notes.txt' ]
5. reading a missing file fails with code: ENOENT
6. reading a folder as a file fails with code: EISDIR
7. 'тест' + newline is 5 characters but 9 bytes
8. after rm, the folder is gone: ENOENT
```

What each line teaches: (2) `writeFile` replaced the first line, so the word "first" is gone; (3) `appendFile` added to the end; (4) `mkdir` with `recursive` made two nested folders in one call; (5) and (6) show the two error codes you will meet most; (7) characters are not bytes.

## 6. Errors

File operations fail in predictable ways, and Node reports **an error with a `code`**:

| Code | Meaning |
|---|---|
| `ENOENT` | No such file or directory ("error, no entry") |
| `EEXIST` | It already exists |
| `EISDIR` | It is a directory, but a file was expected |
| `ENOTDIR` | A part of the path is a file, but a directory was expected |
| `EACCES` / `EPERM` | No permission |
| `ENOSPC` | The disk is full |
| `ENOTEMPTY` | The directory still has contents |

Reading the code:

```ts
try {
  await readFile(path, "utf8");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === "ENOENT") {
    // the file does not exist: explain how to create it
  } else {
    throw error;      // anything else: do not hide it
  }
}
```

**Do not check first, then act.** Code like "if the file exists, read it" has a gap: the file can disappear between the check and the read (this is called a race condition). Instead, just try the operation and handle the error.

## 7. Safe writing patterns

1. **Create the folder first.** `mkdir(dirname(path), { recursive: true })` before writing, so a missing folder is not an error.
2. **Append-only logs.** To record events, add one line at a time with `appendFile`. You never rewrite the file, so a crash cannot corrupt earlier lines.
3. **Write to a temporary file, then rename.** `writeFile` to `name.tmp`, then `rename` to `name`. Readers see either the complete old file or the complete new file, never half of one. On failure, remove the temporary file.
4. **Verify before you write.** Check a download's checksum in memory before saving, so a bad file never lands on disk.
5. **Never overwrite something valuable with something unverified.**

## 8. Choosing a file format

| Format | Good for | Watch out for |
|---|---|---|
| Plain text, TSV | Simple lists, sorted data you search | No structure beyond lines and tabs |
| **JSON** | One structured document | You must rewrite the whole file to change it, and a half-written file is invalid |
| **JSON Lines** (`.jsonl`) | Logs and records added over time | One complete JSON object per line, no commas between lines, no outer brackets |
| CSV | Spreadsheets | Quoting rules are subtle |

**Why JSON Lines for the unknown-word log:** adding a record is a single append; each line stands alone, so a script can read it line by line without loading everything; and a damaged last line cannot hurt the earlier ones. Reading it back:

```ts
const text = await readFile(path, "utf8");
const records = text.trim().split("\n").map((line) => JSON.parse(line));
```

For very large files, read them as a stream (chapter 04) instead of loading everything.

## 9. Concurrency and where data lives

- When several requests write to the same file at once, their writes can interleave. A short single-line append is very unlikely to be torn at small scale, but there is no guarantee. If it matters, serialize the writes (a queue) or use a database. This is one reason a store is hidden behind an interface: the storage can be replaced.
- **Keep application data out of the source tree**, or at least out of version control: a git-ignored `data/` folder, with its location configurable (for example through an environment variable with a default).
- Store only what you need. A file of user data is a privacy responsibility: record words and counts, not their text.

## 10. Testing code that uses files

- **Never write into your repository or a shared place.** Each test gets its own **temporary folder**, created fresh and deleted afterwards:

```ts
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let dir: string;
beforeEach(async () => { dir = await mkdtemp(join(tmpdir(), "myapp-")); });
afterEach(async () => { await rm(dir, { recursive: true, force: true }); });
```

  `tmpdir()` is the operating system's temporary folder (the same one `$env:TEMP` points to on Windows). `mkdtemp` adds a unique name to the prefix, so tests cannot collide. `let dir` is declared at the top but assigned before **every** test, so no test sees another's files.
- Make output deterministic: inject anything that varies (the clock) so the test can check the exact content.
- Test the error paths: a missing file (`ENOENT`), a directory where a file was expected (`EISDIR`).
- To check that something was **not** created, read it and expect the `ENOENT` error.
- Test through the real file system when the file *is* the feature, and use a fake when the file is incidental.

## 11. Walkthrough: a file-based store

This is the function you wrote for the unknown-word log, one statement at a time:

```ts
export function createFileUnknownWordStore(filePath: string, now: () => Date = () => new Date()): UnknownWordStore {
  return {
    async record(words) {
      if (words.length === 0) return;                         // 1
      await mkdir(dirname(filePath), { recursive: true });    // 2
      const line = JSON.stringify({ at: now().toISOString(), words }) + "\n";   // 3
      await appendFile(filePath, line, "utf8");               // 4
    },
  };
}
```

1. Nothing to record, so do nothing. The file is not even created.
2. Make sure the folder exists. `dirname` takes the folder part of the path, and `recursive: true` creates every missing level and tolerates an existing folder.
3. Build **one line**: `JSON.stringify` turns the object into compact text with no line breaks, and `"\n"` ends the line. `toISOString()` writes the time in the standard text form (`2026-01-01T00:00:00.000Z`). `now` is a parameter so a test can give it a fixed time.
4. Add the line at the end of the file, as UTF-8.

If anything fails (a full disk, a directory in place of a file), the returned promise rejects, and the caller decides what to do. In this project the request handler catches it and logs it, so the user still gets an answer.

And what each of your tests proves:

| Test | Proves |
|---|---|
| writes one line | The exact text, including Cyrillic and the timestamp |
| appends | A second call adds a line and does not replace the first |
| creates missing folders | Step 2 works for a path whose folders do not exist |
| does nothing for an empty list | Step 1, and the file is not created (`ENOENT`) |
| rejects when the path is a directory | Errors are not swallowed (`EISDIR`) |

## 12. Editor note: `noUncheckedIndexedAccess`

Your project's TypeScript settings include `"noUncheckedIndexedAccess": true`. It makes `lines[0]` have the type `string | undefined`, because an array might be empty, so `JSON.parse(lines[0])` is flagged in the editor (the tests still run, since Vitest does not check types). Prefer code that does not index at all: `const records = lines.map((line) => JSON.parse(line));`. Use `lines[0]!` (the `!` says "I know this exists") only when you have just checked that it does.

## Common mistakes

- Using `writeFile` where `appendFile` was meant (and losing the earlier data).
- Relative paths that depend on where the program was started.
- Building paths with string concatenation and backslashes.
- Forgetting the encoding, or confusing characters with bytes.
- Checking that a file exists before using it, instead of handling the error.
- Writing into the repository from tests, or leaving temporary files behind.
- Hiding file errors, so the program looks fine while data is lost.
- Committing data files (and private data) to version control.

## Practice

1. What is the difference between `writeFile` and `appendFile`?
2. Why is `path.join("data", "x.txt")` better than `"data" + "\\" + "x.txt"`?
3. A file contains 10 Cyrillic letters and nothing else. How many bytes is it in UTF-8?
4. What does `ENOENT` mean, and how should code react to it when reading an optional file?
5. Why do tests use `mkdtemp` instead of a fixed folder?
6. Why is JSON Lines a good format for a log that grows over time?

**Answers.** (1) The first replaces the whole content, the second adds to the end. (2) `join` uses the correct separator for the operating system and handles extra separators. (3) 20 bytes (2 per letter). (4) The file or folder does not exist; try to read, catch the error, and treat that code as "no data yet" (rethrow other codes). (5) A unique fresh folder per test avoids collisions and leftovers, and keeps the repository clean. (6) Adding a record is a single append, each line stands alone, and a damaged last line cannot corrupt the earlier ones.

## Where it appeared in Udarenie

Downloading and verifying a dataset, streaming a large file through a parser, writing with a temporary file and `rename`, a sorted dictionary file read as bytes, the paths resolved with `import.meta.url`, the file-based unknown-word store with `appendFile` and `mkdir`, and its tests in temporary folders.
