import express from "express";
import type { StressDictionary } from "@udarenie/stress-engine";
import type { HealthResponse } from "@udarenie/shared-types";

export function createApp(dictionary: StressDictionary) {
    const app = express();

    app.get("/health", (_req, res) => {
        const body: HealthResponse = {
            status: "ok",
            dictionaryEntries: dictionary.size,
        };
        res.json(body);
    });

    return app;
}