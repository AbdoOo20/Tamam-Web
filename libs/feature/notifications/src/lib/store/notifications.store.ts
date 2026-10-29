import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { errorText, ToastService } from '@tamam/core';
import { firstValueFrom } from 'rxjs';

import { Notification } from '../models/notification.model';
import { NotificationsService } from '../services/notifications.service';

interface NotificationsState {
  items: Notification[];
  page: number;
  totalPages: number;
  totalCount: number;
  unreadOnly: boolean;
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const PAGE_SIZE = 15;

/** Shared by the bell in the top bar and the notifications page. */
export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withState<NotificationsState>({
    items: [],
    page: 1,
    totalPages: 0,
    totalCount: 0,
    unreadOnly: false,
    unreadCount: 0,
    loading: false,
    error: null,
  }),
  withMethods((store, service = inject(NotificationsService), toast = inject(ToastService)) => ({
    async refreshUnread(): Promise<void> {
      try {
        patchState(store, { unreadCount: await firstValueFrom(service.unreadCount()) });
      } catch {
        // The bell is decorative; a failed poll must not interrupt the user.
      }
    },

    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        const result = await firstValueFrom(
          service.list({ page: store.page(), pageSize: PAGE_SIZE, unreadOnly: store.unreadOnly() }),
        );

        patchState(store, {
          items: result.items,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          loading: false,
        });
      } catch (error) {
        patchState(store, { loading: false, error: errorText(error, 'تعذر تحميل الإشعارات') });
      }
    },

    async setUnreadOnly(unreadOnly: boolean): Promise<void> {
      patchState(store, { unreadOnly, page: 1 });
      await this.load();
    },

    async setPage(page: number): Promise<void> {
      patchState(store, { page });
      await this.load();
    },

    async markRead(id: number): Promise<void> {
      const item = store.items().find((notification) => notification.id === id);

      if (!item || item.isRead) {
        return;
      }

      try {
        await firstValueFrom(service.markRead(id));
        patchState(store, {
          items: store.items().map((n) => (n.id === id ? { ...n, isRead: true } : n)),
          unreadCount: Math.max(0, store.unreadCount() - 1),
        });
      } catch (error) {
        toast.error(errorText(error));
      }
    },

    async markAllRead(): Promise<void> {
      try {
        await firstValueFrom(service.markAllRead());
        patchState(store, {
          items: store.items().map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        });
      } catch (error) {
        toast.error(errorText(error));
      }
    },
  })),
);
