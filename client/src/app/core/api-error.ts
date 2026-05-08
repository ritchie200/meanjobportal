import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from './models';

export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof HttpErrorResponse) {
    const payload = error.error as ApiErrorResponse | string | undefined;

    if (typeof payload === 'string') {
      return payload;
    }

    if (payload?.errors?.length) {
      return payload.errors.map((item) => `${item.field}: ${item.message}`).join(', ');
    }

    return payload?.message || error.message || 'Request failed';
  }

  return 'Something went wrong';
};
