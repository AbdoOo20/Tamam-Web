import { isApiError } from './api-error';

/** Turns any thrown value into text for the user: the API message plus its validation errors. */
export function errorText(error: unknown, fallback = 'حدث خطأ، حاول مرة أخرى'): string {
  if (!isApiError(error)) {
    return fallback;
  }

  const parts = [error.message, ...error.errors].filter(
    (part, index, all) => !!part && all.indexOf(part) === index,
  );

  return parts.length > 0 ? parts.join(' - ') : fallback;
}
