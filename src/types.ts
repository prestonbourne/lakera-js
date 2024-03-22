import type { Agent } from "http";

export type LakeraGuardParams = {
    /**
     * Defaults to process.env['LAKERA_GUARD_API_KEY'].
     */
    apiKey: string | undefined;

    /**
     * The maximum amount of time (in milliseconds) that the client should wait for a response
     * from the server before timing out a single request.
     *
     * Note that request timeouts are retried by default, so in a worst-case scenario you may wait
     * much longer than this timeout before the promise succeeds or fails.
     *
     * Specifically, `maxRetries` * `timeout`.
     */
    timeout?: number;

    /**
     * An HTTP agent used to manage HTTP(S) connections.
     *
     * If not provided, an agent will be constructed by default in the Node.js environment,
     * otherwise no agent is used.
     */
    httpAgent?: Agent;

    /**
     * The maximum number of times that the client will retry a request in case of a
     * temporary failure, like a network error or a 5XX error from the server.
     *
     * @default 2
     */
    maxRetries?: number;

    /**
     * By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
     * Only set this option to `true` if you understand the risks and have appropriate mitigations in place.
     *
     * @default false
     */
    dangerouslyAllowBrowser?: boolean;
};

/**
 * Metadata can be configured for any request associated with a Deployment or as part of each individual request. This provides flexibility to combine session-specific metadata with more general application metadata for each request.
 *
 * The context that this metadata provides in your Dashboard can help identify suspicious activity patterns and users or even identify specific attacks as they are happening.
 */

type Model = "lakera-guard-1";
type DevInfo = {
    git_revision: string;
    git_timestamp: string;
};

export interface LakeraGuardResponse<T extends LakeraGuardResult> {
    model: Model;
    results: T[];
    dev_info: DevInfo;
}

interface LakeraGuardResult {
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
    flagged: boolean;
    payload: {};
}

export interface ModerationResult extends LakeraGuardResult {
    categories: ModerationCategories;
    category_scores: ModerationCategoryScores;
}

export type ModerationCategories = {
    sexual: boolean;
    hate: boolean;
};

export type ModerationCategoryScores = {
    sexual: number;
    hate: number;
};

export interface PromptInjectionResult extends LakeraGuardResult {
    categories: PromptInjectionCategories;
    category_scores: PromptInjectionCategoryScores;
}

type PromptInjectionCategories = {
    prompt_injection: boolean;
    jail_break: boolean;
};

type PromptInjectionCategoryScores = {
    prompt_injection: number;
    jail_break: number;
};

export interface PIIResult extends LakeraGuardResult {
    categories: PIICategories;
    category_scores: PIICategoryScores;
    payload: PIIPayload;
}

export type PIICategories = {
    pii: boolean;
};

export type PIICategoryScores = {
    pii: number;
};

type PIIEntity = {
    type: PIIEntityType;
    start: number;
    end: number;
    pii: string;
};

/**
 * The type of PII entity that was detected. The only confirmed values listed on [the docs](https://platform.lakera.ai/docs/pii) are: "EMAIL_ADDRESS", "PERSON" so be prepared to handle other strings.
 */
type PIIEntityType =
    | "EMAIL_ADDRESS"
    | "PERSON"
    | "PHONE_NUMBER"
    | "IP_ADDRESS"
    | string;

export type PIIPayload = {
    pii: PIIEntity[];
};

export interface UnknownLink {
    link: string;
    domain: string;
    path: string;
    unknown: boolean;
}

export interface UnknownLinkResult extends LakeraGuardResult {
    categories: { unknown_links: boolean };
    category_scores: { unknown_links: number };
    flagged: boolean;
    payload: { unknown_links: UnknownLink[] };
}

export type RequestMetadata = {
    deployment_id: string;
    session_id?: string;
    user_id?: string;
    [key: string]: any;
};

export type LakeraRequest = {
    input: string;

    /**
     * The metadata to associate with the request.
     */
    metadata?: RequestMetadata;
};

export interface PromptInjectionRequest extends LakeraRequest {
    flag_uncertain?: boolean;
}