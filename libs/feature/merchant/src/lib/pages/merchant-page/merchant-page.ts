import { Component, signal } from '@angular/core';
import { PageHeader } from '@tamam/shared';

import { ApiKeyTab } from '../../components/api-key-tab/api-key-tab';
import { AuditTab } from '../../components/audit-tab/audit-tab';
import { ConsentTab } from '../../components/consent-tab/consent-tab';
import { ProfileTab } from '../../components/profile-tab/profile-tab';
import { StaffTab } from '../../components/staff-tab/staff-tab';
import { TemplatesTab } from '../../components/templates-tab/templates-tab';

type TabKey = 'profile' | 'staff' | 'consent' | 'api' | 'templates' | 'audit';

@Component({
  selector: 'tamam-merchant-page',
  imports: [PageHeader, ApiKeyTab, AuditTab, ConsentTab, ProfileTab, StaffTab, TemplatesTab],
  template: `
    <tamam-page-header title="إعدادات المتجر" subtitle="بيانات متجرك وفريقك وربطه بمتجرك الإلكتروني" />

    <div class="tm-card">
      <div class="px-3 pt-2">
        <ul class="nav nav-tabs border-0 flex-nowrap overflow-auto" role="tablist" aria-label="أقسام الإعدادات">
          @for (tab of tabs; track tab.key) {
            <li class="nav-item" role="presentation">
              <button
                type="button"
                role="tab"
                class="nav-link text-nowrap"
                [class.active]="active() === tab.key"
                [attr.aria-selected]="active() === tab.key"
                [attr.aria-controls]="'panel-' + tab.key"
                [id]="'tab-' + tab.key"
                (click)="active.set(tab.key)"
              >
                <i class="bi" [class]="tab.icon" aria-hidden="true"></i> {{ tab.label }}
              </button>
            </li>
          }
        </ul>
      </div>

      <div class="tm-card-body border-top" role="tabpanel" [id]="'panel-' + active()" [attr.aria-labelledby]="'tab-' + active()">
        @switch (active()) {
          @case ('profile') { <tamam-profile-tab /> }
          @case ('staff') { <tamam-staff-tab /> }
          @case ('consent') { <tamam-consent-tab /> }
          @case ('api') { <tamam-api-key-tab /> }
          @case ('templates') { <tamam-templates-tab /> }
          @case ('audit') { <tamam-audit-tab /> }
        }
      </div>
    </div>
  `,
})
export class MerchantPage {
  protected readonly active = signal<TabKey>('profile');
  protected readonly tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'profile', label: 'بيانات المتجر', icon: 'bi-shop' },
    { key: 'staff', label: 'الموظفون', icon: 'bi-people' },
    { key: 'consent', label: 'الخصوصية والشبكة', icon: 'bi-shield-lock' },
    { key: 'api', label: 'ربط المتجر (API)', icon: 'bi-plug' },
    { key: 'templates', label: 'قوالب الرسائل', icon: 'bi-chat-text' },
    { key: 'audit', label: 'سجل التغييرات', icon: 'bi-journal-text' },
  ];
}
