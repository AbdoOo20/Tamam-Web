import { Component, computed, input } from '@angular/core';

/** The part of a Signal Forms field this component reads (a `FieldTree` fits it). */
export interface FieldLike {
  (): {
    touched(): boolean;
    invalid(): boolean;
    errors(): readonly { kind: string; message?: string }[];
  };
}

/**
 * Label + control + validation messages.
 *
 * ```html
 * <tamam-field label="الاسم" [field]="form.name" hint="كما يظهر للعميل">
 *   <input class="form-control" [formField]="form.name" />
 * </tamam-field>
 * ```
 */
@Component({
  selector: 'tamam-field',
  template: `
    <div class="mb-3" [class.tm-invalid]="showErrors()">
      <label class="d-block">
        <span class="form-label d-block">
          {{ label() }}
          @if (required()) {
            <span class="text-danger" aria-hidden="true"> *</span>
          }
        </span>
        <ng-content />
      </label>

      @if (hint()) {
        <div class="form-text">{{ hint() }}</div>
      }

      @if (showErrors()) {
        @for (error of errors(); track error.kind) {
          <div class="text-danger small mt-1" role="alert">{{ error.message }}</div>
        }
      }
    </div>
  `,
})
export class Field {
  readonly label = input.required<string>();
  readonly field = input<FieldLike>();
  readonly hint = input<string>();
  readonly required = input(false);
  protected readonly errors = computed(() => this.field()?.().errors() ?? []);
  protected readonly showErrors = computed(() => {
    const state = this.field()?.();

    return !!state && state.touched() && state.invalid();
  });
}
