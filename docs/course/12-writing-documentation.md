# Chapter 12: Writing documentation

## Why this matters

Code that nobody can understand or run is worth little, and the first thing a stranger sees about a project is its documentation. Good documentation also helps *you*: in three months you will be a stranger to your own code. Writing it is a skill, and the rules are learnable.

## 1. Kinds of documentation

A useful way to think about it separates four needs (this follows the well-known "Diataxis" framework):

| Kind | Question it answers | Example |
|---|---|---|
| **Tutorial** | "Teach me, step by step, by doing" | build your first annotated text |
| **How-to guide** | "How do I do this specific thing?" | how to run the API on another port |
| **Reference** | "What exactly does this do?" | the API documentation: every endpoint, field and error |
| **Explanation** | "Why is it built this way?" | the dictionary pipeline document, with its design decisions |

Mixing them in one page makes all of them worse. A README is mostly a short tutorial (quick start) plus signposts to the others.

## 2. Know your reader

Before writing, decide who reads this and what they already know.

- A visitor deciding whether the project is worth their time: needs a one-line purpose, an example and a quick start.
- A developer using your API: needs an exact reference.
- A contributor: needs how to set up, test and follow conventions.
- You in six months: needs the *why*.

## 3. Rules that make documentation good

1. **Show before you tell.** An example early beats a paragraph of explanation.
2. **Document what exists.** Mark anything planned as planned.
3. **Every command must be copy-pasteable, and you must have run it.** The final test is following your own README in a fresh clone of the repository.
4. **Put steps in the order the reader needs them**, and explain why when the order is not obvious (for example, the API needs the dictionary file to exist before it starts).
5. **Say each thing once.** Duplicated text drifts apart. Link instead.
6. **Keep the front page short.** Details go in separate files.
7. **Use consistent words.** One name per idea.
8. **Short sentences, headings, lists, code blocks.**
9. **State limitations honestly.** It builds trust.
10. **Update the docs in the same change as the code.** Make "documentation updated" part of your definition of done.
11. **Proofread.** Spelling mistakes undermine trust.

## 4. Markdown essentials

```markdown
# Title
## Section
**bold**, *italic*, `inline code`

- bullet
1. numbered step

[link text](https://example.com)
[a file in the repo](docs/api.md)

| Column | Column |
|---|---|
| cell | cell |
```

- A fenced block starts and ends with three backticks; put the language after the first set (`powershell`, `json`, `ts`) for coloring.
- **Relative links** (`docs/api.md`, `LICENSE`) are relative to the file that contains them and work both on GitHub and locally. A link to a file that does not exist is broken: create the target first, or write plain text until it exists.
- To show a code block *inside* a code block, use four backticks for the outer one.
- Preview while you write (in VS Code: `Ctrl+Shift+V`). If everything after some point turns into a code block, a closing fence is missing.

## 5. A README

Answer a stranger's questions, in this order: what is it, why does it exist, how do I run it, how do I know it works, where is more.

Typical sections: title and one-sentence description, an example of input and output, features (what the **user** gets, not internals), requirements, quick start, how to run the tests, how it works (briefly), known limitations, project structure, links to other documents, status, and license.

- The opening sentence says *what it does*, *for whom*, and *what exists*.
- **Features** are benefits ("punctuation and capitalization preserved"), not implementation details ("binary search").
- **Status** has short lists (implemented, in progress, planned). Keep "planned" short and free of dates; details belong in the issue tracker.
- A README that is verified in a fresh clone has few mistakes left.

## 6. API reference

For each endpoint document:

1. Method and path, and one line saying what it does.
2. The **request**: headers, body fields with types, which are required, limits.
3. The **response**: status codes and body, with a real example.
4. The **errors**: the error format and every code, with the situation that produces it.
5. **Examples** a reader can copy (curl, and PowerShell with its quoting and encoding notes).
6. General notes: base address, the port, encoding (UTF-8), size limits.

Generate examples by **running them** and copying the real output. An API document with invented examples is worse than none.

## 7. Documenting decisions

An explanation document records **what was decided, why, what the alternatives were, and when to revisit**. Include numbers when you measured something. This is the document that saves your future self from redoing an analysis.

## 8. Other useful files

| File | Purpose |
|---|---|
| `LICENSE` | Permission to use the code |
| `NOTICE.md` | Credits and conditions for other people's material |
| `CHANGELOG.md` | What changed in each version, for users |
| `CONTRIBUTING.md` | How others can help, and the project's conventions |
| `docs/` | Everything longer than the README |

## 9. Error messages are documentation too

Messages say what is wrong, what was expected, and ideally show an example. A good message can save a user from ever opening your docs (chapter 10).

## Common mistakes

- Documenting what you hope to build instead of what exists.
- Commands never run, so they have small errors.
- Examples that no longer match the code.
- A huge README that says everything and gets read by nobody.
- Links to files that do not exist.
- Writing for yourself instead of the reader.
- Treating documentation as something done "at the end".

## Practice

1. Which of the four kinds is a "how to run the API on another port" page?
2. Why should a README's Features avoid words like "binary search"?
3. How do you check that a README is correct?
4. What should an API reference say about errors?
5. When should documentation be updated?

**Answers.** (1) A how-to guide. (2) Features should describe what the user gets; internals belong in an explanation document. (3) Follow it yourself, line by line, in a fresh clone. (4) The format, every error code, and the situation that causes each. (5) In the same change as the code.

## Where it appeared in Udarenie

The README (rewritten from the starter's), the features-versus-internals discussion, the pipeline explanation document, the `NOTICE.md`, the planned `docs/api.md`, and the improvement of the validation error messages.
