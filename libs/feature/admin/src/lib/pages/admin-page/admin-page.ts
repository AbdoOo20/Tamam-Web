import { Component, signal } from '@angular/core';
import { PageHeader } from '@tamam/shared';

import { AdminAuditTab } from '../../components/audit-tab/admin-audit-tab';
import { MerchantsTab } from '../../components/merchants-tab/merchants-tab';
import { OverviewTab } from '../../components/overview-tab/overview-tab';
import { PlansTab } from '../../components/plans-tab/plans-tab';
import { RequestsTab } from '../../components/requests-tab/requests-tab';
import { RulesTab } from '../../components/rules-tab/rules-tab';

type TabKey = 'overview' | 'merchants' | 'plans' | 'rules' | 'requests' | 'audit';

@Component({
  selector: 'tamam-admin-page',
  imports: [PageHeader, AdminAuditTab, MerchantsTab, OverviewTab, PlansTab, RequestsTab, RulesTab],
  template: `
    <tamam-page-header title="لوحة المنصة" subtitle="إدارة التجار والباقات وقواعد المخاطر وطلبات الخصوصية" />

    <div class="tm-card">
      <div class="px-3 pt-2">
        <ul class="nav nav-tabs border-0 flex-nowrap overflow-auto" role="tablist" aria-label="أقسام لوحة المنصة">
          @for (tab of tabs; track tab.key) {
            <li class="nav-item" role="presentation">
              <button
                type="button"
                role="tab"
                class="nav-link text-nowrap"
                [class.active]="active() === tab.key"
                [attr.aria-selected]="active() === tab.key"
                [attr.aria-controls]="'admin-panel-' + tab.key"
                [id]="'admin-tab-' + tab.key"
                (click)="active.set(tab.key)"
              >
                <i class="bi" [class]="tab.icon" aria-hidden="true"></i> {{ tab.label }}
              </button>
            </li>
          }
        </ul>
      </div>

      <div class="tm-card-body border-top" role="tabpanel" [id]="'admin-panel-' + active()" [attr.aria-labelledby]="'admin-tab-' + active()">
        @switch (active()) {
          @case ('overview') { <tamam-overview-tab /> }
          @case ('merchants') { <tamam-merchants-tab /> }
          @case ('plans') { <tamam-plans-tab /> }
          @case ('rules') { <tamam-rules-tab /> }
          @case ('requests') { <tamam-requests-tab /> }
          @case ('audit') { <tamam-admin-audit-tab /> }
        }
      </div>
    </div>
  `,
})
export class AdminPage {
  protected readonly active = signal<TabKey>('overview');
  protected readonly tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'overview', label: 'نظرة عامة', icon: 'bi-speedometer2' },
    { key: 'merchants', label: 'التجار', icon: 'bi-shop' },
    { key: 'plans', label: 'الباقات', icon: 'bi-credit-card' },
    { key: 'rules', label: 'قواعد المخاطر', icon: 'bi-sliders' },
    { key: 'requests', label: 'طلبات البيانات', icon: 'bi-inbox' },
    { key: 'audit', label: 'سجل التدقيق', icon: 'bi-journal-text' },
  ];
}
