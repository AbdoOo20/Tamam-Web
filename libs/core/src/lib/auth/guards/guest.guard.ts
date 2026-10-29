import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { homeRouteFor } from '../home-route';
import { UserStore } from '../user.store';

/** Keeps signed-in users away from the login and register pages. */
export const guestGuard: CanActivateFn = () => {
  const store = inject(UserStore);

  return store.hasValidSession()
    ? inject(Router).createUrlTree([homeRouteFor(store.role())])
    : true;
};
