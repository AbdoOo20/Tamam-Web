import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationsBell } from '@tamam/notifications';
import { RoleNames, UserService, UserStore } from '@tamam/core';
import { Logo } from '@tamam/shared';
import { filter } from 'rxjs';

import { NAV_GROUPS } from '../nav-items';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logo, NotificationsBell],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  protected readonly userStore = inject(UserStore);

  protected readonly menuOpen = signal(false);

  protected readonly groups = computed(() => {
    const role = this.userStore.role();

    return NAV_GROUPS.map((group) => ({
      title: group.title,
      items: group.items.filter(
        (item) => role !== null && (item.roles as readonly string[]).includes(role),
      ),
    })).filter((group) => group.items.length > 0);
  });

  protected readonly roleLabel = computed(() => {
    switch (this.userStore.role()) {
      case RoleNames.Owner:
        return 'مالك المتجر';
      case RoleNames.Staff:
        return 'موظف';
      case RoleNames.PlatformAdmin:
        return 'مدير المنصة';
      default:
        return '';
    }
  });

  protected readonly showBell = computed(() => !this.userStore.isPlatformAdmin());

  protected readonly initial = computed(() => this.userStore.fullName()?.trim().charAt(0) || '؟');

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected logout(): void {
    this.userService.logout();
  }
}
