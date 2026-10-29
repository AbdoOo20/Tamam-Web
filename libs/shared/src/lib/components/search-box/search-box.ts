import { Component, DestroyRef, inject, input, output } from '@angular/core';

/** Search input that waits for the user to stop typing before it emits. */
@Component({
  selector: 'tamam-search-box',
  template: `
    <div class="input-group">
      <span class="input-group-text bg-white"><i class="bi bi-search" aria-hidden="true"></i></span>
      <input
        type="search"
        class="form-control border-start-0"
        [placeholder]="placeholder()"
        [attr.aria-label]="placeholder()"
        [value]="value()"
        (input)="onInput($event)"
        (keydown.enter)="flush($event)"
      />
    </div>
  `,
  styles: `
    input[type='search'] {
      direction: rtl;
      text-align: start;
    }
  `,
})
export class SearchBox {
  readonly placeholder = input('بحث...');
  readonly value = input('');
  readonly debounceMs = input(350);
  readonly searched = output<string>();

  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.searched.emit(text.trim()), this.debounceMs());
  }

  protected flush(event: Event): void {
    clearTimeout(this.timer);
    this.searched.emit((event.target as HTMLInputElement).value.trim());
  }
}
