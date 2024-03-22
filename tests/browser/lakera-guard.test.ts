// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { LakeraGuard } from "../../src";
import { isBrowserEnv } from "../../src/utils";

describe(LakeraGuard.name + " in browser", () => {


    it("should throw an error if no apiKey is passed", () => {
        expect(
            () =>
                new LakeraGuard({
                    apiKey: "",
                })
        ).toThrow();
    });

    const apiKey = "fake-api-key";
    it("should throw an error in browsers unless dangerouslyAllowBrowser is passed", () => {
        expect(
            () =>
                new LakeraGuard({
                    apiKey,
                })
        ).toThrow();
    });

    it("should not throw an error in browsers if dangerouslyAllowBrowser is passed", () => {

        expect(
            () =>
                new LakeraGuard({
                    apiKey,
                    dangerouslyAllowBrowser: true,
                })
        ).not.toThrow();
    });

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
