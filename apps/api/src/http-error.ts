import type { ApiErrorCode } from "@udarenie/shared-types";

export class HttpError extends Error {
    constructor(
        readonly status: number,
        readonly code: ApiErrorCode,
        message: string
    ) {
        super(message);
        this.name = "HttpError";
    }
}