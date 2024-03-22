export const getEnvVar = (envVar: string): string | undefined => {
    if (typeof process !== "undefined") {
        return process.env?.[envVar]?.trim() ?? undefined;
    }
};

export const isRunningInNode = (): boolean => {
    return !!process;
};

// @ts-ignore
export const isBrowserEnv = () => typeof window !== "undefined";

export const isPositiveInt = (value: number): boolean => {
    return typeof value === "number" && value > 0 && Number.isInteger(value);
};

export const API_KEY_ENV_VAR = "LAKERA_GUARD_API_KEY";
