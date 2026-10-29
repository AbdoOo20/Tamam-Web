import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService, UserStore } from '@tamam/core';

import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly userService = inject(UserService);
  protected readonly userStore = inject(UserStore);

  protected readonly items = computed(() => {
    const role = this.userStore.role();

    return NAV_ITEMS.filter(
      (item) => role !== null && (item.roles as readonly string[]).includes(role),
    );
  });

  protected logout(): void {
    this.userService.logout();
  }
}
