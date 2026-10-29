import { DestroyRef, Directive, ElementRef, booleanAttribute, inject, input, numberAttribute } from '@angular/core';
import { DOCUMENT } from '@angular/common';

let nextId = 0;

/**
 * Truncates long text with an ellipsis and shows the full text in a tooltip on hover or focus,
 * but only when the text is really cut off.
 *
 * ```html
 * <span tamamTooltip>{{ order.address }}</span>            <!-- one line -->
 * <p tamamTooltip [tooltipLines]="2">{{ product.name }}</p> <!-- two lines -->
 * <span [tamamTooltip]="fullText">{{ shortText }}</span>   <!-- custom tooltip text -->
 * ```
 */
@Directive({
  selector: '[tamamTooltip]',
  host: {
    class: 'tamam-truncate',
    '[attr.data-lines]': 'tooltipLines() > 1 ? tooltipLines() : null',
    '[style.--tamam-lines]': 'tooltipLines() > 1 ? tooltipLines() : null',
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
  },
})
export class TooltipDirective {
  /** Text to show. When empty, the element's own text is used. */
  readonly tamamTooltip = input<string | null | undefined>('');
  /** How many lines are visible before the text is cut. */
  readonly tooltipLines = input(1, { transform: numberAttribute });
  /** Show the tooltip even if the text is not cut (for custom `tamamTooltip` text). */
  readonly tooltipAlways = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private tip: HTMLElement | null = null;

  constructor() {
    const window = this.document.defaultView;
    const hide = () => this.hide();

    window?.addEventListener('scroll', hide, true);
    window?.addEventListener('resize', hide);

    inject(DestroyRef).onDestroy(() => {
      window?.removeEventListener('scroll', hide, true);
      window?.removeEventListener('resize', hide);
      this.hide();
    });
  }

  protected show(): void {
    const text = (this.tamamTooltip() || this.host.textContent || '').trim();

    if (!text || this.tip || !(this.tooltipAlways() || this.isTruncated())) {
      return;
    }

    const tip = this.document.createElement('div');
    const id = `tamam-tooltip-${nextId++}`;

    tip.id = id;
    tip.className = 'tamam-tooltip';
    tip.setAttribute('role', 'tooltip');
    tip.textContent = text;
    tip.style.visibility = 'hidden';

    this.document.body.appendChild(tip);
    this.host.setAttribute('aria-describedby', id);
    this.tip = tip;
    this.position(tip);
    tip.style.visibility = 'visible';
  }

  protected hide(): void {
    this.tip?.remove();
    this.tip = null;
    this.host.removeAttribute('aria-describedby');
  }

  private isTruncated(): boolean {
    return (
      this.host.scrollWidth > this.host.clientWidth + 1 ||
      this.host.scrollHeight > this.host.clientHeight + 1
    );
  }

  private position(tip: HTMLElement): void {
    const margin = 8;
    const anchor = this.host.getBoundingClientRect();
    const box = tip.getBoundingClientRect();
    const viewport = this.document.documentElement;

    const above = anchor.top - box.height - margin;
    const top = above >= margin ? above : anchor.bottom + margin;
    const centered = anchor.left + anchor.width / 2 - box.width / 2;
    const left = Math.min(Math.max(margin, centered), viewport.clientWidth - box.width - margin);

    tip.style.top = `${Math.max(margin, top)}px`;
    tip.style.left = `${left}px`;
  }
}
