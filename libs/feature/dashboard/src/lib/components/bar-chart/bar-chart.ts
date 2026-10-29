import { Component, computed, input } from '@angular/core';

import { DailyCount } from '../../models/dashboard.model';

const WIDTH = 720;
const HEIGHT = 220;
const PAD = { top: 12, right: 8, bottom: 28, left: 32 };

const dayFormat = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' });

/** Orders per day as bars. Days without orders are filled with zero so gaps are visible. */
@Component({
  selector: 'tamam-bar-chart',
  template: `
    <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="w-100" role="img" [attr.aria-label]="summary()">
      @for (tick of ticks(); track tick.value) {
        <line [attr.x1]="pad.left" [attr.x2]="width - pad.right" [attr.y1]="tick.y" [attr.y2]="tick.y" stroke="#e3e8f0" />
        <text [attr.x]="pad.left - 6" [attr.y]="tick.y + 4" text-anchor="end" class="axis">{{ tick.value }}</text>
      }

      @for (bar of bars(); track bar.date) {
        <rect [attr.x]="bar.x" [attr.y]="bar.y" [attr.width]="bar.width" [attr.height]="bar.height" rx="3" fill="#07805f">
          <title>{{ bar.label }}: {{ bar.count }} طلب</title>
        </rect>
      }

      @for (label of labels(); track label.x) {
        <text [attr.x]="label.x" [attr.y]="height - 8" text-anchor="middle" class="axis">{{ label.text }}</text>
      }
    </svg>
  `,
  styles: `
    .axis {
      fill: #5b6475;
      font-size: 11px;
    }
  `,
})
export class BarChart {
  readonly data = input.required<readonly DailyCount[]>();
  readonly from = input.required<string>();
  readonly to = input.required<string>();
  protected readonly width = WIDTH;
  protected readonly height = HEIGHT;
  protected readonly pad = PAD;
  private readonly series = computed(() => {
    const counts = new Map(this.data().map((d) => [d.date.slice(0, 10), d.count]));
    const days: { date: string; label: string; count: number }[] = [];
    const cursor = new Date(this.from());
    const end = new Date(this.to());

    cursor.setHours(12, 0, 0, 0);
    end.setHours(12, 0, 0, 0);

    while (cursor <= end && days.length < 400) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;

      days.push({ date: key, label: dayFormat.format(cursor), count: counts.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  });
  private readonly maxValue = computed(() => {
    const max = Math.max(1, ...this.series().map((d) => d.count));

    return max <= 4 ? 4 : Math.ceil(max / 4) * 4;
  });
  protected readonly bars = computed(() => {
    const series = this.series();
    const slot = (WIDTH - PAD.left - PAD.right) / Math.max(1, series.length);
    const plotHeight = HEIGHT - PAD.top - PAD.bottom;

    return series.map((day, index) => {
      const height = (day.count / this.maxValue()) * plotHeight;

      return {
        ...day,
        width: Math.max(2, slot * 0.7),
        height: Math.max(day.count > 0 ? 2 : 0, height),
        x: PAD.left + index * slot + slot * 0.15,
        y: HEIGHT - PAD.bottom - height,
      };
    });
  });
  protected readonly ticks = computed(() => {
    const plotHeight = HEIGHT - PAD.top - PAD.bottom;

    return [0, 1, 2, 3, 4].map((step) => ({
      value: Math.round((this.maxValue() / 4) * step),
      y: HEIGHT - PAD.bottom - (plotHeight / 4) * step,
    }));
  });
  protected readonly labels = computed(() => {
    const bars = this.bars();
    const every = Math.max(1, Math.ceil(bars.length / 7));

    return bars
      .filter((_, index) => index % every === 0)
      .map((bar) => ({ x: bar.x + bar.width / 2, text: bar.label }));
  });
  protected readonly summary = computed(() => {
    const total = this.series().reduce((sum, day) => sum + day.count, 0);

    return `مخطط الطلبات اليومية، المجموع ${total} طلب خلال ${this.series().length} يومًا`;
  });
}
