import { Component, input } from '@angular/core';

@Component({
  selector: 'tamam-confirmation-page',
  template: `
    <section>
      <h1>تأكيد الطلب</h1>
      <p>قيد الإنشاء. (الرمز: {{ token() }})</p>
    </section>
  `,
})
export class ConfirmationPage {
  /** Bound from the `:token` route parameter. */
  readonly token = input.required<string>();
}
