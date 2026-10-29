import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  EmptyState,
  LoadingState,
  MeterItem,
  MeterList,
  MoneyPipe,
  PageHeader,
  StatCard,
  TamamDatePipe,
  Tone,
} from '@tamam/shared';

import { BarChart } from '../../components/bar-chart/bar-chart';
import { DashboardStore } from '../../store/dashboard.store';

const RANGES = [
  { days: 7, label: '7 أيام' },
  { days: 30, label: '30 يومًا' },
  { days: 90, label: '90 يومًا' },
];

const RISK: Record<string, { label: string; tone: Tone }> = {
  Low: { label: 'منخفضة', tone: 'success' },
  Medium: { label: 'متوسطة', tone: 'warning' },
  High: { label: 'عالية', tone: 'danger' },
  Unscored: { label: 'غير مقيّمة', tone: 'secondary' },
};

const ATTRIBUTION: Record<string, { label: string; tone: Tone }> = {
  Customer: { label: 'العميل', tone: 'danger' },
  Merchant: { label: 'التاجر', tone: 'warning' },
  Carrier: { label: 'شركة الشحن', tone: 'info' },
  Neutral: { label: 'محايد', tone: 'secondary' },
  Unresolved: { label: 'لم يُحدَّد', tone: 'dark' },
};

@Component({
  selector: 'tamam-dashboard-page',
  imports: [RouterLink, PageHeader, LoadingState, EmptyState, StatCard, MeterList, MoneyPipe, TamamDatePipe, BarChart],
  providers: [DashboardStore],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage implements OnInit {
  protected readonly store = inject(DashboardStore);
  protected readonly ranges = RANGES;

  protected readonly statusItems = computed<MeterItem[]>(() =>
    (this.store.data()?.byStatus ?? []).map((row) => ({ label: row.key, value: row.count })),
  );
  protected readonly riskItems = computed<MeterItem[]>(() =>
    (this.store.data()?.riskDistribution ?? []).map((row) => ({
      label: RISK[row.key]?.label ?? row.key,
      value: row.count,
      tone: RISK[row.key]?.tone,
    })),
  );
  protected readonly attributionItems = computed<MeterItem[]>(() =>
    (this.store.data()?.refusalsByAttribution ?? []).map((row) => ({
      label: ATTRIBUTION[row.key]?.label ?? row.key,
      value: row.count,
      tone: ATTRIBUTION[row.key]?.tone,
    })),
  );

  ngOnInit(): void {
    void this.store.load();
  }

  protected monthDate(year: number, month: number): Date {
    return new Date(year, month - 1, 1);
  }
}
