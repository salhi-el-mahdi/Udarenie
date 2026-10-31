import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import type { StressDictionary } from "@udarenie/stress-engine";
import { MAX_TEXT_LENGTH } from "@udarenie/shared-types";
import { createApp } from "../app";

const dictionary: StressDictionary = {
    size: 1,
    get: (word) => (word === "люблю" ? 4 : undefined),
};
const app = createApp(dictionary);

afterEach(() => vi.restoreAllMocks());

describe("POST /stress: success", () => {
    it("annotates text", async () => {
        const r = await request(app).post("/stress").send({ text: "Я люблю русский язык." });
        expect(r.status).toBe(200);
        expect(r.body).toEqual({ annotatedText: "Я люблю\u0301 русский язык." });
    });

    it("accepts an empty string", async () => {
        const r = await request(app).post("/stress").send({ text: "" });
        expect(r.status).toBe(200);
        expect(r.body).toEqual({ annotatedText: "" });
    });

    it("accepts text of exactly the maximum length", async () => {
        const r = await request(app).post("/stress").send({ text: "а".repeat(MAX_TEXT_LENGTH) });
        expect(r.status).toBe(200);
    });
});

describe("POST /stress: bad requests", () => {
    const expectInvalid = (r: request.Response) => {
        expect(r.status).toBe(400);
        expect(r.body.error.code).toBe("INVALID_REQUEST");
        expect(typeof r.body.error.message).toBe("string");
    };

    it("no body", async () => expectInvalid(await request(app).post("/stress")));

    it("malformed JSON", async () =>
        expectInvalid(
            await request(app).post("/stress").set("Content-Type", "application/json").send("{ not json")
        ));

    it("wrong content type", async () =>
        expectInvalid(
            await request(app).post("/stress").set("Content-Type", "text/plain").send("hello")
        ));

    it("JSON array instead of object", async () =>
        expectInvalid(await request(app).post("/stress").send([1, 2])));

    it("text missing", async () => expectInvalid(await request(app).post("/stress").send({})));

    it("text is a number", async () =>
        expectInvalid(await request(app).post("/stress").send({ text: 42 })));

    it("text is null", async () =>
        expectInvalid(await request(app).post("/stress").send({ text: null })));
});

describe("POST /stress: too large", () => {
    it("text one character over the limit", async () => {
        const r = await request(app).post("/stress").send({ text: "а".repeat(MAX_TEXT_LENGTH + 1) });
        expect(r.status).toBe(413);
        expect(r.body.error.code).toBe("TEXT_TOO_LONG");
    });

    it("body over the 1 MB parser limit", async () => {
        const r = await request(app).post("/stress").send({ text: "а".repeat(1_100_000) });
        expect(r.status).toBe(413);
        expect(r.body.error.code).toBe("TEXT_TOO_LONG");
    });
});

describe("other errors", () => {
    it("unknown route returns a JSON 404", async () => {
        const r = await request(app).get("/nope");
        expect(r.status).toBe(404);
        expect(r.headers["content-type"]).toContain("application/json");
        expect(r.body.error.code).toBe("NOT_FOUND");
    });

    it("an unexpected failure returns a generic 500 and hides the details", async () => {
        const spy = vi.spyOn(console, "error").mockImplementation(() => { });
        const broken: StressDictionary = {
            size: 1,
            get: () => {
                throw new Error("secret internal detail");
            },
        };
        const r = await request(createApp(broken)).post("/stress").send({ text: "слово" });
        expect(r.status).toBe(500);
        expect(r.body.error.code).toBe("INTERNAL_ERROR");
        expect(JSON.stringify(r.body)).not.toContain("secret internal detail");
        expect(spy).toHaveBeenCalled();
    });
});