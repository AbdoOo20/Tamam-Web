import { Component, inject, OnInit, signal } from '@angular/core';
import {
  Badge,
  ConfirmService,
  EmptyState,
  LoadingState,
  PageHeader,
  TooltipDirective,
} from '@tamam/shared';

import { CarrierForm } from '../../components/carrier-form/carrier-form';
import { Carrier } from '../../models/carrier.model';
import { CarriersStore } from '../../store/carriers.store';

@Component({
  selector: 'tamam-carriers-page',
  imports: [PageHeader, LoadingState, EmptyState, Badge, TooltipDirective, CarrierForm],
  providers: [CarriersStore],
  templateUrl: './carriers-page.html',
})
export class CarriersPage implements OnInit {
  protected readonly store = inject(CarriersStore);
  private readonly confirmService = inject(ConfirmService);

  /** `undefined` = form closed, `null` = adding, a carrier = editing it. */
  protected readonly editing = signal<Carrier | null | undefined>(undefined);

  ngOnInit(): void {
    void this.store.load();
  }

  protected async remove(carrier: Carrier): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'حذف شركة الشحن',
      message: `هل تريد حذف «${carrier.name}»؟ لن تتأثر الطلبات السابقة.`,
      confirmText: 'حذف',
      tone: 'danger',
    });

    if (confirmed) {
      await this.store.remove(carrier);
    }
  }

  protected async onSaved(): Promise<void> {
    this.editing.set(undefined);
    await this.store.load();
  }
}
