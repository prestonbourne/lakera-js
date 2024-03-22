import { expect, describe, it } from "vitest";
import { LakeraGuard } from "../src";

describe(LakeraGuard.name, () => {
    it("should throw an error if no apiKey is passed", () => {
        expect(() => new LakeraGuard({ apiKey: "" })).toThrow();
    });

    const apiKey = "fake-api-key";

    it("should throw an error if maxRetries is not a positive integer", () => {
        expect(
            () =>
                new LakeraGuard({
                    apiKey,
                    maxRetries: -1,
                })
        ).toThrow();
    });

    it("should throw an error if timeout is not a positive integer", () => {
        expect(
            () =>
                new LakeraGuard({
                    apiKey,
                    timeout: -1,
                })
        ).toThrow();
    });
});
