import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { createFileUnknownWordStore } from "../file-unknown-word-store";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let dir: string;

beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "udarenie-"));
});

afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
});

describe("createFileUnknownWordStore", () => {
    it("writes one line", async () => {
        const filePath = join(
            dir,
            "unknown-words.jsonl",
        );

        const store =
            createFileUnknownWordStore(
                filePath,
                () =>
                    new Date(
                        "2026-01-01T00:00:00.000Z",
                    ),
            );

        await store.record([
            {
                word: "тестирование",
                count: 2,
            },
        ]);

        const content = await readFile(
            filePath,
            "utf8",
        );

        expect(content).toBe(
            '{"at":"2026-01-01T00:00:00.000Z","words":[{"word":"тестирование","count":2}]}\n',
        );
    });

    it("appends", async () => {
        const filePath = join(
            dir,
            "unknown-words.jsonl",
        );

        const store =
            createFileUnknownWordStore(
                filePath,
                () =>
                    new Date(
                        "2026-01-01T00:00:00.000Z",
                    ),
            );

        await store.record([
            {
                word: "тестирование",
                count: 2,
            },
        ]);

        await store.record([
            {
                word: "образование",
                count: 1,
            },
        ]);

        const content = await readFile(
            filePath,
            "utf8",
        );

        const lines = content
            .trim()
            .split("\n");

        expect(lines).toHaveLength(2);

        expect(
            JSON.parse(lines[0]),
        ).toEqual({
            at: "2026-01-01T00:00:00.000Z",
            words: [
                {
                    word: "тестирование",
                    count: 2,
                },
            ],
        });

        expect(
            JSON.parse(lines[1]),
        ).toEqual({
            at: "2026-01-01T00:00:00.000Z",
            words: [
                {
                    word: "образование",
                    count: 1,
                },
            ],
        });
    });

    it("creates missing folders", async () => {
        const filePath = join(
            dir,
            "nested",
            "deep",
            "unknown-words.jsonl",
        );

        const store =
            createFileUnknownWordStore(
                filePath,
                () =>
                    new Date(
                        "2026-01-01T00:00:00.000Z",
                    ),
            );

        await store.record([
            {
                word: "тестирование",
                count: 1,
            },
        ]);

        const content = await readFile(
            filePath,
            "utf8",
        );

        expect(content).toContain(
            "тестирование",
        );
    });

    it("does nothing for an empty list", async () => {
        const filePath = join(
            dir,
            "unknown-words.jsonl",
        );

        const store =
            createFileUnknownWordStore(
                filePath,
                () =>
                    new Date(
                        "2026-01-01T00:00:00.000Z",
                    ),
            );

        await store.record([]);

        await expect(
            readFile(filePath, "utf8"),
        ).rejects.toHaveProperty(
            "code",
            "ENOENT",
        );
    });

    it("rejects when the path is a directory", async () => {
        const store =
            createFileUnknownWordStore(
                dir,
                () =>
                    new Date(
                        "2026-01-01T00:00:00.000Z",
                    ),
            );

        await expect(
            store.record([
                {
                    word: "тестирование",
                    count: 1,
                },
            ]),
        ).rejects.toThrow();
    });

});
