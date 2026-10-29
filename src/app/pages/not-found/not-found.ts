import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState, Logo } from '@tamam/shared';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, EmptyState, Logo],
  template: `
    <div class="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3 p-3">
      <a routerLink="/" aria-label="تمام"><tamam-logo /></a>
      <tamam-empty-state
        icon="bi-compass"
        title="الصفحة غير موجودة"
        description="الرابط الذي فتحته غير صحيح أو تم نقله."
      >
        <a routerLink="/" class="btn btn-primary">العودة للرئيسية</a>
      </tamam-empty-state>
    </div>
  `,
})
export class NotFound {}
