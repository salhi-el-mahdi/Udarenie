# Udarenie: the dictionary pipeline

Concepts, code and decisions for `packages/stress-engine`. Written 28 October 2026.

Udarenie adds stress marks to Russian text. The hard part is not the algorithm, it is the **data**: about 3 million word forms, each with a stress position. This document explains how that data gets from a public dataset into the engine, why each piece is built the way it is, and what we would change if the project grows (EPUB and PDF books, an API, more languages features).

---

## 1. The big picture

The work is split into two moments: **build time** (run by hand, rarely) and **run time** (every time the engine starts). All the slow, careful checking happens at build time, so run time can stay simple and fast.

```
BUILD TIME (pnpm build:dictionary)                     RUN TIME (engine starts)

GitHub dataset ──download──▶ data/raw/ru-stress-dict.gz
 (pinned commit,                    │ unzip + stream, one line at a time
  SHA-256 verified)                 ▼
                              parseLine  (validate + convert)
                                    │
                                    ▼
                    data/generated/ru-stress.tsv ──read──▶ loadDictionary
                     (sorted; "word<TAB>index" per line)         │
                                                                 ▼
                                              createBinaryDictionary  (binary search)
                                                                 │  passed in as a parameter
                                                                 ▼
                                     annotateText(text, dictionary) ──▶ annotated text
```

Folder roles in the package:

| Folder | Purpose |
|---|---|
| `src/` | Code that ships as the engine. |
| `src/__tests__/` | Tests, kept apart from product code (a future build can exclude them). |
| `src/__tests__/helpers/` | Shared support code for tests. It is not a test itself and must not end in `.test.ts`. |
| `scripts/` | Developer tools run by hand (the dictionary build). Never shipped to users. |
| `data/raw/` | Downloaded input. Git-ignored, rebuildable. |
| `data/generated/` | The dictionary file the engine reads. Git-ignored, rebuildable. |

---

## 2. The source data

The dictionary comes from `eugenysilin/russian-ukrainian-stress-data`, which is derived from Wiktionary.

- About **3.0 million word forms**, one stress position per word, in the file `ru-stress-dict.gz` (9.7 MB zipped, 72 MB unzipped).
- Each line is `word<TAB>position`. The position counts **letters from 0 and points just after the stressed vowel**. For «молоко» it is `6`.
- We store a different number: the **index of the stressed vowel itself** (`5` for «молоко»). The build script subtracts 1. One convention, converted in one place.
- The download is **pinned** to a specific commit (`43f8dbb2b1af21350ec8d4109055de2dab06dc0f`) and checked against a **SHA-256** fingerprint, so the dictionary cannot change silently.

An audit of the whole file showed: every word is lowercase Cyrillic, hyphens appear only between letters, there are no duplicates, the file is already sorted by byte order, 66,827 entries contain a hyphen, 6,462 words have a single vowel, and 107,847 of the 115,006 entries that contain `ё` are stressed on it (the other 7,159 have their main stress on a different vowel, see section 8.3).

---

## 3. Stage 1: `parseLine` (validate and convert one line)

A bad dictionary entry would put a wrong mark in every text containing that word, silently and forever. So the build is **strict**: if any line is wrong, stop and name the line.

`parseLine` is a **pure function**: it takes a string and returns a result or throws. No files, no network. That makes it trivial to test.

```ts
const vowels = new Set(["а","е","ё","и","о","у","ы","э","ю","я"]);

export function parseLine(line: string): { word: string; index: number } {
    const parts = line.split("\t");
    if (parts.length !== 2) throw new Error(`Malformed line: ${line}`);

    const [word, position] = parts;
    if (!/^\d+$/.test(position)) throw new Error(`Invalid position "${position}" in line: ${line}`);
    if (!/^[а-яё]+(?:-[а-яё]+)*$/u.test(word)) throw new Error(`Invalid word "${word}" in line: ${line}`);

    const datasetPosition = Number(position);
    if (datasetPosition < 1 || datasetPosition > word.length) throw new Error(`Out of bounds position ${datasetPosition} in line: ${line}`);

    const index = datasetPosition - 1;
    if (!vowels.has(word[index])) throw new Error(`Position ${datasetPosition} does not point to a vowel in line: ${line}`);

    return { word, index };
}
```

The checks run from cheap and structural to detailed, so each later check can assume the earlier ones passed: shape of the line, then the number, then the word, then the range, then the vowel.

The vowel check is the strongest safeguard. After the off-by-one conversion, the letter at the index **must** be a vowel. If the conversion were wrong, nearly all 3 million lines would fail instantly. Run over the real data, `parseLine` reports zero failures in about 2 seconds.

---

## 4. Stage 2: the build script (`scripts/build-dictionary.ts`)

Two jobs: get a **verified** raw file, then convert it.

### 4.1 `ensureRawFile`: download once, trust nothing

1. Create `data/raw/` if needed.
2. If the file already exists, compute its SHA-256. A match means done.
3. Otherwise download it into memory, check the fingerprint, and only then write it to disk.

Verifying **before** writing matters: a bad download never lands on disk, so the next run cannot mistake it for a good file. Paths are resolved from the script's own location (`new URL("../data/raw", import.meta.url)`), not from the folder the command was started in.

### 4.2 `convertDictionary`: stream, validate, write safely

The unzipped file is 72 MB, so it is **streamed**: read a line, convert it, write it, forget it. Memory stays small however large the data gets.

```ts
async function* convertedLines() {
  const input = createReadStream(rawFile).pipe(createGunzip());
  const lines = createInterface({ input, crlfDelay: Infinity });
  let previousWord = "";

  for await (const line of lines) {
    const { word, index } = parseLine(line);
    if (word <= previousWord) throw new Error(`Words are not in strictly increasing order at: ${line}`);
    previousWord = word;
    yield `${word}\t${index}\n`;
  }
}

await pipeline(convertedLines(), createWriteStream(tempFile));
await rename(tempFile, OUTPUT_FILE);
```

- **A generator** (`async function*` with `yield`) hands out one converted line at a time. `pipeline` connects it to the output file and handles the case where the writer is slower than the reader (backpressure).
- **A temp file, then `rename`**: output goes to `ru-stress.tsv.tmp` and is renamed only when everything succeeded. A failure on line 2,000,000 leaves the previous good file untouched and deletes the temp file.
- **The ordering check** protects the next stage: binary search only works on sorted data.

Result: `data/generated/ru-stress.tsv`, 3,015,599 lines, about 72 MB.

---

## 5. Stage 3: the runtime dictionary (`binary-dictionary.ts`)

The engine needs `get(word)` to return the stress index or `undefined`.

```ts
export interface StressDictionary {
    get(word: string): number | undefined;
    readonly size: number;
}
```

`createBinaryDictionary(bytes: Buffer)` keeps the file as **one Buffer of raw bytes** and builds a small index (a `Uint32Array`) of where each line starts. It never creates 3 million JavaScript strings.

- **Pass 1** counts the lines (so the index array can be sized). **Pass 2** records each line's start.
- **`get(word)` is a binary search.** Because the file is sorted, open the middle line, compare, throw away the half that cannot contain the word, repeat. For 3 million lines that is about 22 steps.
- Comparison uses `Buffer.compare` on **bytes**, which matches the byte order the file was sorted in. Cyrillic letters take 2 bytes each in UTF-8, so positions in this file are byte positions.

Worked example on `а-ля, кто-то, молоко, русский` searching for «молоко»: the middle is line 1 («кто-то»), which sorts before the key, so continue in the right half; the next middle is line 2: found.

The function takes the **bytes as a parameter** rather than a file path. That is why tests can use a four-line fixture and never need the 72 MB file.

---

## 6. Why binary search and not a hash table?

A hash table (a JavaScript `Map`) has O(1) lookups and is much faster per lookup. We chose binary search anyway, for **startup and memory**, and checked that it holds up at book scale. All numbers below come from one test machine and from synthetic books (words drawn from the real dictionary with a realistic frequency distribution), so treat them as orders of magnitude.

### 6.1 The costs

| | `Map` (hash table) | Binary search on raw bytes |
|---|---|---|
| Startup | about 4.1 s | about 0.4 s to 2 s (varies by machine) |
| Extra memory | about 240 MB | about 85 MB (the 72 MB file plus a 12 MB index) |
| One lookup | 0.18 µs | 3.2 µs |

A `Map` has to create 3 million strings and entries before the first lookup, and every process that starts pays that cost. Binary search works directly on the bytes.

### 6.2 Book scale

| Workload | Binary search | `Map` | Binary + cache |
|---|---|---|---|
| 400,000 words (a very long book), realistic text | 2.1 s | 0.5 s | 0.9 s |
| 400,000 words, worst case (no repeated words) | 2.8 s | 0.8 s | no gain |
| 2,000,000 words (about five long books) | 10.9 s | 3.4 s | 2.5 s |

Tokenizing alone costs about 80 ms for the 400,000-word book, so lookups are the dominant cost. What this means for the planned clients:

- A whole 800-page book in about 2 seconds is fine, especially as a background job. Parsing an EPUB or extracting text from a PDF will cost more.
- A reader app annotates a page or chapter at a time. A 400-word page costs about 1.6 ms.
- Real books repeat words constantly, so a cache of repeated words brings binary search close to `Map` speed without the memory bill.

**Decision: keep binary search.** Revisit it with measurements on real books, not guesses.

### 6.3 Intermediate options (what we can switch to, and when)

Because the engine depends only on the `StressDictionary` interface (section 7), any of these replaces or wraps the dictionary without touching the engine.

1. **A per-job cache (a wrapper).** A dictionary that remembers answers it already computed. Cheapest improvement; cut the 400k-word time from 2.1 s to 0.9 s in our test. In a long-running server keep it **bounded** (for example evicting least-recently-used words) so it cannot grow forever. It gives nothing on text with no repeated words.
2. **A small cache of very frequent words** in front of the big dictionary. Common words («и», «в», «не», «что») make up a large share of any text.
3. **A hash index over the same bytes.** Built by the build script and stored in the file, so lookups become O(1) without creating JavaScript strings. More work than a cache; worth it only if measurements show lookups as the bottleneck.
4. **A trie, DAWG or finite-state transducer.** Compact structures that share common word endings, which suits Russian inflection very well. This is how spell-checkers store large word lists. It is the most work and the most compact and fast option.
5. **A database such as SQLite.** Good if the data ever needs updates, user words or queries beyond exact lookup.
6. **Sharing the dictionary across worker threads.** A buffer-based dictionary can live in a `SharedArrayBuffer` so several threads (for example one per chapter) use the same memory, while a `Map` would be copied into each thread. This is an advanced option for later.
7. **Just use a `Map`.** Perfectly reasonable if memory and startup stop mattering (a single long-lived server with plenty of memory). The interface makes this a one-file swap.

**When to revisit:** if profiling real EPUB or PDF jobs shows dictionary lookups dominating the time, add option 1 first, then 2, and only then consider 3 or 4.

---

## 7. Dependency injection

A **dependency** is something a function needs to do its job. Before, `annotateWord` grabbed its dictionary from a global (`import dictionary from "./load-dictionary"`). Now it **receives** the dictionary as a parameter. A lamp wired into the wall can only use that wall; a lamp with a plug works with any socket.

```ts
annotateWord(word: string, dictionary: StressDictionary): string
annotateText(text: string, dictionary: StressDictionary): string
```

What it buys the project:

1. **Small tests.** A test passes a dictionary with a few words instead of loading 72 MB. The helper `dictionaryFromEntries({ русский: 1, язык: 2 })` builds one from a readable object (it sorts the keys and produces the real file format, because binary search needs sorted data).
2. **No hidden loading.** Importing the engine does not read a file as a side effect. Loading happens once, in one place.
3. **Swappable parts.** Anything with the shape `{ get, size }` works: the binary dictionary, a `Map`, a cached wrapper, or a dictionary that adds the user's own words. The cache from section 6.3 is just another `StressDictionary` that wraps one.
4. **One place that wires things together.** `loadDictionary` is that place: it knows where the file is and how to read it. Applications call it at startup and pass the result into the engine.

```ts
export async function loadDictionary(filePath: string = DEFAULT_PATH): Promise<StressDictionary> {
    let bytes: Buffer;
    try {
        bytes = await readFile(filePath);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            throw new Error(`Dictionary file not found: ${filePath}\nRun: pnpm --filter @udarenie/stress-engine build:dictionary`);
        }
        throw error;
    }
    return createBinaryDictionary(bytes);
}
```

`DEFAULT_PATH` is resolved from the module's own location, so it works from any working folder. `async`/`await` is needed because reading a file takes time and returns a Promise (a "ticket" for a result that will arrive).

NestJS has a DI container, which is the same idea with the wiring automated. Nothing here is wasted if the project moves there.

---

## 8. The engine

### 8.1 The tokenizer (lossless)

`tokenize` splits text into words, punctuation, whitespace and a catch-all, and **joining the tokens always reproduces the input exactly**.

```ts
const WORD = /[А-Яа-яЁё\u0301]+(?:-[А-Яа-яЁё\u0301]+)*/;
// tokens: a word | one punctuation mark | a run of whitespace | any single character
```

- A hyphen belongs to a word only **between letters**: letters, then zero or more groups of (hyphen, letters).
- The last alternative, any single character, is what stops `«`, `—`, digits and Latin letters from being silently dropped.
- The combining accent U+0301 is part of the word pattern, so an already-stressed word stays one token and is not marked twice.
- `isWord` is built from the same pattern, anchored with `^` and `$`, so the two cannot drift apart.

### 8.2 `annotateWord`

```ts
export function annotateWord(word: string, dictionary: StressDictionary): string {
  const stressIndex = dictionary.get(word.toLowerCase());

  if (stressIndex !== undefined) {
    const letter = word[stressIndex];
    if (letter === undefined || !isVowel(letter)) {
      throw new Error(`Invalid stress index ${stressIndex} for "${word}". The dictionary file may be corrupt or outdated; rebuild it with build:dictionary.`);
    }
    return shouldMarkStress(word, stressIndex) ? applyStress(word, stressIndex) : word;
  }

  if (word.includes("-")) {
    return word.split("-").map((part) => annotateWord(part, dictionary)).join("-");
  }
  return word;
}
```

- **Lookup uses the lowercase word; the mark is applied to the original**, so «Русский» and «РУССКИЙ» keep their casing with no case-restoring code. Lowercasing Cyrillic does not change string length, so the index stays valid.
- **Boundary check.** `parseLine` validated the file when it was built, but the engine reads it later and it could be an old or damaged file. One cheap check per word (the stressed letter must be a vowel) catches bad data at the point where it enters the engine. After that, inner functions trust their inputs.
- **A found entry ends the lookup.** If the whole word is in the dictionary but the rules say "do not mark it", we return it unchanged. We do **not** fall through to the hyphen fallback, or the parts would receive marks the dictionary never asked for (this matters for hundreds of hyphenated words stressed on `ё`).
- **Hyphenated words:** look up the whole token first (the dictionary contains tens of thousands of hyphenated entries); only if it is missing, annotate each part separately.

### 8.3 Display rules (`stress-policy.ts`)

Two rules decide whether to show a mark. They are presentation choices, not facts about the language, so the data is left untouched:

1. **Never mark `ё`.** In almost every word it is the stressed vowel, so a mark is redundant (`пришё́л` looks wrong). The `е` spelling of the same word still gets a mark, which is useful because most printed books write `е` for `ё`.

   There are real exceptions to "`ё` is always stressed". In compound words `ё` can carry only a secondary stress («восьмидесятитрёхлетний»), in hyphenated compounds each part has its own stress but the dictionary stores one position («автомат-гранатомёт»), and in a few words such as «ёфицировать» the `ё` is not stressed at all. In all of these the dictionary's single position points at another vowel. The rule above only decides about `ё` itself: that other vowel **is** marked, so the reader sees an unmarked `ё` plus one mark, which is a correct picture. The data comes from Wiktionary and is not proofread, so a few of these entries may also simply be wrong.
2. **Do not mark words with a single vowel** (`мир`, `он`, `дом`): there is only one place the stress can go. Hyphenated words are counted as a whole, so `кто-то` (two vowels) is marked.

They live in a separate small module so they can change or become user settings (for example a learner who wants every mark) without touching the lookup logic.

### 8.4 `applyStress`

Inserts the combining acute accent (U+0301) **after** the stressed vowel. It is a combining character, so it is displayed over the letter before it. Some Windows consoles draw it over the next letter instead; that is a display quirk of the terminal font, not an error in the string. To check, print the code points: for «Это» they are `42d 301 442 43e`, accent right after `э`.

Example results on the real dictionary:

```
Привет, мир!                  →  Приве́т, мир!
Это молоко очень вкусное.     →  Э́то молоко́ о́чень вку́сное.
«Кто-то пришёл», — сказал он. →  «Кто́-то пришёл», — сказа́л он.
```

---

## 9. How the project is tested

- **Test first.** Write the test, watch it fail, then write the code. A test that has never failed has not proved anything.
- **Pure functions are easy to test.** `parseLine`, `shouldMarkStress`, `countVowels`, `tokenize` need no setup.
- **Fixtures and helpers.** A *fixture* is sample data (the four-line dictionary text). A *helper* builds fixtures (`dictionaryFromEntries`). No test needs the 72 MB file.
- **Test the error paths too.** Bad dictionary entries (`{ молоко: 99 }`, `{ молоко: -1 }`, an index that lands on a consonant), a missing file, a malformed line. Wrap the call in an arrow function so the assertion can catch the error: `expect(() => fn()).toThrow()`.
- **Test where the bug would show up.** A test on `annotateWord` never exercises the tokenizer; a stressed-word bug in the tokenizer needs a test on `tokenize` or `annotateText`.

Run them with `pnpm --filter @udarenie/stress-engine test`.

---

## 10. Licensing

The dataset is **CC BY-SA 4.0**. In plain terms: if you *share* the data or something derived from it, you must credit the source, say what you changed, and share your version under the same license. (This is not legal advice.)

The approach that keeps the project clean:

- The **code** gets its own license (for example MIT).
- The **dictionary is never committed**; the build script downloads and generates it, and both data folders are git-ignored.
- A `NOTICE` file credits Wiktionary contributors and the dataset repository, names the pinned commit, and states the change made ("positions converted to the index of the stressed vowel").
- Running an API that uses the data is different from handing the data to others. Distribution (publishing the file, shipping it inside a public download or image) is what triggers the share-alike duty. Re-check this before ever publishing the generated file.

Anything derived from Wiktionary carries the same terms, so switching to another Wiktionary-based source would not change this.

---

## 11. Known limits and next steps

**Data and engine**

- **`ё` restoration.** Texts that write `е` for `ё` could be corrected using `ru-yo-dict.gz` from the same dataset.
- **Words that need context.** One stress per word form is stored, so heteronyms (замо́к / за́мок) and case-dependent stress (the `ru-class-a` and `ru-locative` tables) cannot be decided from the dictionary alone. That is phase 4: a context model of our own, with the dictionary value type kept open for several readings.
- **Coverage gaps.** Short function words such as «я», «и», «в», «не», «на» are not in the dataset and stay unmarked. Words missing from the dictionary are returned unchanged; how the API reports that is still undecided.
- **Single-vowel policy and `ё` policy** may become options.

**Pronunciation hints beyond stress (idea)**

Stress is not the only thing that makes Russian hard to read aloud. One example is `г` pronounced as `в` in the endings «-ого/-его» («его», «красивого») and in «сегодня». Others include `что` read as «што», the unstressed `о` read as `а`, and the `-ться` ending read as «ца». A rule is not enough for the `г` case, because the same letters behave differently by part of speech (adjectives and pronouns versus adverbs like «много» or «строго»), so it needs data. Wiktionary entries carry IPA pronunciation, and the kaikki.org extractions expose it as machine-readable `sounds` data, so a candidate source exists, but whether the Russian extract is complete enough has **not been verified**. If it works, the natural design is a second annotation layer. The engine would then return structured annotations (word, stress index, pronunciation hints) and let each client decide how to draw them, instead of returning only a string.

**Books and clients**

- **EPUB:** an adapter that extracts the text nodes of each chapter, calls the engine, and writes the result back into a new EPUB. The engine stays "text in, text out".
- **PDF:** much harder, because text must be extracted and then written back while preserving layout. It is its own project.
- **Saving an annotated copy** is a job of the layer above the engine (store the generated file, or cache by file fingerprint), not of the engine.
- **Large inputs:** annotate chapter by chapter; the engine is read-only and stateless, so chapters can be processed in parallel.
- **API** in `apps/api`: `GET /health` and `POST /stress`, loading the dictionary once at startup.

---

## 12. Command cheat sheet

```powershell
# run the tests
pnpm --filter @udarenie/stress-engine test

# download, validate and build the dictionary (about 72 MB output)
pnpm --filter @udarenie/stress-engine build:dictionary

# demo on the real dictionary
pnpm --filter @udarenie/stress-engine exec tsx scripts/try-annotate.ts

# before every commit
git status          # read the list; nothing from node_modules or data/
git check-ignore -v node_modules
```

---

## 13. Glossary

| Term | Meaning here |
|---|---|
| **Combining acute (U+0301)** | The invisible character that draws the stress mark over the preceding letter. |
| **Pure function** | Same input always gives the same output, and it touches no files or network. |
| **Stream** | Processing data a piece at a time instead of loading it all into memory. |
| **Generator (`yield`)** | A function that hands out values one at a time. |
| **Checksum (SHA-256)** | A fingerprint of a file's exact bytes. |
| **Binary search** | Finding an item in sorted data by repeatedly discarding half. |
| **Dependency injection** | Passing the things a function needs in as parameters. |
| **Fixture / helper** | Sample data for tests / code that builds that data. |
| **Boundary check** | Validating data once, where it enters your logic, then trusting it inside. |
| **Promise / `async` / `await`** | A "ticket" for a result that will arrive later, and the keywords to wait for it. |
