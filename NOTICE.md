# Notices

## This project

The source code of Udarenie is licensed under the MIT License (see [LICENSE](LICENSE)).

This file lists the third-party material the project builds on, and what the licenses of that material require.

## Stress data

Udarenie builds its stress dictionary from the file `data/ru-stress-dict.gz` of the dataset **russian-ukrainian-stress-data**:

- Repository: <https://github.com/eugenysilin/russian-ukrainian-stress-data> (maintainer: GitHub user `eugenysilin`)
- Version used: commit `43f8dbb2b1af21350ec8d4109055de2dab06dc0f`
- SHA-256 of the file: `adf32b9cd1059597a14519a8f9348f9dc53e9dfb79e0e42989e884e108f41185`. This matches the checksum published by the dataset's maintainer, and the dictionary build verifies it before using the file.

### Credit

Source: Wiktionary, by Wiktionary contributors (<https://www.wiktionary.org/>).
Licence: CC BY-SA 4.0. Changes were made.

### License

The stress data is licensed under the Creative Commons Attribution-ShareAlike 4.0 International license (CC BY-SA 4.0): <https://creativecommons.org/licenses/by-sa/4.0/>

The data is provided "as is", without warranties of any kind (see section 5 of the license).

### Changes made to the data

**By the dataset's maintainer.** The dataset is not a copy of Wiktionary: it is a derivative. According to its documentation ([how the files were built](https://github.com/eugenysilin/russian-ukrainian-stress-data/blob/43f8dbb2b1af21350ec8d4109055de2dab06dc0f/README.md#how-the-files-were-built)), it was produced from Wiktionary extractions fetched on 2026-08-11, and:

- dictionary entries were reshaped into one line per word form (a spelling and a stress position);
- where a spelling appeared with several stress positions, one position was kept (the one most forms agreed on);
- a Russian word containing `ё` and no stress mark is recorded as stressed on the `ё`;
- entries under the `е` spelling were added for words containing `ё`.

**By Udarenie.** The dictionary build:

- converts each position from "just after the stressed vowel" to "the index of the stressed vowel";
- validates every entry, and stops with an error if any line is invalid;
- writes the result as a tab-separated file, in the same sorted order, so the engine can search it with binary search.

### How the data is used

The dataset is downloaded when the dictionary is built. This repository does not contain a copy of it, and the generated dictionary file is not committed.

### If you redistribute the generated dictionary

If you share the generated dictionary, or anything derived from it, CC BY-SA 4.0 applies to your copy:

- keep the credit above and a link to the license;
- state the changes you made, in addition to the ones listed here;
- license your copy under CC BY-SA 4.0 (or a later version, or a license that Creative Commons lists as compatible), and do not add terms that restrict what recipients may do with it.

## Project starter

The repository structure and several configuration files started from the Turborepo starter template (`create-turbo`) published by Vercel, Inc. under the MIT License: <https://github.com/vercel/turborepo>. The MIT License requires its copyright and permission notice to be kept with copies of the material, so they are reproduced here:

```text
Copyright (c) 2026 Vercel, Inc

Permission is hereby granted, free of charge, ... (the rest of the text you pasted)

THE SOFTWARE IS PROVIDED "AS IS", ... DEALINGS IN THE SOFTWARE.
```

"Turborepo" and "Vercel" are trademarks of Vercel. This project is not affiliated with or endorsed by Vercel.

## Third-party software

Third-party dependencies keep their own licenses. To list them, run `pnpm licenses list` in the repository root.