export const MAX_TEXT_LENGTH = 100_000;

export interface StressRequest {
    text: string;
}

export interface StressResponse {
    annotatedText: string;
}

export interface HealthResponse {
    status: "ok";
    dictionaryEntries: number;
}

export type ApiErrorCode = "INVALID_REQUEST" | "TEXT_TOO_LONG" | "INTERNAL_ERROR";

export interface ApiError {
    error: {
        code: ApiErrorCode;
        message: string;
    };
}