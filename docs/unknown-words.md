# Unknown Words

An unknown word is a Russian word that has no dictionary entry and therefore cannot be annotated automatically.

The purpose of unknown-word reporting is to identify gaps in the dictionary and prioritize additions based on frequency.

| # | A word like... | Reported as unknown | Reason |
|---|---|---|---|
| 1 | a word with an entry in the dictionary | no | it was found |
| 2 | a found word that our rules don't mark (`ё`, one vowel) | no | it was found; not marking is our display rule |
| 3 | a word not in the dictionary, with 0 or 1 vowels (`в`, `не`) | no | it needs no mark |
| 4 | a word not in the dictionary, with 2+ vowels (`тестирование`) | **yes** | a real gap |
| 5 | a word that already has a stress mark (`U+0301`) | no | someone already marked it |
| 6 | a capitalized word whose lowercase form is missing | **yes, as lowercase** | the lookup is case-insensitive, so one entry covers all spellings |
| 7 | a hyphenated word missing as a whole, whose parts are all known | no | we annotate the parts, so nothing is missing |
| 8 | a hyphenated word where some part (with 2+ vowels) is unknown | **yes: report that part, not the whole word** | the part is what needs an entry |
| 9 | the same unknown word several times | once, with a **count** | frequency is what makes the list useful |
| 10 | text with Latin letters, digits or punctuation | no | they are not Russian word tokens |
| 11 | a token longer than 55 characters | no | probably garbage, such as a pasted string |