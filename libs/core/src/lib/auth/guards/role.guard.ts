import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { homeRouteFor } from '../home-route';
import { RoleName } from '../role-names';
import { UserStore } from '../user.store';

/** Allows the route only for the given roles; others go back to their own home page. */
export function roleGuard(...roles: RoleName[]): CanActivateFn {
  return () => {
    const store = inject(UserStore);
    const role = store.role();

    if (role !== null && (roles as string[]).includes(role)) {
      return true;
    }

    return inject(Router).createUrlTree([homeRouteFor(role)]);
  };
}
