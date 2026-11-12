import express from "express";
import { annotateTextWithReport, type StressDictionary } from "@udarenie/stress-engine";
import type { HealthResponse, StressResponse } from "@udarenie/shared-types";
import { parseStressRequest } from "./validate";
import { errorHandler, notFoundHandler } from "./error-handlers";
import { type UnknownWordStore, noopUnknownWordStore } from "./unknown-word-store";

export function createApp(
    dictionary: StressDictionary,
    store: UnknownWordStore = noopUnknownWordStore
) {
    const app = express();
    app.use(express.json({ limit: "1mb" }));

    app.get("/health", (_req, res) => {
        const body: HealthResponse = {
            status: "ok",
            dictionaryEntries: dictionary.size,
        };
        res.json(body);
    });

    app.post("/stress", async (req, res) => {
        const { text } = parseStressRequest(req.body);

        const {
            annotatedText,
            unknownWords,
        } = annotateTextWithReport(text, dictionary);

        if (unknownWords.length > 0) {
            try {
                await store.record(unknownWords);
            } catch (error) {
                console.error("Could not record unknown words", error);
            }
        }
        const body: StressResponse = {
            annotatedText,
        };
        res.json(body);
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}