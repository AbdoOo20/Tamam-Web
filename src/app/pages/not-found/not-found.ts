import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="not-found">
      <h1>الصفحة غير موجودة</h1>
      <a routerLink="/">العودة للرئيسية</a>
    </section>
  `,
  styles: `
    .not-found {
      display: grid;
      place-items: center;
      gap: 1rem;
      min-block-size: 100dvh;
      align-content: center;
    }
  `,
})
export class NotFound {}
