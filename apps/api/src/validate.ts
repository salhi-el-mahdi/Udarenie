import { MAX_TEXT_LENGTH } from "@udarenie/shared-types";
import type { StressRequest } from "@udarenie/shared-types";
import { HttpError } from "./http-error";

export function parseStressRequest(body: unknown): StressRequest {

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        throw new HttpError(400, "INVALID_REQUEST",
            "Request body must be a JSON object like { "text": "..." }, sent with Content-Type: application/json."
        );
    }

    const { text } = body as Record<string, unknown>;

    if (typeof text !== "string") {
        throw new HttpError(400, "INVALID_REQUEST",
            'Field "text" is required and must be a string.'
        );
    }

    if (text.length > MAX_TEXT_LENGTH) {
        throw new HttpError(413, "TEXT_TOO_LONG", `Text has ${text.length} characters; the maximum is ${MAX_TEXT_LENGTH}.`);
    }

    return { text }
}