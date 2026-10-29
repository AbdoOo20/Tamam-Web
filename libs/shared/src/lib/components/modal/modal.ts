import { afterNextRender, Component, ElementRef, input, output, viewChild } from '@angular/core';

let nextId = 0;

/**
 * A dialog built on the native `<dialog>` element, so focus is trapped and Esc works for free.
 * It opens as soon as it is created and tells you when it closes:
 *
 * ```html
 * @if (editing()) {
 *   <tamam-modal title="تعديل" (closed)="editing.set(null)"> ... </tamam-modal>
 * }
 * ```
 * Put buttons in the footer with `<div modal-footer>...</div>`.
 */
@Component({
  selector: 'tamam-modal',
  template: `
    <dialog
      #dialog
      class="tamam-modal"
      [class.tamam-modal--lg]="size() === 'lg'"
      [attr.aria-labelledby]="titleId"
      (close)="closed.emit()"
      (click)="onBackdropClick($event)"
    >
      <div class="modal-content border-0">
        <div class="modal-header">
          <h2 class="modal-title fs-5 fw-bold" [id]="titleId">{{ title() }}</h2>
          <button type="button" class="btn-close ms-0 me-auto" aria-label="إغلاق" (click)="close()"></button>
        </div>
        <div class="modal-body">
          <ng-content />
        </div>
        <div class="modal-footer">
          <ng-content select="[modal-footer]" />
        </div>
      </div>
    </dialog>
  `,
  styles: `
    .tamam-modal {
      width: min(34rem, calc(100vw - 1.5rem));
      max-height: calc(100vh - 2rem);
      padding: 0;
      border: 0;
      border-radius: var(--tm-radius);
      box-shadow: var(--tm-shadow-lg);
      overflow: hidden;
    }

    .tamam-modal--lg {
      width: min(52rem, calc(100vw - 1.5rem));
    }

    .tamam-modal[open] {
      display: flex;
    }

    .tamam-modal::backdrop {
      background: rgb(15 27 61 / 55%);
      backdrop-filter: blur(2px);
    }

    .modal-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-height: calc(100vh - 2rem);
    }

    .modal-body {
      overflow-y: auto;
    }

    .modal-footer:empty {
      display: none;
    }
  `,
})
export class Modal {
  readonly title = input.required<string>();
  readonly size = input<'md' | 'lg'>('md');
  readonly closed = output<void>();

  protected readonly titleId = `tamam-modal-title-${nextId++}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterNextRender(() => {
      const dialog = this.dialog().nativeElement;

      if (!dialog.open) {
        dialog.showModal();
      }
    });
  }

  close(): void {
    this.dialog().nativeElement.close();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.close();
    }
  }
}
