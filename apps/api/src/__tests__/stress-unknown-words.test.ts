import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import type { StressDictionary, UnknownWordCount } from "@udarenie/stress-engine";
import { createApp } from "../app";
import type { UnknownWordStore } from "../unknown-word-store";

const dictionary: StressDictionary = {
    size: 1,
    get: (word) => (word === "люблю" ? 4 : undefined),
};

function createFakeStore() {
    const calls: UnknownWordCount[][] = [];
    const store: UnknownWordStore = {
        async record(words) {
            calls.push(words);
        },
    };
    return { store, calls };
}

describe("POST /stress: recording unknown words", () => {
    it("records an unknown word", async () => {
        const { store, calls } = createFakeStore();
        const app = createApp(dictionary, store);

        await request(app).post("/stress").send({ text: "Я люблю тестирование." });

        expect(calls).toEqual([[{ word: "тестирование", count: 1 }]]);
    });

    it("does not record when there are no unknown words", async () => {
        const { store, calls } = createFakeStore();
        const app = createApp(dictionary, store);

        await request(app).post("/stress").send({ text: "Я люблю." });

        expect(calls).toEqual([]);
    });

    it("records an unknown word", async () => {
        const { store, calls } = createFakeStore();
        const app = createApp(dictionary, store);

        await request(app).post("/stress").send({ text: "тестирование тестирование." });

        expect(calls).toEqual([[{ word: "тестирование", count: 2 }]]);
    });

    it("does not record when the request is rejected", async () => {
        const { store, calls } = createFakeStore();
        const app = createApp(dictionary, store);

        await request(app)
            .post("/stress")
            .send({ text: 42 });

        expect(calls).toEqual([]);
    });

    it("returns only annotatedText in the response body", async () => {
        const { store } = createFakeStore();
        const app = createApp(dictionary, store);

        const response = await request(app)
            .post("/stress")
            .send({ text: "люблю тестирование" });

        expect(response.body).toEqual({
            annotatedText: "люблю\u0301 тестирование",
        });

        expect(response.body).not.toHaveProperty("unknownWords");
    });

    it("returns 200 even if recording unknown words fails", async () => {
        const failingStore: UnknownWordStore = {
            async record() {
                throw new Error("disk full");
            },
        };

        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => { });

        const app = createApp(dictionary, failingStore);

        const response = await request(app)
            .post("/stress")
            .send({ text: "люблю тестирование" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            annotatedText: "люблю\u0301 тестирование",
        });

        expect(errorSpy).toHaveBeenCalled();
    });
});