import type { NextFunction, Request, Response } from "express";
import type { ApiError, ApiErrorCode } from "@udarenie/shared-types";
import { HttpError } from "./http-error";

function send(res: Response, status: number, code: ApiErrorCode, message: string) {
    const body: ApiError = { error: { code, message } };
    res.status(status).json(body);
}

export function notFoundHandler(_req: Request, res: Response) {
    send(res, 404, "NOT_FOUND", "No such endpoint.");
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof HttpError) {
        send(res, err.status, err.code, err.message);
        return;
    }

    const type =
        typeof err === "object" && err !== null && "type" in err
            ? (err as { type: unknown }).type
            : undefined;

    if (type === "entity.too.large") {
        send(res, 413, "TEXT_TOO_LONG", "Request body is too large.");
        return;
    }
    if (type === "entity.parse.failed") {
        send(res, 400, "INVALID_REQUEST", "Request body is not valid JSON.");
        return;
    }

    console.error(err);
    send(res, 500, "INTERNAL_ERROR", "Something went wrong on the server.");
}