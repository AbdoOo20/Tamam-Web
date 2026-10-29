import { Component, DestroyRef, ElementRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState, LoadingState, TamamDatePipe, TooltipDirective } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { notificationIcon } from '../../models/notification-meta';
import { Notification } from '../../models/notification.model';
import { NotificationsService } from '../../services/notifications.service';
import { NotificationsStore } from '../../store/notifications.store';

const POLL_MS = 60_000;

/** Bell with an unread badge and a dropdown with the latest notifications. */
@Component({
  selector: 'tamam-notifications-bell',
  imports: [RouterLink, EmptyState, LoadingState, TamamDatePipe, TooltipDirective],
  templateUrl: './notifications-bell.html',
  styleUrl: './notifications-bell.scss',
  host: {
    '(document:click)': 'closeOnOutsideClick($event)',
    '(keydown.escape)': 'open.set(false)',
  },
})
export class NotificationsBell implements OnInit {
  private readonly service = inject(NotificationsService);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly store = inject(NotificationsStore);

  protected readonly open = signal(false);
  protected readonly loading = signal(false);
  protected readonly latest = signal<Notification[]>([]);
  protected readonly icon = notificationIcon;

  constructor() {
    const timer = setInterval(() => void this.store.refreshUnread(), POLL_MS);

    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  ngOnInit(): void {
    void this.store.refreshUnread();
  }

  protected async toggle(): Promise<void> {
    const next = !this.open();

    this.open.set(next);

    if (next) {
      this.loading.set(true);

      try {
        const result = await firstValueFrom(this.service.list({ page: 1, pageSize: 6 }));

        this.latest.set(result.items);
      } catch {
        this.latest.set([]);
      } finally {
        this.loading.set(false);
      }
    }
  }

  protected async openItem(item: Notification): Promise<void> {
    this.open.set(false);

    if (!item.isRead) {
      try {
        await firstValueFrom(this.service.markRead(item.id));
        await this.store.refreshUnread();
      } catch {
        // Opening the related page matters more than the read flag.
      }
    }
  }

  protected closeOnOutsideClick(event: Event): void {
    if (this.open() && !this.element.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
