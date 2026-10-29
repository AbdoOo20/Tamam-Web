import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { SecureStorage } from '../storage/secure-storage';
import { StorageKeys } from '../storage/storage-keys';
import { AuthResponse, UserSession } from './models/auth.models';
import { RoleNames } from './role-names';

interface UserState {
  session: UserSession | null;
  /** True once the saved session was read from the storage at startup. */
  hydrated: boolean;
}

const initialState: UserState = { session: null, hydrated: false };

function isNotExpired(session: UserSession): boolean {
  return Date.parse(session.expiresAtUtc) > Date.now();
}

/** The signed-in user. Everything here survives a page refresh (encrypted in the browser storage). */
export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ session }) => ({
    isLoggedIn: computed(() => session() !== null),
    accessToken: computed(() => session()?.accessToken ?? null),
    userId: computed(() => session()?.userId ?? null),
    merchantId: computed(() => session()?.merchantId ?? null),
    fullName: computed(() => session()?.fullName ?? ''),
    role: computed(() => session()?.role ?? null),
    isOwner: computed(() => session()?.role === RoleNames.Owner),
    isStaff: computed(() => session()?.role === RoleNames.Staff),
    isPlatformAdmin: computed(() => session()?.role === RoleNames.PlatformAdmin),
  })),
  withMethods((store, storage = inject(SecureStorage)) => ({
    /** Reads the saved session. Runs once before the app starts. */
    async hydrate(): Promise<void> {
      const saved = await storage.getItem<UserSession>(StorageKeys.session);

      if (saved && isNotExpired(saved)) {
        patchState(store, { session: saved, hydrated: true });

        return;
      }

      if (saved) {
        storage.removeItem(StorageKeys.session);
      }

      patchState(store, { hydrated: true });
    },

    setSession(response: AuthResponse): void {
      patchState(store, { session: response });
      void storage.setItem(StorageKeys.session, response);
    },

    clear(): void {
      patchState(store, { session: null });
      storage.removeItem(StorageKeys.session);
    },

    /** True when there is a session whose token has not expired yet. */
    hasValidSession(): boolean {
      const session = store.session();

      return session !== null && isNotExpired(session);
    },
  })),
);
