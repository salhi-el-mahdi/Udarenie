# Chapter 09: Agile and Jira

## Why this matters

Writing code is only part of building software. Deciding *what* to build, in *what order*, and knowing *when it is done* is the other part. Agile ways of working, and tools like Jira, are how most software teams answer those questions. Even a solo project benefits: a visible list of work replaces a head full of tasks.

## 1. The idea behind Agile

Agile is a way of working in **small steps with frequent feedback**, instead of planning everything up front and delivering at the end.

- Build a small piece, check it works, learn, adjust.
- Plan in detail only the work that is close. Far-away work is vague and will change.
- Prefer working software over perfect plans.

This fits learning too: each small step teaches you something that improves the next plan.

## 2. Scrum and Kanban

| | Scrum | Kanban |
|---|---|---|
| Rhythm | Fixed-length **sprints** (1 to 2 weeks) | Continuous flow, no sprints |
| Commitment | A chosen set of work per sprint | Work is pulled one item at a time |
| Control | Sprint scope | A **work-in-progress (WIP) limit** on each column |
| Good for | Seeing your real pace, regular goals and reviews | Steady streams of small tasks |

Both use a **board**. A sprint is not a deadline to be defeated. It is a short experiment that tells you how much you can actually finish.

## 3. The vocabulary

| Term | Meaning |
|---|---|
| **Issue** | One item of work in Jira (a "ticket") |
| **Epic** | A large goal made of many issues |
| **Story** | A piece of work that delivers something useful to a person |
| **Task** | Necessary work that is not a user-facing feature |
| **Bug** | Something that is broken |
| **Backlog** | The ordered list of all work not yet started. The top is the most important and best understood |
| **Sprint** | A fixed short period with a chosen set of issues |
| **Sprint goal** | One sentence saying what the sprint should achieve |
| **Board** | Columns showing each issue's state (To Do, In Progress, Done) |
| **Story points** | A rough relative size (1, 2, 3, 5, 8). Optional when working alone |
| **Velocity** | How much work you finish per sprint, which is what you learn from sprints |

## 4. Writing a good story

A common shape:

> **As a** [who], **I want** [what], **so that** [why].

Then add **acceptance criteria**: the specific, checkable conditions that must be true for the story to count as done.

> **POST /stress.** As a client developer, I send Russian text and receive it with stress marks, so I can show it to readers.
> *Acceptance criteria:* valid input returns 200 and the annotated text; a body without `text` returns 400; text over the limit returns 413; automated tests cover all three.

A useful checklist for a good story is **INVEST**: Independent, Negotiable, Valuable, Estimable, Small, Testable. The two that matter most in practice are **Small** (if you cannot finish it in a few days, split it) and **Testable** (if you cannot tell whether it is done, rewrite it).

Splitting example: "Build the API" is an epic. "A health endpoint", "the stress endpoint", "validation and errors" are stories.

## 5. Acceptance criteria vs definition of done

- **Acceptance criteria** belong to **one** story: what makes *this* feature right.
- The **definition of done** is one checklist for **every** story: the quality bar. For example: code works, tests pass (written first when possible), `git status` was read and the commit is clean, documentation updated if needed.

A story is Done only when its acceptance criteria hold **and** the definition of done is met.

## 6. Planning and the sprint rhythm

1. **Backlog refinement:** keep the top of the backlog clear, small and ordered.
2. **Sprint planning:** pick what you can finish, write a sprint goal.
3. **Daily work:** take the top issue, move it to In Progress, finish it, move it to Done. Keep **few things in progress at once**: finishing beats starting.
4. **Sprint review:** what did we actually finish? Does it work?
5. **Retrospective:** what went well, what did not, what will we change? Write down one concrete change.

When estimating, **under-commit**. A sprint that finishes teaches you your real pace. A sprint that overflows teaches you only that you were optimistic. Unfinished issues simply return to the backlog; carrying them over is information, not failure.

## 7. Jira habits

- Give every issue a clear title, a short description and acceptance criteria.
- **Put the issue key in your commit messages** (`feat(api): add health endpoint (UDA-12)`). Even without an integration, `git log --grep "UDA-12"` finds every related commit.
- Optional later: a branch per issue (`feature/UDA-12-health-endpoint`) and a pull request, with the Jira link in its description.
- Keep the board honest: move issues when their state changes.
- Do not over-plan: create stories for the next sprint or two, and leave far-away epics empty until you get there.

## Common mistakes

- Stories too big to finish or too vague to test.
- Committing to more than you can do, then feeling behind.
- Many issues "in progress" and none finished.
- Planning far ahead in detail, then rewriting it all.
- Never marking things Done, so the board stops being trusted.
- Using the tool as a goal. Jira exists to help you finish software.

## Practice

1. Split "Add user accounts" into three stories.
2. Write acceptance criteria for "a health endpoint".
3. What is the difference between acceptance criteria and a definition of done?
4. Why is under-committing in a first sprint a good idea?
5. When is an issue allowed to move to Done?

**Answers.** (1) For example: register with email and password; log in and log out; reset a forgotten password. (2) `GET /health` returns 200 with `{ status: "ok" }`; it reports the dictionary size; a test covers it. (3) The first is specific to one story, the second is one checklist for all stories. (4) It reveals your real pace without a failed sprint. (5) When its acceptance criteria are all true and the definition of done is met.

## Where it appeared in Udarenie

The `UDA` Scrum project with epics matching the roadmap, a first sprint of two stories, the decision not to create stories for far-away epics, issue keys in commit messages, and a definition of done tailored to the project.
