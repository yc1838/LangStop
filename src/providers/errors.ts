export const safeProviderErrorMessage =
  "Provider request failed. Check your key, quota, and provider settings.";

export class ProviderRequestError extends Error {
  constructor(message = safeProviderErrorMessage) {
    super(message);
    this.name = "ProviderRequestError";
  }
}

export function isProviderRequestError(error: unknown): error is ProviderRequestError {
  return error instanceof ProviderRequestError;
}

