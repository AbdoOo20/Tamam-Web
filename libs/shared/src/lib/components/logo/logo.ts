import { Component, computed, input } from '@angular/core';

/** Where the logo sits: the bubble is green on light and navy backgrounds and navy on a green background. */
export type LogoBackground = 'light' | 'dark' | 'brand';

const BRAND_GREEN = '#07805f';
const NAVY = '#0f1b3d';

/** The Tamam mark (a chat bubble holding the letter ت with a check tail) and the wordmark. */
@Component({
  selector: 'tamam-logo',
  template: `
    <span class="d-inline-flex align-items-center gap-2" [class.text-white]="onColor()">
      <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <path
          d="M50 4H14A10 10 0 0 0 4 14v26a10 10 0 0 0 10 10h18l18 12V50a10 10 0 0 0 10-10V14A10 10 0 0 0 50 4z"
          [attr.fill]="bubble()"
        />
        <g transform="translate(32 27) scale(.66) translate(-32 -31)">
          <path
            d="M12 31c0 11 7 17 16 17 7 0 10-4 14-10l11-14"
            fill="none"
            stroke="#ffffff"
            stroke-width="7.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect x="17.5" y="12.5" width="9" height="9" rx="1.6" fill="#5eead4" transform="rotate(45 22 17)" />
          <rect x="30.5" y="12.5" width="9" height="9" rx="1.6" fill="#5eead4" transform="rotate(45 35 17)" />
        </g>
      </svg>
      @if (!compact()) {
        <span class="fw-bold lh-1" [style.font-size.px]="size() * 0.9">تمام</span>
      }
    </span>
  `,
})
export class Logo {
  /** Background the logo is placed on; picks the bubble and text colors. */
  readonly on = input<LogoBackground>('light');
  /** Only the mark, without the name. */
  readonly compact = input(false);
  /** Mark height in pixels. */
  readonly size = input(36);
  protected readonly bubble = computed(() => (this.on() === 'brand' ? NAVY : BRAND_GREEN));
  protected readonly onColor = computed(() => this.on() !== 'light');
}
