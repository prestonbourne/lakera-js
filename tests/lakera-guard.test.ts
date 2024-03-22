import { expect, describe, it } from "vitest";
import { LakeraGuard } from "../src";

describe(LakeraGuard.name, () => {
    it("should throw an error if no apiKey is passed", () => {
        expect(() => new LakeraGuard({ apiKey: "" })).toThrow();
    });
});
