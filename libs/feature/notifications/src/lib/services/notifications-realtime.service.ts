import { DestroyRef, inject, Service, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { APP_ENVIRONMENT, UserStore } from '@tamam/core';

import { Notification } from '../models/notification.model';

const HUB_PATH = '/hubs/notifications';
const NOTIFICATION_EVENT = 'notification';

/** Keeps one SignalR connection open while the merchant is signed in and hands every pushed notification to `onNotification`. */
@Service()
export class NotificationsRealtime {
  private readonly environment = inject(APP_ENVIRONMENT);
  private readonly userStore = inject(UserStore);
  private connection: HubConnection | null = null;
  readonly connected = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => void this.stop());
  }

  async start(onNotification: (notification: Notification) => void, onReconnected: () => void): Promise<void> {
    if (this.connection) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl(), { accessTokenFactory: () => this.userStore.accessToken() ?? '' })
      .withAutomaticReconnect([0, 2_000, 10_000, 30_000])
      .configureLogging(this.environment.production ? LogLevel.None : LogLevel.Warning)
      .build();

    connection.on(NOTIFICATION_EVENT, onNotification);
    connection.onreconnected(() => {
      this.connected.set(true);
      onReconnected();
    });
    connection.onreconnecting(() => this.connected.set(false));
    connection.onclose(() => this.connected.set(false));
    this.connection = connection;

    try {
      await connection.start();
      this.connected.set(true);
    } catch {
      // The bell keeps working through its slow poll; a later start() call will try again.
      this.connection = null;
    }
  }

  async stop(): Promise<void> {
    const connection = this.connection;

    this.connection = null;
    this.connected.set(false);

    if (connection && connection.state !== HubConnectionState.Disconnected) {
      await connection.stop();
    }
  }

  private hubUrl(): string {
    return this.environment.apiUrl.replace(/\/api\/?$/, '') + HUB_PATH;
  }
}
