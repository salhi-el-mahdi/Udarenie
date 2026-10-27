import { readFile } from "node:fs/promises";
import { createBinaryDictionary } from "./binary-dictionary";
import type { StressDictionary } from "./binary-dictionary";
import { fileURLToPath } from "node:url";

const DEFAULT_PATH = fileURLToPath(
    new URL("../data/generated/ru-stress.tsv", import.meta.url)
);

export async function loadDictionary(
    filePath: string = DEFAULT_PATH
): Promise<StressDictionary> {
    let bytes: Buffer;

    try {
        bytes = await readFile(filePath);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            throw new Error(
                `Dictionary file not found: ${filePath}\nRun: pnpm --filter @udarenie/stress-engine build:dictionary`
            );
        }
        throw error;
    }

    return createBinaryDictionary(bytes);
}