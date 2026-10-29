import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserStore } from '../user.store';

/** Lets signed-in users through, sends everyone else to the login page. */
export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(UserStore).hasValidSession()) {
    return true;
  }

  return inject(Router).createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
