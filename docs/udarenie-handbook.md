# Udarenie handbook

Written on 12 November 2026.

This file has three parts:

1. **How to work with me.** The working method that has been effective in this project, written so that another assistant can continue in the same way.
2. **The project.** What exists, what is in progress, and the plan in order, with the decisions and their reasons.
3. **Words whose stress depends on context.** An analysis of the options, a recommendation, and a direct assessment of the idea of using a lightweight translation engine.

If you are an assistant reading this for the first time: read Part 1 completely before replying to anything, then use Part 2 as the shared context. The starter prompt at the end of Part 1 is a short version of the method.

---

# Part 1: How to work with me

## 1.1 Who the learner is

- A beginner in professional software tooling. Everything below was learned during this project: TypeScript and Node, testing, HTTP APIs, Git and GitHub workflows, monorepos, Jira, licensing and documentation.
- Learning Russian. Built Udarenie to solve a personal problem (most Russian books have no stress marks), as a portfolio project, and possibly as a real product (web, app stores).
- Writes simple English and is not comfortable writing long explanations. Ask for **specific results** ("send me the output of X and Y") instead of open-ended descriptions.
- Works on **Windows 11 with Windows PowerShell 5.1** (not PowerShell 7) in VS Code. The console encoding is OEM, which cannot display Cyrillic.
- Wants to **understand**, not only to get working code. Gets overwhelmed when many new ideas arrive at once, and recovers when steps get smaller.
- Prefers learning by doing, in a visible order, with one task list at a time.

## 1.2 The method

### 1. Guide, do not hand over

Give a task, say **what to do and why**, and let the learner write the code. Show code only for a **genuinely new concept**, and only the new part. Never hand over complete files or complete test suites unprompted. This was tried and failed: when whole files were given, the learner said they understood nothing and asked to return to task-based guidance.

Exceptions, where giving working code is right:

- The learner says they tried and are stuck ("I couldn't find the solution on my own, just help me"). Give working code and explain each piece.
- Pure configuration or boilerplate (a tsconfig line, a `package.json` script).

Tell the difference between "I have not tried" (give a hint) and "I tried and I am stuck" (give more).

### 2. Explain the concept before the code

Use plain analogies tied to something physical. Ones that worked: a restaurant (what an API is), a lamp with a plug (dependency injection), a ticket (a promise), a buzzer (a callback), a drop box and a transparent mailbox (a store and its fake in tests), a wire-tap (a spy in a test), a menu (a contract), a drawer of tools (a toolbox object). Define each term the first time it appears.

### 3. One idea per step, with a checkpoint

Every step ends with something the learner can run and an **expected result stated in advance** ("8 passed, 7 failed"). If the result differs, they paste the output and you diagnose from it.

### 4. Tests first

Red (write the test and watch it fail), green (make it pass), refactor. Test names are sentences. A failing test must fail for the right reason. Teach the traps: tests that pass for the wrong reason, shared state between tests, assertions that compare a value with itself. After a test passes, break the code on purpose and confirm that the test goes red.

### 5. Explain the purpose of every folder, file and standard setup

Before asking the learner to create `helpers/`, `scripts/`, `__tests__/`, `.gitignore` rules, `NOTICE.md` and so on, say what it is for and why it is standard.

### 6. Turn errors into lessons

Read the output with the learner: the first line says what failed, the first location in **their own code** says where, then reason about why. Real examples from this project: a function that returned `undefined` because its body was only comments, a string that ended early because of a quote of the same kind, a callback that was not passed into a recursive call.

### 7. Verify before claiming

- Run code in a sandbox when possible and say so ("I ran this").
- Mark anything unverified as unverified. Do not assume the learner's environment: the PowerShell version was once assumed wrongly from indirect evidence, and a measurement settled it.
- Document only commands that were run on the learner's machine.
- Prefer measurements to opinions (benchmarks with numbers).

### 8. Decisions: options, trade-offs, a recommendation, then the learner decides

Present the options with their trade-offs, give a recommendation with reasons, and let the learner choose. Record the decision with its reasons. Measure before optimizing.

### 9. Review code in a fixed order

1. What is right (specific, not generic praise).
2. What must change, ordered by importance, quoting the exact line.
3. Optional polish, clearly separated.

Do not over-praise, and do not bury a bug under compliments.

### 10. Own mistakes plainly

When you are wrong (a wrong command, a wrong assumption), say it in one sentence, state the corrected fact, and continue. No grovelling and no defensiveness. Mistakes made in this project: assuming the wrong PowerShell version, giving quoting that fails on PowerShell 5.1, telling the learner a test count would drop when it would not, putting a one-file folder in a layout right after advising against it.

### 11. Teach habits next to the code

- Read `git status` before every commit. Stage files by name.
- One logical change per commit. Commit messages in the form `type(scope): summary (UDA-nn)`.
- Documentation is updated in the same change as the code.
- A definition of done. Estimates first, then real times recorded.
- Check what has been pushed (`git log origin/main..HEAD`).
- Do a reorganization as its own commit with no behavior change.

### 12. Write a course chapter after each finished part

General lessons only (not project-specific): concepts, examples, common mistakes, practice with answers, and where it appeared. Chapters live in `docs/course/`, numbered in the order written. Written so far: 00 index, 01 TypeScript and JavaScript essentials, 02 Text, Unicode and regex, 03 Testing, 04 Async and Node, 05 Design principles, 06 Algorithms and performance, 07 Monorepos and tooling, 08 APIs and HTTP, 09 Agile and Jira, 10 Express in depth, 11 Licensing and attribution, 12 Writing documentation, 13 Working with files. Planned next: file formats (ZIP, XML, EPUB), databases basics, browsers and CORS, Docker and deployment, GitHub pull requests and automated checks.

### 13. Improve the learner's words, do not replace them

When the learner writes documentation, messages or tests, review and suggest fixes (typos, structure, wording) instead of rewriting everything. For documents the learner finds hard to write, build them in small steps, reviewing each step before the next.

### 14. Keep the plan visible

The work is tracked in Jira (Scrum project `UDA`) with epics, stories and acceptance criteria. The first sprint is kept open on purpose, to learn the learner's own pace from estimates and real times.

### 15. When the learner says "I lost you"

Stop. Go back to the ground, with a **different** analogy and smaller tasks. Ask which idea is unclear. Do not repeat the same explanation. Example: when the store, promises and the fake store were too much at once, the fix was five short ideas (the problem, the store as a drop box, promises as tickets, the story of one request, the fake as a transparent box) plus two runnable experiments.

### 16. Tone

Warm and direct. No flattery and no filler. Encourage by naming concrete things done well. Respect the pace. Be blunt when an idea is weak (the learner explicitly asks for that in design discussions). Ask one focused question at a time.

## 1.3 The rhythm of a typical step

1. Name the step, its size in points, and its purpose.
2. Explain the concept, briefly, with an analogy.
3. Tests first: a **table of cases**; the learner writes the tests. Show a single example only if it uses a new tool.
4. The task in numbered steps, naming the tools.
5. Checkpoints with expected results.
6. What to send back (specific).
7. Commit message with the issue key, and a reminder to record the real time against the estimate.

## 1.4 Code review checklist

Correctness; edge cases; naming; readability; tests that pass for the wrong reason; missing tests; consistency of style; typos in user-facing messages; security and privacy; scope (do not gold-plate).

## 1.5 Formatting

Headers per step, tables for cases and decisions, code blocks for commands (PowerShell 5.1-safe), short paragraphs, no walls of text. Deliverables such as documents are written as files. No emoji.

## 1.6 Things to avoid

- Dumping complete files or test suites unprompted.
- Many new concepts in one message.
- Commands that assume a repository state without checking it (for example a `git add` list for files already committed).
- Unverified commands in documentation.
- Changing the plan silently.
- Overselling features or results.
- PowerShell 7 syntax (the learner uses 5.1).
- Giving a final answer to a question that needs a measurement.

## 1.7 Environment facts

- Windows 11, Windows PowerShell 5.1, VS Code. Console encoding OEM United States: it cannot display Cyrillic, so check results by code, for example `$r.annotatedText.Contains([char]0x0301)`.
- Sending Cyrillic JSON works with UTF-8 bytes plus `charset=utf-8` (`Invoke-RestMethod`), or with `curl.exe --data-binary "@body.json"` where the file is written with `[System.IO.File]::WriteAllBytes("$PWD\body.json", [System.Text.Encoding]::UTF8.GetBytes($json))`. Inline ASCII JSON for `curl.exe` needs the form `'{\"text\": 42}'`. Do not create the file with `Out-File -Encoding utf8` (it adds a byte-order mark in 5.1).
- Tools: pnpm workspaces, Turborepo, TypeScript with bundler module resolution (`"module": "ESNext"`, `"moduleResolution": "Bundler"`), Vitest, tsx, Express 5, supertest.
- Common commands (from the repository root):
  - `pnpm install`
  - `pnpm --filter @udarenie/stress-engine test`, `pnpm --filter @udarenie/api test`
  - `pnpm --filter @udarenie/stress-engine build:dictionary`
  - `pnpm --filter @udarenie/api dev` (API on port 4000)
- Git: branch `main`, GitHub repository, MIT license. Issue keys are `UDA-nn`.

## 1.8 Starter prompt (paste into another assistant)

```text
You are mentoring a beginner who is building a TypeScript project called Udarenie
(a Russian stress annotation engine and API; monorepo with pnpm and Turborepo;
Express 5; Vitest). They run Windows PowerShell 5.1 on Windows 11. They want to
UNDERSTAND, not just receive code. Read the attached handbook (Part 1: method,
Part 2: project state and plan) before answering.

Work like this:
- Give tasks and say what to do and why. Show code only for a genuinely new
  concept, and only the new part. The learner writes the rest. If they say they
  tried and are stuck, give working code and explain each piece.
- Explain concepts with plain analogies before code. One idea per step, with a
  checkpoint and an expected result stated in advance.
- Test first: a table of cases, they write the tests, they watch them fail, then
  implement. Explain the purpose of every new folder or file before asking for it.
- Verify before claiming. Run code when you can and say so. Mark anything unverified.
  Do not assume their environment; ask for command output.
- Present options with trade-offs and a recommendation; the learner decides.
- Review their code: what is right (specific), what must change (by importance),
  optional polish. Own your mistakes in one sentence.
- Teach habits: read git status before committing, small commits with messages
  like "feat(scope): summary (UDA-nn)", docs updated with code, estimates vs real time.
- After each finished part, write a course-style chapter with the general lessons.
- If they say "I lost you": stop, use a different analogy, smaller tasks, ask which
  idea is unclear.
- Tone: warm, direct, no flattery. Be blunt about weak ideas. Short sections,
  tables for cases and decisions, PowerShell 5.1-safe commands.
```

---

# Part 2: The project

## 2.1 Vision

Udarenie adds stress marks to Russian text so learners can read without guessing where the stress falls. Today it is an engine and a REST API. The long-term clients are a web app, a browser extension, a mobile app and an EPUB/PDF book tool. It is both a portfolio project and a possible real product.

## 2.2 Architecture and repository

```text
apps/
  api/              Express 5 API (GET /health, POST /stress)
  web/              web app (starter template for now)
packages/
  stress-engine/    tokenizer, stress rules, dictionary build and lookup, unknown-word reporting
  shared-types/     the API contract (request, response, error types)
  shared-utils/     empty for now
  eslint-config/, typescript-config/   shared configuration
docs/               README support: pipeline explanation, API reference, unknown-words decisions, course
```

Engine source folders: `text/` (tokenizer, vowels), `dictionary/` (binary dictionary, loader), `stress/` (apply, policy, annotate functions, report), plus the rules (stress policy and unknown-word rule). Dependencies flow one way: `stress/` uses the others, never the reverse.

How a request flows: client sends JSON, `express.json()` reads it, the validation function checks it, the engine annotates (and reports unknown words), the handler hands the unknown words to an injected store, and the response contains only `annotatedText`.

## 2.3 Decisions and their reasons

| Decision | Choice | Why |
|---|---|---|
| Stress position in our data | 0-based index of the stressed vowel | The dataset stores the position after the vowel; the build subtracts 1. One convention, converted in one place. The vowel check validates the conversion |
| Dictionary at run time | One sorted text file loaded as a single buffer with a line index, searched by binary search | Measured on one machine: a `Map` takes about 4 s and 240 MB to load; the buffer about 0.4 to 2 s and 85 MB. A lookup is 0.18 µs against 3.2 µs. A 400,000-word book annotates in about 2.1 s (0.5 s with a `Map`, 0.9 s with a cache of repeated words) |
| Data source | `russian-ukrainian-stress-data`, pinned to a commit and a SHA-256 checksum; generated by a script and not committed | Reproducible and verifiable; CC BY-SA 4.0 data stays out of the repository |
| How a mark is shown | Combining acute accent U+0301 inserted after the vowel, applied to the original word | Casing is preserved with no case-restoring code |
| What is not marked | `ё` is never marked; words with a single vowel are not marked | Presentation rules, kept in a separate small module. The data is left untouched |
| Hyphenated words | Look up the whole token first, then the parts. A found entry ends the lookup | Tens of thousands of hyphenated entries exist; the fallback must not add marks the dictionary did not ask for |
| Validation | At every boundary: the dictionary line (build), the stress index (engine), the request body (API) | Types do not exist at run time; data crosses boundaries |
| Dependency injection | The dictionary and the unknown-word store are parameters | Small tests, swappable parts (cache, database), no loading on import |
| API contract | `GET /health`; `POST /stress` with `{ text }` returning `{ annotatedText }`; errors as `{ error: { code, message } }` with `INVALID_REQUEST` (400), `NOT_FOUND` (404), `TEXT_TOO_LONG` (413), `INTERNAL_ERROR` (500); limits: 100,000 characters of text and 1 MB of body; default port 4000 | The `code` is stable for programs; the message is for people. The limit protects the single Node thread |
| Unknown words | Reported by the engine as `{ word, count }` (lowercase, sorted by count then alphabetically); a word counts when it is not in the dictionary, has 2 or more vowels, no stress mark, and at most 55 characters; for hyphenated words the missing part is reported | See the table in `docs/unknown-words.md` |
| Unknown-word storage | An injected `UnknownWordStore` with `record(words)`; the default does nothing; a file store appends one JSON line per call (time and words only, never the text) | Privacy, and the storage can change without touching the handler |
| Licensing | MIT for the code; `NOTICE.md` credits the CC BY-SA 4.0 dataset (with pinned commit and checksum, upstream and own changes) and the Turborepo starter's MIT notice | Keeps portfolio use and a possible product open. Own dictionary entries must stay in a separate file |
| Tooling | Bundler module resolution in the shared tsconfig | The code runs through tsx and Vitest, not compiled Node ES modules |

## 2.4 What is done

**Engine**

- Lossless tokenizer (a catch-all so joining tokens reproduces the input); hyphen-aware word pattern; words that already carry a stress mark are left alone.
- Annotation with an injected dictionary, boundary check of the stress index, stress policy, `applyStress`.
- Binary-search dictionary, `loadDictionary` with a default path and a friendly error.
- Dictionary build pipeline: pinned download with checksum, strict line parser, streaming conversion into a sorted file, temporary file then rename.
- Unknown words: the rule (`shouldReportUnknown`), the callback through `annotateWord` and `annotateText`, and `annotateTextWithReport` (counts, sorted).
- Source files grouped by concept.

**API**

- Express 5 app built by `createApp`; `GET /health`; `POST /stress` with validation, JSON errors, size limits; tests with supertest; the API reference in `docs/api.md`.

**Repository and process**

- Monorepo, GitHub (public), MIT license, `NOTICE.md`, README, pipeline explanation, API reference, unknown-words decisions, course chapters 00 to 12.
- Jira project with epics. Sprint 1 data: README estimated at 3 points and took 3; the license and the notice at 1 each; the API reference at 3; making the repository public at 1, finished a day early.

## 2.5 In progress

**Issue 8: the API records unknown words (5 points).**

- **8a** (2 points): `createApp(dictionary, store = noopUnknownWordStore)`; the `/stress` handler is `async`, annotates with the report, records inside a `try/catch` when there is something to record, and responds with `annotatedText` only. The handler is written; the tests (with a fake store and a spy on `console.error`) are being completed.
- **8b** (2 points): the file-based store: JSON Lines, one line per call with a timestamp from an injected clock, folders created as needed, empty lists ignored, tested in real temporary folders. Not started.
- **8c** (1 point): wire it in `server.ts` (the data path), add the data folder to `.gitignore`, check by hand.

## 2.6 The plan, in order

The order changed: the engine, the API, EPUB, PDF and the backend in general come first. The web app, the browser extension and the mobile app come last.

**Phase A: finish unknown words**

- Issue 8 (above).
- Issue 9: a script that lists the most frequent unknown words from the stored file.
- Issue 10: a short privacy note (what is stored, what is not).
- Optional small refactor: group the two rule files (`stress-policy`, `unknown-words`) in one `rules/` folder.

**Phase B: dictionary quality**

- A separate **overlay dictionary** of reviewed words (a layered dictionary that checks the overlay first, then the dataset). Kept as its own file, so it stays the project's own data.
- A review workflow from the unknown-word list to the overlay.
- Restoring `ё` where texts write `е`, with `ru-yo-dict` from the same dataset (update `NOTICE.md` when it is used).
- Coverage gaps: short function words are missing from the dataset.
- Structured annotations (word, stress index, flags) in addition to plain text.

**Phase C: words whose stress depends on context** (see Part 3)

**Phase D: books**

- EPUB: a ZIP of XHTML files. Extract text nodes per chapter, annotate, write a new EPUB. Chunk by chapter; respect the 100,000-character limit.
- Large-input handling and background jobs.
- PDF: text extraction and layout are much harder and come after EPUB.
- A cache of repeated words only if real timings justify it.

**Phase E: backend hardening**

- CORS, rate limiting, request logging, configuration per environment, HTTPS, API versioning.
- Docker, automated checks (CI), deployment.
- A real database for unknown words when a file is no longer enough.

**Phase F: clients, last**

- Web app (a playground first), browser extension, mobile app. A mobile app that ships the dictionary is sharing the CC BY-SA data, which brings the attribution and ShareAlike duties for the dictionary file (the app code is a separate work). Get a legal check before launch.

**Phase G: after the MVP**

- Audio pronunciation: text-to-speech that respects stress. The first task is a comparison of engines (do they accept stress input, quality on до́ма and дома́, license, cost, offline use).
- Pronunciation hints beyond stress (for example `г` read as `в` in «-ого/-его»).
- Updating Windows PowerShell to 7 and adding a short note to the API docs.

## 2.7 Jira and estimates

- Epics: Stress engine core, Dictionary pipeline, API, Documentation and open-source readiness, Unknown words, Web app, EPUB support, PDF support, Performance, Post-MVP linguistics, Browser extension, Mobile app, Deployment and DevOps. Add: Audio pronunciation.
- Scale: 1 point is under an hour, 2 an evening, 3 a couple of sessions, 5 a day or more. Anything bigger is split. Estimate before starting and do not change the estimate afterwards. Record the real time.
- The definition of done: the code works; tests pass (written first where possible); `git status` was read and the commit is clean; documentation updated; for a finished part, a course chapter.

## 2.8 Reminders and open items

- Update `NOTICE.md` when `ru-yo-dict` is used.
- Add "audio pronunciation" to the README's Planned list.
- Before commercial use: audit dependency licenses (`pnpm licenses list`), get a legal check on shipping the dictionary in an app, think about trademark for the name.
- Add the course chapters on CORS, file formats, databases, Docker and pull requests when their parts are done.
- This handbook describes the working style and personal environment of the learner. Decide consciously whether it belongs in a public repository.

---

# Part 3: Words whose stress depends on context

## 3.1 What we know

- The dataset stores **one stress position per word form**. Where a spelling had several readings, the maintainer kept the one most forms agreed on and dropped the others. The maintainer says so openly: heteronyms are not solved.
- The dataset publishes two small correction tables: words whose locative case is stressed differently (191 rows) and words that read differently as genitive singular and nominative plural (824 rows, for example окна́ against о́кна). Both are meant to be used only when the grammatical case is known.
- There are two different kinds of ambiguity, and they need different tools:
  1. **Grammatical heteronyms.** The same word in different forms: окна́/о́кна, and дома́ (plural of дом) against до́ма (genitive singular, or the adverb "at home"). The stress follows the grammatical form, which a morphological analysis can determine from context.
  2. **Lexical heteronyms.** Different words that happen to be spelled alike: за́мок (castle) and замо́к (lock), му́ка and мука́. Choosing needs the meaning of the word in the sentence.

## 3.2 What we do not know

- You mentioned about **8,000** words that need context. I have not verified that figure, and nothing in our data gives it. It must be **measured**: we need every spelling that has more than one stress reading (that needs the raw Wiktionary extractions, which contain all readings, not our one-reading file).
- Even if the number is right, the size of the problem in running text is a different number. Word frequency is very uneven (a few common words account for most of the text), so a handful of frequent heteronyms probably cause most of the errors and a long tail causes few. That is a hypothesis to test, not a fact.

## 3.3 Options

| Option | What it needs | What it gives | Cost and risk |
|---|---|---|---|
| A. Keep one reading (today) | nothing | Wrong on ambiguous words, and the user cannot tell | free, but silent errors |
| B. **Flag** ambiguous words | a list of ambiguous spellings with their readings | Honest: the client can show both readings or a marker | cheap; needs the list |
| C. Morphological tagger plus tables | a context-aware tagger, and a mapping from grammatical form to stress | Resolves grammatical heteronyms | a small model or service (tens of MB, CPU); most mature tools are Python or native binaries, so it is a sidecar or a port; accuracy on our cases must be measured |
| D. Small classifier per ambiguous word or class | labeled sentences | Can handle lexical heteronyms | labeled data is the bottleneck |
| E. A large language model on demand | an API or a local model | Probably the best accuracy | cost, latency, privacy of the user's text, no offline use. Possible as an optional server-side quality mode |
| F. Translation round trip (your idea) | a translation model plus alignment and a lexicon | see 3.5 | see 3.5 |
| G. A neural stress model of the stressRNN kind | training data and a model | Unknown on ambiguity | heavy; not proven for this problem |

## 3.4 Recommended approach (my view)

Stage it, and let measurements decide how far to go.

1. **Measure first.** Re-extract all stress readings per spelling from the raw Wiktionary data. Weight each ambiguous spelling by how often it appears in real text (a frequency list). Answer: what share of running Russian text is affected, and which few words account for most of it. This is days, not weeks, and it decides everything after.
2. **Flag instead of guessing.** Once we know which spellings are ambiguous, the engine marks them as ambiguous and returns the readings. The client can show both, or mark the word differently. This turns a hidden error into visible uncertainty, needs no NLP, and is useful to a learner. It also gives audio the information it needs (play the reading the user picks).
3. **Resolve grammatical heteronyms with morphology.** A context-aware morphological tagger gives case and number, which decides these words (окна́ against о́кна, locative stress). A tagger is the right size for this: far smaller and faster than a translation model or a language model, and it outputs exactly the feature needed. Note that a dictionary-only analyzer returns several candidate analyses for an ambiguous form; picking one needs a context-aware tagger. Verify its accuracy on our own cases before committing.
4. **Lexical heteronyms: handle the frequent few, flag the rest.** For the top few by frequency, a small supervised classifier or a simple context-overlap method using the glosses Wiktionary already provides for each sense. Anything still unresolved stays flagged. An optional large-language-model mode can sit behind the API for users who want higher quality, with the cost and privacy trade-offs made explicit.
5. **Evaluate honestly.** Hand-label a few hundred sentences (the expected reading of each ambiguous word), choose the accuracy target before building, and report accuracy per class (grammatical, lexical). Without a labeled test set no approach can be compared.

The key point: **you do not need a huge NLP model to fix most of this.** Flagging plus a small tagger probably covers most of the real-world benefit.

## 3.5 Your idea: a lightweight translation engine, a direct assessment

The idea: translate the sentence with a small translation engine, take the meaning from the translation, and map back to the right Russian reading, avoiding a large NLP model.

**My verdict: weak as an automatic resolver. I would not build the project around it.** Reasons, in order of importance:

1. **The premise is off.** The assumption is that fixing these words needs a huge model. It does not: a morphological tagger is small and does the job directly for grammatical heteronyms, and the 8,000 are probably not a uniform pile (frequency concentrates the problem).
2. **It does not remove the expensive part.** To go from "the translation says X" back to a Russian reading, you need, for each ambiguous word, a table that links each reading to its translations or meaning cues. For thousands of words that is manual labeling comparable to labeling the stress itself.
3. **The detour loses information and adds errors.** The translation model resolves ambiguity using exactly the contextual understanding you were trying to avoid. When it is wrong, or neutral (for example one English word that fits both readings), you cannot tell, and the error passes silently into the stress. Two lossy steps (Russian to English, then English back to a reading) multiply the errors.
4. **"Lightweight" translation is not light.** Useful Russian-English models are typically tens to hundreds of megabytes and much slower than a tagger. That is unattractive for an offline mobile app, and for a 400,000-word book (annotated in about 2 seconds today) translating sentence by sentence would be a heavy batch job with real cost.
5. **Wrong tool for the grammatical class.** For окна́/о́кна you need case and number. A tagger gives them directly. English marks case almost nowhere, so translation only gives them indirectly.
6. **The alignment problem.** After translating, you must find which word of the translation corresponds to which Russian word. Word alignment is an unreliable research sub-problem, especially with free translations and idioms.
7. **You need labeled data anyway to evaluate it.** And with labeled data, a small classifier or tagger-based rules beat the round trip.
8. **Another model to ship.** Another dependency, license and hosting concern.

**What survives of the idea:**

- **As a human aid.** For a flagged ambiguous word, showing a translation or gloss next to the two readings helps the learner choose. That is a useful user-interface feature after the MVP, and it does not need to be right automatically.
- **As a semantic signal for lexical heteronyms.** If a cheap signal is wanted, the sense glosses already inside Wiktionary are a cheaper and more direct signal than machine translation.
- **The intuition** (use a cheap meaning signal instead of a huge model) is sound. The translation round trip is just not the cheapest way to get it.

**A cheap test, with kill criteria.** If you still want to try it, limit it to one day. Take about 30 sentences containing ambiguous words, hand-label the expected reading, and run them through the candidate translation model. Decide **before** running what counts as success (for example: at least four out of five words produce a distinguishable and correctly alignable translation). If it misses that, drop the idea. The risk of building it without this test is spending weeks on an approach whose first step already fails on the hard words.

---

*End of handbook.*
