# Chapter 07: Monorepos and tooling

## Why this matters

Real projects are made of several pieces (an API, a web app, shared code). Keeping them in one repository, with a clear structure and good habits, is what lets you change them together safely. Most "it doesn't work on my machine" moments are tooling problems, not code problems.

## 1. What a monorepo is

A **monorepo** keeps several related projects in **one repository**. The benefits: one place to clone, shared tooling, and the ability to change a package and its users in a single commit.

The common layout (from the Turborepo starter):

```
repo/
  apps/            programs that run or get deployed (the API, the web app)
  packages/        libraries that apps and other packages import
  package.json     the root: tooling shared by everything
  pnpm-workspace.yaml   says which folders are projects
  turbo.json       the task pipeline
  pnpm-lock.yaml   the single lockfile
  docs/            human-readable documentation
```

## 2. Packages and `package.json`

A **package** is any folder with a `package.json` that has a `name`. Once it does, other projects in the repo can depend on it by name.

```json
{
  "name": "@udarenie/stress-engine",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "test": "vitest run" },
  "dependencies": { },
  "devDependencies": { }
}
```

| Field | Meaning |
|---|---|
| `name` | How other packages refer to it. A scope like `@udarenie/` groups your packages. |
| `private: true` | Prevents accidental publishing to the public npm registry |
| `type: "module"` | Use `import`/`export` syntax |
| `exports` | What `import ... from "<name>"` loads. `"."` is the package itself |
| `scripts` | Named commands run with `pnpm run <name>` |
| `dependencies` | What the code needs **to run** |
| `devDependencies` | Tools used only while developing (test runner, type definitions) |

**A package declares what it uses.** If the API imports Express, Express goes into the API's `package.json`, not the root. Tools used by the whole repo (the task runner, a formatter) go in the root.

## 3. pnpm workspaces

**pnpm** is a package manager: it downloads and links dependencies. In a **workspace**, pnpm treats every package in the repo as one connected set.

- `workspace:*` as a version means "use the copy in this repo". pnpm links the folder directly instead of downloading anything, so edits show up immediately.
- There is **one lockfile** (`pnpm-lock.yaml`) in the root, recording the exact versions installed. Commit it, so everyone gets the same versions.
- Dependencies are stored once and linked, saving disk space and install time.

## 4. Where to run commands

`pnpm install` always installs the **whole workspace**, wherever you run it inside the repo. The habit we use: **work from the root and target packages with `--filter`**. One terminal location, and every command can be copied from anywhere.

| Goal | Command (from the root) |
|---|---|
| Install or refresh everything | `pnpm install` |
| Add a dependency to one package | `pnpm add <pkg> --filter <package-name>` (`-D` for a dev dependency) |
| Add a workspace package as a dependency | `pnpm add "@scope/name@workspace:*" --filter <package-name>` |
| Add a tool to the root | `pnpm add -D -w <tool>` |
| Run one package's script | `pnpm --filter <package-name> <script>` |
| Run one-off tool in a package | `pnpm --filter <package-name> exec <tool> <args>` |
| Run a task in every package | `pnpm turbo <task>` |

Inside a package folder, `pnpm add <pkg>` does the same as the `--filter` form. Both are correct; stay consistent.

## 5. Turborepo

**Turborepo** (`turbo`) runs tasks (`build`, `test`, `lint`) across packages in the right order and **caches** the results, so unchanged packages are skipped. Tasks must be declared in the `tasks` section of `turbo.json`, even if empty, or `turbo <task>` will not know about them.

## 6. TypeScript configuration

Each package has a `tsconfig.json`. A shared base config lives in its own package, and each project extends it:

```json
{ "extends": "@repo/typescript-config/base.json", "include": ["src"] }
```

`include` lists the folders the compiler (and the editor) should check. A folder not listed is checked with default settings, which can cause confusing errors in the editor, such as missing Node types.

Tools you will see: **tsx** runs TypeScript files directly (handy for scripts and development servers); **Vitest** runs tests; neither checks types.

### Module resolution and import extensions

TypeScript must decide how to find the file behind `import ... from "./vowels"`. The `module` and `moduleResolution` settings choose the rules:

| Setting | Rules | Imports of your own files |
|---|---|---|
| `"NodeNext"` | Mirrors how Node.js itself loads ES modules | Need an **explicit extension**: `./vowels.js`, even though the source file is `vowels.ts`. Without it the editor reports error TS2835 |
| `"ESNext"` with `"Bundler"` | Mirrors how bundlers and runners such as tsx, Vitest, Vite and Next.js behave | Extensionless imports are fine: `./vowels` |

Choose by **how the code will really run**:

- Run through tsx, Vitest, or a bundler (Next.js, Vite, esbuild): `Bundler` matches reality, and extensionless imports are the natural style.
- Compiled by `tsc` and then run directly with `node`: `NodeNext` is correct, and the extensions are required, because Node itself will refuse extensionless relative imports.

The editor showing errors while the tests pass means the settings disagree with the tools that actually run the code. Fix the setting, not every import. After changing a `tsconfig`, restart the editor's TypeScript server (`Ctrl+Shift+P`, then "TypeScript: Restart TS Server"), because it caches its settings.

A shared base config affects every package that extends it, so a change there should be a deliberate decision, ideally in its own commit.

## 7. Folder conventions

| Folder | Purpose |
|---|---|
| `src/` | Code that ships |
| `src/__tests__/` | Tests, kept apart from product code (a build can exclude them) |
| `src/__tests__/helpers/` | Shared support code for tests, not tests themselves |
| `scripts/` | Developer tools run by hand; never shipped |
| `data/` | Input and generated data. Large or rebuildable data is git-ignored |
| `docs/` | Documentation for people |

### Where does a new file or piece of code go?

Defaults to apply when nobody tells you:

| What | Where |
|---|---|
| A test | In the package's `__tests__` folder, named after what it tests (`annotate-word.ts` has `annotate-word.test.ts`). A feature that spans several files can get its own descriptive name |
| A test helper or fake used by **one** test file | At the top of that file, above the `describe` |
| A test helper or fake used by **two or more** test files | `__tests__/helpers/` |
| Code that **runs** in a test (creating the app, sending a request, calling the function) | Inside the `it` (or `beforeEach`), never at the top level of the file. Top-level state is shared and leaks between tests. Only read-only fixtures (a test dictionary) belong at the top |
| A type or interface | Next to the code that **owns** it. An interface for an injected collaborator lives with the code that **uses** it (the API's store interface lives in the API) |
| A type shared by two packages (an API contract) | `shared-types`, and only once it is really shared |
| A function shared by two packages | `shared-utils`, and only once it is really shared |
| A developer tool run by hand | `scripts/` |
| Documentation | `docs/` |
| Generated or downloaded data | `data/`, git-ignored |
| A new source file | In the folder of its **concept**, in the package that owns the concern. Ask: who uses it, and what changes together with it? |

Habits: **start local and promote when reused** (moving things is cheap with the editor's refactoring tools, while guessing a shared home too early creates clutter). Other packages import only from a package's entry file; inside a package, use relative paths. File names are kebab-case and match the main thing they export. If you are not sure, put it where it is used, say so in your question ("I'd put it in X, is that right?"), and move it later if needed.

## 8. Git habits that prevent disasters

- **Read `git status` before every commit.** It takes five seconds and is your best protection against committing something you did not mean to.
- **Stage by name** (`git add path/`) rather than `git add .` unless you have just checked that `.gitignore` is working.
- **`.gitignore`** lists what git must never track: `node_modules`, build output, secrets (`.env`), large generated data. Check a rule with `git check-ignore -v <path>`; it prints the matching rule, or nothing if no rule matches.
- A `.gitignore` saved in the wrong **encoding** (UTF-16, which PowerShell's `>>` can produce) is silently ignored. Edit it in an editor and save as UTF-8.
- **Commit messages** follow a convention such as Conventional Commits: `type(scope): summary`, for example `feat(api): add health endpoint`, `fix(stress-engine): keep hyphenated entries whole`, `docs: explain the pipeline`, `chore: update gitignore`, `test:`, `refactor:`. Small, focused commits make history readable and changes easy to undo.
- "LF will be replaced by CRLF" warnings on Windows are line-ending conversions and are harmless.
- Never commit secrets or large generated files. If something huge was committed by accident, tell someone before doing anything else: removing it from history is a delicate operation.

### Reading `git status`, and knowing what is pushed

| Section in the output | Meaning |
|---|---|
| **Changes to be committed** | Staged with `git add`; the next commit will include them |
| **Changes not staged for commit** | Tracked files you modified but have not staged |
| **Untracked files** | New files git does not know yet |
| "Your branch is up to date with 'origin/main'" | You have no commits that the remote lacks, **as far as git last checked** (run `git fetch` to refresh) |

Useful commands:

```powershell
git diff <file>              # what exactly changed in a file (not yet staged)
git log --oneline -8         # the last commits
git log origin/main..HEAD    # commits you have NOT pushed (empty means everything is pushed)
git restore --staged <file>  # unstage a file without losing changes
```

**Commands copied from instructions may not match your situation.** Someone's `git add` list assumes a state you may already have moved past (for example files you committed earlier). Run `git status` first and `git add` only the files it actually lists. If the state surprises you, read it before you act.

## 9. Windows and PowerShell notes

- Quote arguments that contain special characters: `"@repo/typescript-config@workspace:*"`.
- `curl.exe` (with the extension) is the real curl; plain `curl` is an alias for something else in PowerShell. `Invoke-RestMethod <url>` fetches and parses JSON.
- Set an environment variable for one command: `$env:PORT=4001; pnpm ...`.
- `Remove-Item` deletes files; `mkdir` creates folders.
- The console may draw combining accent marks in the wrong place (chapter 02).

## 10. Reading tool errors

Errors have a shape: **what failed**, **where**, and often **why**. Read the first line and the first location that points into *your* code. Common ones here: `ERR_PNPM_...` (pnpm tells you what is missing), "Cannot find module" (a package is not installed or linked, or a path is wrong), "No projects matched the filters" (the `--filter` name does not match any package `name`), `EADDRINUSE` (a port is already in use).

## Common mistakes

- Running a command in the wrong folder.
- Editing the wrong copy of a file (two files with similar names).
- Committing before reading `git status`.
- Putting a dependency in the root when only one package needs it.
- Forgetting to commit the lockfile.
- Assuming a failure is a code bug when it is a tooling problem (a stale install, a missing build step).

## Practice

1. What does `workspace:*` mean, and why use it?
2. Which command adds `vitest` as a dev dependency to a package named `@acme/api`?
3. Why does `git check-ignore -v node_modules` printing nothing mean a problem?
4. What is the difference between `dependencies` and `devDependencies`?
5. Why keep tests in a separate folder from the code that ships?

**Answers.** (1) "Use the copy in this repo"; edits show up immediately and nothing is downloaded. (2) `pnpm add -D vitest --filter @acme/api`. (3) No ignore rule matches, so the folder would show up as untracked. (4) The first is needed to run; the second only while developing. (5) A build can leave tests out, and readers can tell product code from tests at a glance.

## Where it appeared in Udarenie

The `apps/` and `packages/` layout, the engine and `shared-types` packages, adding workspace dependencies with `--filter`, the `test` task in `turbo.json`, the `.gitignore` encoding problem, the commit-message convention, and the scripts and data folders.
