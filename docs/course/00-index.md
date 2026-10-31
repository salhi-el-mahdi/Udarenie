# Udarenie Course: what we learned while building

These chapters collect the **general knowledge** picked up while building Udarenie: ideas you can reuse in any project. They are deliberately not about stress marks or Russian. For the project's own design, see `dictionary-pipeline-v2.md`.

## How to use this course

1. Read one chapter at a time. Each has the same shape: *why it matters*, *concepts*, *common mistakes*, *practice*, *where it appeared in Udarenie*.
2. Do the practice questions **before** reading the answers.
3. Try to explain a concept out loud in your own words. If you cannot, reread that section.
4. Come back to a chapter when you meet the topic again. This is a reference as much as a course.

Suggested location in the repository: `docs/course/`. The `docs/` folder is where human-readable documentation lives (as opposed to code), and the `course/` subfolder keeps learning notes apart from project documentation.

## Chapters

| # | Chapter | Main topics |
|---|---|---|
| 01 | TypeScript and JavaScript essentials | types, interfaces, modules, arrays, errors, type erasure |
| 02 | Text, Unicode and regular expressions | code points vs bytes, combining marks, regex building blocks, lossless tokenizing |
| 03 | Testing | unit, integration, smoke and end-to-end tests, TDD, stubs and fakes, Vitest, supertest |
| 04 | Async code and Node.js | promises, `async`/`await`, the event loop, streams, generators, file paths, environment variables |
| 05 | Design principles | pure functions, dependency injection, validating at boundaries, separating build time from run time |
| 06 | Algorithms and performance | Big-O, binary search, hash tables, trade-offs, caching, benchmarking |
| 07 | Monorepos and tooling | pnpm workspaces, Turborepo, `package.json`, shared packages, git habits |
| 08 | APIs and HTTP | requests and responses, methods, status codes, JSON, Express, contracts |
| 09 | Agile and Jira | stories, acceptance criteria, sprints, definition of done |
| 10 | Express in depth | middleware order, validation, custom errors, error handlers, good error messages |

## Planned chapters

Added after the matching part of the project is finished:

- 11 Browsers and CORS (calling the API from a web app)
- 12 File formats: ZIP, XML and EPUB
- 13 Databases basics (storing unknown words)
- 14 Docker and deployment
- 15 GitHub, pull requests and automated checks

## The rule for growing this course

After each part of the project is finished, a new chapter (or an addition to an existing one) is written with the general lessons of that part. Chapters are numbered in the order they are written.
