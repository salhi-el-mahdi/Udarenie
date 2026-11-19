import { fileURLToPath } from "node:url";

import { loadDictionary } from "@udarenie/stress-engine";
import { createApp } from "./app";
import { createFileUnknownWordStore } from "./file-unknown-word-store";

const PORT = Number(process.env.PORT ?? 4000);

const defaultPath = fileURLToPath(
    new URL("../data/unknown-words.jsonl", import.meta.url),
);

const unknownWordsFile = process.env.UNKNOWN_WORDS_FILE ?? defaultPath;

async function main() {
    const dictionary = await loadDictionary();

    const store = createFileUnknownWordStore(unknownWordsFile);

    const app = createApp(dictionary, store);

    app.listen(PORT, () => {
        console.log(
            `Udarenie API listening on http://localhost:${PORT} (${dictionary.size} dictionary entries)`
        );
    });
}

main();