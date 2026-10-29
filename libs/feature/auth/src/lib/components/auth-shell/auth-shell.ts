import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '@tamam/shared';

/** Two-column frame for the sign-in and sign-up pages. The form goes inside the tag. */
@Component({
  selector: 'tamam-auth-shell',
  imports: [RouterLink, Logo],
  template: `
    <div class="auth">
      <aside class="brand-panel d-none d-lg-flex">
        <a routerLink="/" class="text-decoration-none" aria-label="تمام"><tamam-logo [light]="true" /></a>
        <div>
          <h2>اعرف الطلب الذي سيُرفض قبل أن تشحنه</h2>
          <ul>
            <li><i class="bi bi-shield-check" aria-hidden="true"></i> تقييم مخاطر بسبب مكتوب لكل طلب</li>
            <li><i class="bi bi-whatsapp" aria-hidden="true"></i> تأكيد مع العميل برسالة واتساب جاهزة</li>
            <li><i class="bi bi-diagram-3" aria-hidden="true"></i> تحديد المسؤول عن كل رفض</li>
          </ul>
        </div>
        <small>14 يومًا تجربة مجانية بدون بطاقة دفع</small>
      </aside>

      <main class="form-panel">
        <div class="form-box">
          <a routerLink="/" class="d-lg-none d-inline-block mb-4 text-decoration-none text-dark" aria-label="تمام">
            <tamam-logo />
          </a>
          <h1 class="h3 fw-bold mb-1">{{ title() }}</h1>
          <p class="text-secondary mb-4">{{ subtitle() }}</p>
          <ng-content />
        </div>
      </main>
    </div>
  `,
  styles: `
    .auth {
      display: grid;
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
      min-block-size: 100dvh;
    }

    .brand-panel {
      flex-direction: column;
      justify-content: space-between;
      padding: 2.5rem;
      background: linear-gradient(160deg, var(--tm-navy) 0%, #17306b 100%);
      color: #fff;

      h2 {
        margin-bottom: 1.5rem;
        font-size: 2rem;
        font-weight: 700;
        line-height: 1.5;
      }

      ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 1rem;
      }

      li i {
        margin-inline-end: 0.5rem;
        color: #5fd3ab;
      }

      small {
        color: rgb(255 255 255 / 75%);
      }
    }

    .form-panel {
      display: grid;
      place-items: center;
      padding: 2rem 1rem;
      background: #fff;
    }

    .form-box {
      inline-size: min(26rem, 100%);
    }

    @media (max-width: 991.98px) {
      .auth {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class AuthShell {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
