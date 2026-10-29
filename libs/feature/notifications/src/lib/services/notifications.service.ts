import { inject, Service } from '@angular/core';
import { ApiClient, PagedResult } from '@tamam/core';
import { Observable } from 'rxjs';

import { Notification, NotificationQuery } from '../models/notification.model';

@Service()
export class NotificationsService {
  private readonly api = inject(ApiClient);

  list(query: NotificationQuery): Observable<PagedResult<Notification>> {
    return this.api.get<PagedResult<Notification>>('notifications', { ...query }, { silent: true });
  }

  unreadCount(): Observable<number> {
    return this.api.get<number>('notifications/unread-count', undefined, { silent: true });
  }

  markRead(id: number): Observable<void> {
    return this.api.post<void>(`notifications/${id}/read`);
  }

  markAllRead(): Observable<void> {
    return this.api.post<void>('notifications/read-all');
  }
}
