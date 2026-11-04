# Chapter 11: Licensing and open-source attribution

> This chapter is a general introduction, not legal advice. For a commercial launch, ask a lawyer.

## Why this matters

Almost every project uses other people's work (libraries, data, templates) and shares its own. Licenses decide what you may do with what you receive and what others may do with what you publish. Getting them right is a basic professional habit, and a missing or wrong license is a visible flaw in a public repository.

## 1. Copyright and why a license is needed

In most countries, copyright arises **automatically** when a work is created. By default it is **"all rights reserved"**: nobody else may copy, modify or distribute it without permission, even if it is public on GitHub. A **license** is the written permission that says what others *may* do. Code with no license is visible but not reusable.

## 2. Permissive and copyleft

| Family | Idea | Examples |
|---|---|---|
| **Permissive** | Do nearly anything, including in closed products, as long as you keep the notice | MIT, BSD, Apache-2.0 |
| **Weak copyleft** | Changes to *this* component must stay open; the rest of your product can be closed | LGPL, MPL-2.0 |
| **Strong copyleft** | Anything built on it must be released under the same license | GPL-3.0 |
| **Network copyleft** | As strong copyleft, and it also applies when the software is offered as a hosted service | AGPL-3.0 |
| **Source-available** | You can read the code, but use is restricted (for example no commercial use). It is **not** open source | BSL, PolyForm |
| **No license** | All rights reserved | |

## 3. Reading the MIT license

MIT is short enough to read in a minute. It says:

1. **Permission:** anyone may use, copy, modify, merge, publish, distribute, sublicense and sell the software.
2. **One condition:** the copyright notice and the permission notice must be included in all copies or substantial portions.
3. **No warranty:** the software is provided "as is", and the authors are not liable.

The first line is `Copyright (c) <year> <holder>`.

- The **holder** is whoever owns the copyright: a **person or a legal entity** (such as a company). A project name is not a legal person, so it cannot be the holder on its own. "Project contributors" is a common pattern when several people contribute. A pseudonym works but makes ownership harder to show later.
- The **year** is normally when the work was first published; a range (2026-2028) is common.
- Never change the license text itself. Copy it exactly from the official source (choosealicense.com), filling only the year and the holder.

## 4. Where licenses are declared

| Where | What |
|---|---|
| `LICENSE` (root, no extension) | The full text. GitHub detects it and shows "MIT license" |
| `package.json` | `"license": "MIT"`, using an **SPDX identifier** (the standard short codes: `MIT`, `Apache-2.0`, `GPL-3.0-only`). Private code that nobody may use is `UNLICENSED` |
| `README.md` | One line naming the license and linking the file |
| `NOTICE.md` | Credits and conditions for **other people's** material |

## 5. Licenses for data and content

Software licenses were written for code. Data, text and media usually use **Creative Commons (CC)** licenses, built from four elements:

| Element | Meaning |
|---|---|
| **BY** (Attribution) | Credit the creator |
| **SA** (ShareAlike) | Share adaptations under the same license |
| **NC** (NonCommercial) | No commercial use |
| **ND** (NoDerivatives) | No modified versions |

`CC0` gives up rights entirely (public domain dedication). Databases can also carry **database rights** (in the EU, "sui generis" rights), which CC 4.0 licenses cover too.

## 6. CC BY-SA 4.0 in detail

The license under which Wiktionary and the stress dataset are published. Reading the real text is a good exercise: the sections that matter are short.

| Section | In plain words |
|---|---|
| 2(a)(1) | You may copy, share and adapt the material, for any purpose, including commercial use |
| 2(a)(5)(c) | You may not add restrictions on recipients, including technical locks |
| 3(a)(1) | **Attribution** when you share: identify the creators as the licensor asks, keep the copyright notice, refer to the license, refer to the disclaimer, link to the material, **say if you modified it** and keep earlier modification notes, and include the license text or a link |
| 3(a)(2) | Any reasonable manner works: a link to a page with the information is enough |
| 3(b) | **ShareAlike:** if you share your adapted version, it must be under the same license (this version or later) or one Creative Commons lists as compatible, with the license text or link and no added terms |
| 4 | The same rules cover database rights |
| 5 | Everything is "as is": no warranties, no liability |
| 6 | Breaking the conditions ends your rights automatically, but they return if you fix the violation within 30 days of discovering it |

Notice the trigger: most duties apply when you **share**.

## 7. Using versus distributing

- **Using data on your own server** (users only receive results) is generally understood not to be "sharing" the data. CC 4.0 has no clause for network use.
- **Shipping the data to others** (inside an app, a download, a public repository) is sharing, and then attribution and ShareAlike apply to the data. Your own code can stay under its own license as a separate work, but the shared data file must stay open under its license, without locks.
- Adding **your own improvements** to such data makes an adaptation: if you share it, it is CC BY-SA too.
- If a business ever needs a proprietary dataset, the options are to build one from sources that allow it, or to get a separate license from the rights holders.

## 8. Attribution in practice

- A **NOTICE** file lists third-party material: what it is, where it came from (with a **pinned version**, and a checksum if you can), who is credited **in the words the author asks for**, its license (with a link), **what was changed** (both by the original maintainer and by you), how you use it, and what anyone must do if they redistribute it.
- Copy a required notice **exactly** (for example the MIT notice of a starter template), without rewording.
- Keep the NOTICE updated when you add new material.
- Public-facing products usually add a credits or "open-source notices" screen.

## 9. Dependencies

Your project also uses hundreds of packages, each with its own license. Most are permissive, and a few may be copyleft. `pnpm licenses list` prints them. Check them before a commercial launch, because copyleft dependencies can affect how you may distribute a product, and some licenses conflict with app-store rules.

## 10. Names and trademarks

A trademark protects a **name or logo**, separately from copyright. A code license does not grant trademark rights. You may say that you *started from* a template or *use* a product, but you must not suggest endorsement ("not affiliated with ...").

## 11. Choosing a license for your own project

Questions to ask:

1. What do I want others to be allowed to do?
2. Might this become a commercial product? (A permissive license never restricts what **you** do, and as the sole copyright holder you can license future versions differently. Existing copies keep their license.)
3. Does any data or dependency impose conditions on what I ship?
4. Will others contribute? Contributions may need a **CLA** (a contributor license agreement) or a **DCO** (a sign-off) if you want freedom to relicense later.

A common choice for portfolio projects that may grow is **MIT** for the code, with the valuable parts of a business (hosting, curated data, premium features) kept apart ("open core").

## Checklist before making a repository public

- [ ] `LICENSE` exists, text unmodified, with the right year and holder
- [ ] `package.json` license fields are set for your own packages
- [ ] `NOTICE.md` credits third-party material with the notices required
- [ ] The README names the license
- [ ] No secrets, no large generated data, no copied files without permission in the history
- [ ] Dependencies reviewed if a commercial release is planned

## Common mistakes

- Publishing code with no license.
- Editing the license text.
- Using a project name as the copyright holder with no legal entity behind it.
- Assuming "it is on the internet" means "I may use it".
- Forgetting to say that you changed material you adapted.
- Mixing up the license of your code and the license of your data.
- Ignoring the licenses of dependencies.
- Reading only a summary of a license that matters commercially.

## Practice

1. Why is code on GitHub without a license not reusable?
2. What are the two parts of "CC BY-SA", and what does each require?
3. Can a project name be the copyright holder? Why or why not?
4. Your web service uses a CC BY-SA dataset on its server. Your mobile app would ship the same file inside the app. What changes?
5. What is the difference between `LICENSE` and `NOTICE`?

**Answers.** (1) Copyright defaults to all rights reserved, so nobody has permission. (2) Attribution: credit the creators, link the license, state your changes. ShareAlike: share adaptations under the same license. (3) Not by itself: the holder must be a person or a legal entity. (4) Shipping the file is sharing, so attribution and ShareAlike apply to the data, and you cannot lock it down. (5) `LICENSE` is the permission for your code; `NOTICE` records what you used from others and what its licenses require.

## Where it appeared in Udarenie

Choosing MIT, the copyright line, the CC BY-SA 4.0 dataset and its ShareAlike condition, the `NOTICE.md` with pinned commit, checksum, upstream and own changes, the Turborepo MIT notice, and the decision to generate the dictionary instead of committing it.
