# Udarenie

Udarenie adds stress marks to Russian text, so learners can read without guessing where the stress falls. It consists of a stress annotation engine and a REST API, with web, EPUB and mobile clients planned.

## Example

Input:

```text
Я люблю русский язык.
```

Output:

```text
Я люблю́ ру́сский язы́к.
```

Written Russian normally omits stress marks, which leaves learners unsure how words are pronounced. Udarenie adds them automatically.

## Features

- Stress marks added to running text, with punctuation, spacing and capitalization preserved
- A dictionary of about 3 million word forms, generated from a public Wiktionary-based dataset
- Fast lookups with a small memory footprint: the dictionary is a sorted file searched with binary search
- Hyphenated words and words that already carry a stress mark are handled
- A REST API with request validation and JSON error responses
- Automated tests for the engine and the API

## Quick start

**Requirements**

- Node.js `v24.14.0` or newer
- pnpm `11.25.0` or newer
- Git

**1. Clone and install**

```bash
git clone https://github.com/salhi-el-mahdi/Udarenie.git
cd udarenie
pnpm install
```

**2. Build the dictionary**

This downloads the source dataset (about 10 MB), verifies it, and generates the dictionary file (about 72 MB) in `packages/stress-engine/data/generated/`. The generated file is not committed, so every fresh clone must run this step.

```bash
pnpm --filter @udarenie/stress-engine build:dictionary
```

**3. Start the API**

```bash
pnpm --filter @udarenie/api dev
```

The API listens on port 4000. Set the `PORT` environment variable to use another port. It loads the dictionary at startup, so step 2 must be done first.

**4. Try it**

In a second terminal:

```bash
curl -X POST http://localhost:4000/stress \
  -H "Content-Type: application/json" \
  -d '{"text": "Я люблю русский язык."}'
```

Expected answer:

```json
{"annotatedText":"Я люблю́ ру́сский язы́к."}
```

Health check: `curl http://localhost:4000/health`

> **Windows PowerShell:** quoting and text encoding need extra care when sending non-ASCII text. See the API documentation.

## Running the tests

```bash
pnpm --filter @udarenie/stress-engine test
pnpm --filter @udarenie/api test
```

The tests do not need the generated dictionary file.

## How it works

1. A build script downloads a pinned version of the dataset, verifies its checksum, validates every line, and writes a sorted dictionary file.
2. When the API starts, it loads that file. Lookups use binary search over the raw bytes.
3. The engine splits text into words and punctuation, looks up each word, and inserts a combining acute accent (U+0301) after the stressed vowel.

More detail: [dictionary pipeline](docs/dictionary-pipeline-v2.md).

## Known limitations

- Words that are not in the dictionary are returned unchanged.
- The dataset stores one stress position per word form, so words whose stress depends on context (such as замок) can be wrong.
- By design, the letter `ё` (always stressed) and words with a single vowel are not marked.

## Project structure

```text
apps/
  api/              Express API (POST /stress, GET /health)
  web/              web app (starter template for now)
packages/
  stress-engine/    tokenizer, stress rules, dictionary build and lookup
  shared-types/     the API contract (request, response and error types)
  shared-utils/     shared helpers (empty for now)
  eslint-config/    shared lint configuration
  typescript-config/ shared TypeScript configuration
docs/               documentation and learning notes
```

## Documentation

- API reference: `docs/api.md` (in progress)
- [Dictionary pipeline](docs/dictionary-pipeline-v2.md)
- [Learning notes (course)](docs/course/00-index.md)

## Status

**In progress**

- Documentation and open-source preparation (README, license, API reference)

**Planned**

- Reporting words missing from the dictionary
- A web playground
- EPUB and PDF support
- A browser extension and a mobile app
- Restoring `ё` where texts write `е`
- Pronunciation hints beyond stress
- Context-based disambiguation of ambiguous words

## License and data

The code is released under the MIT license (see [LICENSE](LICENSE)).

The stress dictionary is generated from [russian-ukrainian-stress-data](https://github.com/eugenysilin/russian-ukrainian-stress-data), which is derived from Wiktionary and licensed under CC BY-SA 4.0. See [NOTICE.md](NOTICE.md) for the attribution and the changes made.