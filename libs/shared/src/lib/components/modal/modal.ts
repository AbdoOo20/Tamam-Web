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
        <div class="tamam-modal__header">
          <h2 class="tamam-modal__title" [id]="titleId">{{ title() }}</h2>
          <button type="button" class="btn-close tamam-modal__close" aria-label="إغلاق" (click)="close()"></button>
        </div>
        <div class="tamam-modal__body">
          <ng-content />
        </div>
        <div class="tamam-modal__footer">
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

    .tamam-modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.5rem 1rem;
    }

    .tamam-modal__title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
    }

    .tamam-modal__close {
      flex-shrink: 0;
      margin: 0;
    }

    .tamam-modal__body {
      padding: 0 1.5rem 1.25rem;
      overflow-x: hidden;
      overflow-y: auto;
    }

    .tamam-modal__footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      gap: 0.5rem;
      padding: 1rem 1.5rem 1.25rem;
      border-top: 1px solid var(--tm-border);
    }

    .tamam-modal__footer:empty {
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
