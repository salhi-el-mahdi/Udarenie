import express from "express";
import { annotateText, type StressDictionary } from "@udarenie/stress-engine";
import type { HealthResponse, StressResponse } from "@udarenie/shared-types";
import { parseStressRequest } from "./validate";
import { errorHandler, notFoundHandler } from "./error-handlers.js";

export function createApp(dictionary: StressDictionary) {
    const app = express();
    app.use(express.json({ limit: "1mb" }));

    app.get("/health", (_req, res) => {
        const body: HealthResponse = {
            status: "ok",
            dictionaryEntries: dictionary.size,
        };
        res.json(body);
    });

    app.post("/stress", (req, res) => {
        const { text } = parseStressRequest(req.body);
        const body: StressResponse = { annotatedText: annotateText(text, dictionary) };
        res.json(body);
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}