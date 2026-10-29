import { Component, input } from '@angular/core';

@Component({
  selector: 'tamam-survey-page',
  template: `
    <section>
      <h1>سبب عدم الاستلام</h1>
      <p>قيد الإنشاء. (الرمز: {{ token() }})</p>
    </section>
  `,
})
export class SurveyPage {
  /** Bound from the `:token` route parameter. */
  readonly token = input.required<string>();
}
