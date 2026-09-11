import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { ApiError } from './profileApi';

export type ReadableApiError = {
  message: string;
  fieldErrors: NonNullable<ApiError['fieldErrors']>;
};

function isFetchBaseQueryError(value: unknown): value is FetchBaseQueryError {
  return typeof value === 'object' && value !== null && 'status' in value;
}

/** Flattens whatever `unwrap()` threw into something a form can render. */
export function readApiError(error: unknown): ReadableApiError {
  if (error instanceof Error) {
    return { message: error.message, fieldErrors: {} };
  }

  if (!isFetchBaseQueryError(error)) {
    return { message: 'Something went wrong. Try again.', fieldErrors: {} };
  }

  if (error.status === 'FETCH_ERROR') {
    return { message: 'Could not reach the API. Is the backend running?', fieldErrors: {} };
  }

  const body = 'data' in error ? (error.data as Partial<ApiError> | undefined) : undefined;

  return {
    message: typeof body?.error === 'string' ? body.error : 'Something went wrong. Try again.',
    fieldErrors: body?.fieldErrors ?? {},
  };
}
