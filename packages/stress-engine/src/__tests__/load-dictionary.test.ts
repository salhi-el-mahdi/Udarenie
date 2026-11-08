import { describe, it, expect } from "vitest";
import { loadDictionary } from "../dictionary/load-dictionary";

describe("loadDictionary", () => {
  it("explains how to fix a missing dictionary file", async () => {
    await expect(loadDictionary("no/such/file.tsv")).rejects.toThrow(
      "Dictionary file not found"
    );
  });
});