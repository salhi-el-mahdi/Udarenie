import type { UnknownWordCount } from "@udarenie/stress-engine";

export interface UnknownWordStore {
    record(words: UnknownWordCount[]): Promise<void>;
}

export const noopUnknownWordStore: UnknownWordStore = {
    async record() { },
};