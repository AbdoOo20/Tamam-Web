import { HttpContextToken } from '@angular/common/http';

/** Set on a request to stop the error interceptor from showing a toast for it. */
export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);
