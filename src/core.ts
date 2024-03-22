import type {
    LakeraGuardParams,
    LakeraGuardResponse,
    LakeraRequest,
    ModerationResult,
    PIIResult,
    PromptInjectionResult,
    UnknownLinkResult,
} from "./types";
import {
    API_KEY_ENV_VAR,
    isBrowserEnv,
    getEnvVar,
    isPositiveInt,
} from "./utils";
import axios from "axios";
import type { AxiosError } from "axios";

export class LakeraGuard {
    apiKey: string;
    timeout: number;
    maxRetries: number;
    dangerouslyAllowBrowser: boolean;
    private _baseURL: "https://api.lakera.ai/v1";
    defaultHeaders: Record<string, string>;

    constructor({
        apiKey = getEnvVar(API_KEY_ENV_VAR),
        ...params
    }: LakeraGuardParams) {
        if (!apiKey) {
            throw new LakeraError(
                `The LAKERA_API_KEY environment variable is missing or empty; either provide it, or instantiate the LakeraClient client with an apiKey option, eg: \`new LakeraClient({ apiKey: 'My API Key' })\`.`
            );
        }

        if (isBrowserEnv() && !params.dangerouslyAllowBrowser) {
            throw new LakeraError(
                "It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew LakeraClient({ dangerouslyAllowBrowser: true })"
            );
        }

        const DEFAULT_MAX_RETRIES = 2;
        if (params.maxRetries && !isPositiveInt(params.maxRetries)) {
            throw new LakeraError(
                `maxRetries must be a positive integer if provided. If not provided, it defaults to ${DEFAULT_MAX_RETRIES}.
                Received: ${params.maxRetries}`
            );
        }

        const FIFTEEN_SECONDS = 15_000;
        if (params.timeout && !isPositiveInt(params.timeout)) {
            throw new LakeraError(
                `timeout must be a positive integer if provided. If not provided it defaults to ${FIFTEEN_SECONDS} (15 seconds).
                Received: ${params.timeout}`
            );
        }

        this.apiKey = apiKey;
        this.timeout = params.timeout ?? FIFTEEN_SECONDS;
        this.maxRetries = params.maxRetries ?? DEFAULT_MAX_RETRIES;
        this.dangerouslyAllowBrowser = params.dangerouslyAllowBrowser ?? false;
        this._baseURL = "https://api.lakera.ai/v1";

        this.defaultHeaders = {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
        };
    }

    async checkForPromptInjection(
        req: LakeraRequest,
        headers: Record<string, string> = {}
    ): Promise<LakeraGuardResponse<PromptInjectionResult>> {
        return this._makePostRequest("prompt_injection", req, headers);
    }

    async moderate(
        req: LakeraRequest,
        headers: Record<string, string> = {}
    ): Promise<LakeraGuardResponse<ModerationResult>> {
        return this._makePostRequest("moderation", req, headers);
    }

    async checkForPII(
        req: LakeraRequest,
        headers: Record<string, string> = {}
    ): Promise<LakeraGuardResponse<PIIResult>> {
        return this._makePostRequest("pii", req, headers);
    }

    async checkForUnknownLinks(
        req: LakeraRequest,
        headers: Record<string, string> = {}
    ): Promise<LakeraGuardResponse<UnknownLinkResult>> {
        return this._makePostRequest("unknown_links", req, headers);
    }

    private async _makePostRequest<T>(
        route: string,
        body: any,
        headers: Record<string, string> = {}
    ): Promise<T> {

        const resolvedHeaders = { ...this.defaultHeaders, ...headers };
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await axios.post(
                    `${this._baseURL}/${route}`,
                    body,
                    {
                        headers: resolvedHeaders,
                        timeout: this.timeout,
                    }
                );
                return response.data as T;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError;
                    console.error(`Request failed with status ${
                        axiosError.code
                    }: ${axiosError.message}.
                    Attempt ${attempt + 1}/${this.maxRetries} failed`);

                    const canRetry =
                        this.isRetryable(axiosError) &&
                        attempt < this.maxRetries - 1;

                    if (canRetry) {
                        throw new LakeraError(
                            `Request failed after ${this.maxRetries} attempts. 
                            ${axiosError}`
                        );
                    }
                } else {
                    throw new LakeraError(`An Error occurred
                    ${error}`);
                }
            }
        }

        throw new LakeraError(
            "Unreachable code, but TypeScript requires a return or throw at the end of the function"
        );
    }

    private isRetryable(error: AxiosError): boolean {
        return !error.response || error.response.status >= 500;
    }
}

export class LakeraError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}