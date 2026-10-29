import { Component, input } from '@angular/core';
import { Logo } from '@tamam/shared';

/** The simple, mobile-first frame of the customer pages. */
@Component({
  selector: 'tamam-public-shell',
  imports: [Logo],
  template: `
    <div class="min-vh-100 d-flex flex-column page">
      <header class="bg-white border-bottom">
        <div class="container narrow py-3 d-flex align-items-center justify-content-between gap-3">
          <strong class="fs-5 text-truncate">{{ storeName() || 'طلبك' }}</strong>
        </div>
      </header>

      <main class="container narrow flex-grow-1 py-4">
        <ng-content />
      </main>

      <footer class="container narrow py-4 text-center text-secondary small">
        <div class="d-inline-flex align-items-center gap-2"><span>تأكيد الطلبات بواسطة</span><tamam-logo /></div>
      </footer>
    </div>
  `,
  styles: `
    .narrow {
      max-width: 38rem;
    }
  `,
})
export class PublicShell {
  readonly storeName = input<string | null>(null);
}
