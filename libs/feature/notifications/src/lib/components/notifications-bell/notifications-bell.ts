import { Component, DestroyRef, effect, ElementRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState, LoadingState, TamamDatePipe, TooltipDirective } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { notificationIcon } from '../../models/notification-meta';
import { Notification } from '../../models/notification.model';
import { NotificationsRealtime } from '../../services/notifications-realtime.service';
import { NotificationsService } from '../../services/notifications.service';
import { NotificationsStore } from '../../store/notifications.store';

/** Safety net only: the real-time connection delivers new notifications instantly. */
const FALLBACK_POLL_MS = 300_000;

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
  private readonly realtime = inject(NotificationsRealtime);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly store = inject(NotificationsStore);
  protected readonly open = signal(false);
  protected readonly loading = signal(false);
  protected readonly latest = signal<Notification[]>([]);
  protected readonly icon = notificationIcon;

  ngOnInit(): void {
    void this.store.refreshUnread();
    void this.realtime.start(
      (notification) => this.store.receive(notification),
      () => void this.store.refreshUnread(),
    );
  }

  constructor() {
    const timer = setInterval(() => void this.store.refreshUnread(), FALLBACK_POLL_MS);

    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      void this.realtime.stop();
    });

    effect(() => {
      const received = this.store.lastReceived();

      if (received && this.open()) {
        this.latest.update((items) => [received, ...items.filter((item) => item.id !== received.id)].slice(0, 6));
      }
    });
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
