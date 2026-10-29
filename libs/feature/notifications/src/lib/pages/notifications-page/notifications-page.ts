import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  EmptyState,
  LoadingState,
  PageHeader,
  Pagination,
  TamamDatePipe,
  TooltipDirective,
} from '@tamam/shared';

import { notificationIcon } from '../../models/notification-meta';
import { NotificationsStore } from '../../store/notifications.store';

@Component({
  selector: 'tamam-notifications-page',
  imports: [RouterLink, PageHeader, LoadingState, EmptyState, Pagination, TamamDatePipe, TooltipDirective],
  templateUrl: './notifications-page.html',
})
export class NotificationsPage implements OnInit {
  protected readonly store = inject(NotificationsStore);
  protected readonly icon = notificationIcon;

  ngOnInit(): void {
    void this.store.load();
    void this.store.refreshUnread();
  }

  protected onFilter(event: Event): void {
    void this.store.setUnreadOnly((event.target as HTMLInputElement).checked);
  }
}
