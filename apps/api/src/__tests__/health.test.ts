import { describe, it, expect } from "vitest";
import request from "supertest";
import type { StressDictionary } from "@udarenie/stress-engine";
import { createApp } from "../app";

const dictionary: StressDictionary = { size: 2, get: () => undefined };

describe("GET /health", () => {
    it("reports that the server is alive and how many entries the dictionary has", async () => {
        const response = await request(createApp(dictionary)).get("/health");

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.body).toEqual({ status: "ok", dictionaryEntries: 2 });
    });
});