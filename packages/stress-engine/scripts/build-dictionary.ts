import { createHash } from "node:crypto";
import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { createGunzip } from "node:zlib";
import { parseLine } from "./parse-line";

const COMMIT = "43f8dbb2b1af21350ec8d4109055de2dab06dc0f";
const SOURCE_URL = `https://raw.githubusercontent.com/eugenysilin/russian-ukrainian-stress-data/${COMMIT}/data/ru-stress-dict.gz`;
const EXPECTED_SHA256 =
    "adf32b9cd1059597a14519a8f9348f9dc53e9dfb79e0e42989e884e108f41185";

const RAW_DIR = fileURLToPath(new URL("../data/raw", import.meta.url));
const RAW_FILE = join(RAW_DIR, "ru-stress-dict.gz");
const GENERATED_DIR = fileURLToPath(new URL("../data/generated", import.meta.url));
const OUTPUT_FILE = join(GENERATED_DIR, "ru-stress.tsv");

function sha256(bytes: Buffer): string {
    return createHash("sha256").update(bytes).digest("hex");
}

async function ensureRawFile(): Promise<string> {
    await mkdir(RAW_DIR, { recursive: true });

    const alreadyThere = existsSync(RAW_FILE);
    if (alreadyThere) {
        const existing = await readFile(RAW_FILE);
        if (sha256(existing) === EXPECTED_SHA256) {
            console.log("Raw file already present and verified.");
            return RAW_FILE;
        }
        console.log("Existing file failed verification, downloading again...");
    } else {
        console.log("Downloading...");
    }

    const response = await fetch(SOURCE_URL);
    if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());

    const actual = sha256(bytes);
    if (actual !== EXPECTED_SHA256) {
        throw new Error(
            `Checksum mismatch.\n  expected: ${EXPECTED_SHA256}\n  actual:   ${actual}`
        );
    }

    await writeFile(RAW_FILE, bytes);
    console.log(`Saved ${bytes.length} bytes to ${RAW_FILE}`);
    return RAW_FILE;
}

async function convertDictionary(rawFile: string): Promise<number> {
    await mkdir(GENERATED_DIR, { recursive: true });
    const tempFile = `${OUTPUT_FILE}.tmp`;
    let count = 0;

    async function* convertedLines() {
        const input = createReadStream(rawFile).pipe(createGunzip());
        const lines = createInterface({ input, crlfDelay: Infinity });
        let previousWord = "";

        for await (const line of lines) {
            const { word, index } = parseLine(line);

            if (word <= previousWord) {
                throw new Error(`Words are not in strictly increasing order at: ${line}`);
            }
            previousWord = word;

            count++;
            yield `${word}\t${index}\n`;
        }
    }

    try {
        await pipeline(convertedLines(), createWriteStream(tempFile));
    } catch (error) {
        await rm(tempFile, { force: true });
        throw error;
    }

    await rename(tempFile, OUTPUT_FILE);
    return count;
}

async function main() {
    const rawFile = await ensureRawFile();
    const count = await convertDictionary(rawFile);
    console.log(`Wrote ${count} entries to ${OUTPUT_FILE}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});