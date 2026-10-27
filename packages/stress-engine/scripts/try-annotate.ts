import { loadDictionary } from "../src/load-dictionary";
import { annotateText } from "../src/annotate-text";

async function main() {
    const dictionary = await loadDictionary("data/generated/ru-stress.tsv");
    console.log(annotateText("Я люблю русский язык.", dictionary));
}

main();