import { annotateText, loadDictionary } from "@udarenie/stress-engine";
import type { StressRequest } from "@udarenie/shared-types";

async function main() {
    const request: StressRequest = { text: "Я люблю русский язык." };
    const dictionary = await loadDictionary();
    console.log(annotateText(request.text, dictionary));
}

main();