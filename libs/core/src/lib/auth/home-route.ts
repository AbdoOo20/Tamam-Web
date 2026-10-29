import { RoleNames } from './role-names';

/** The first page a user lands on after signing in. */
export function homeRouteFor(role: string | null): string {
  return role === RoleNames.PlatformAdmin ? '/admin' : '/dashboard';
}
