import * as React from "react";

// React's taint APIs only exist in the experimental react-server build, which
// Next.js uses when `experimental.taint` is on (see next.config.ts). Outside
// that build (unit tests, client bundles) they are undefined, so these
// wrappers become no-ops instead of crashing.
type TaintApi = {
  experimental_taintObjectReference?: (message: string, object: object) => void;
  experimental_taintUniqueValue?: (
    message: string,
    lifetime: object,
    value: string
  ) => void;
};

const taintApi = React as unknown as TaintApi;

export function taintObjectReference(message: string, object: object) {
  taintApi.experimental_taintObjectReference?.(message, object);
}

export function taintUniqueValue(
  message: string,
  lifetime: object,
  value: string
) {
  taintApi.experimental_taintUniqueValue?.(message, lifetime, value);
}
