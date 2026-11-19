import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { UnknownWordCount } from "@udarenie/stress-engine";
import type { UnknownWordStore } from "./unknown-word-store";

export function createFileUnknownWordStore(
    filePath: string,
    now: () => Date = () => new Date(),
): UnknownWordStore {
    return {
        async record(
            words: UnknownWordCount[],
        ): Promise<void> {
            if (words.length === 0) {
                return;
            }

            await mkdir(
                dirname(filePath),
                { recursive: true },
            );

            const line =
                JSON.stringify({
                    at: now().toISOString(),
                    words,
                }) + "\n";

            await appendFile(
                filePath,
                line,
                "utf8",
            );
        },
    };
}