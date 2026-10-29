import { loadDictionary } from "@udarenie/stress-engine";
import { createApp } from "./app";

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
    const dictionary = await loadDictionary();
    const app = createApp(dictionary);

    app.listen(PORT, () => {
        console.log(
            `Udarenie API listening on http://localhost:${PORT} (${dictionary.size} dictionary entries)`
        );
    });
}

main();