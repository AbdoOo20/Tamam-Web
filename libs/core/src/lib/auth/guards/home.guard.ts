import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { homeRouteFor } from '../home-route';
import { UserStore } from '../user.store';

/** Used on the empty path: sends the user to the home page of their role. */
export const homeGuard: CanActivateFn = () =>
  inject(Router).createUrlTree([homeRouteFor(inject(UserStore).role())]);
