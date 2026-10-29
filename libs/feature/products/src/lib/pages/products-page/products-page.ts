import { Component, inject, OnInit, signal } from '@angular/core';
import {
  Badge,
  ConfirmService,
  EmptyState,
  LoadingState,
  MoneyPipe,
  PageHeader,
  Pagination,
  SearchBox,
  TooltipDirective,
} from '@tamam/shared';

import { ProductForm } from '../../components/product-form/product-form';
import { Product } from '../../models/product.model';
import { ProductsStore } from '../../store/products.store';

@Component({
  selector: 'tamam-products-page',
  imports: [PageHeader, LoadingState, EmptyState, Badge, TooltipDirective, Pagination, SearchBox, MoneyPipe, ProductForm],
  providers: [ProductsStore],
  templateUrl: './products-page.html',
})
export class ProductsPage implements OnInit {
  protected readonly store = inject(ProductsStore);
  private readonly confirmService = inject(ConfirmService);
  /** `undefined` = form closed, `null` = adding, a product = editing it. */
  protected readonly editing = signal<Product | null | undefined>(undefined);

  ngOnInit(): void {
    void this.store.load();
  }

  protected onFilter(event: Event): void {
    void this.store.setActiveFilter((event.target as HTMLSelectElement).value as 'all' | 'active' | 'inactive');
  }

  protected async remove(product: Product): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'حذف المنتج',
      message: `هل تريد حذف «${product.name}»؟`,
      confirmText: 'حذف',
      tone: 'danger',
    });

    if (confirmed) {
      await this.store.remove(product);
    }
  }

  protected async onSaved(): Promise<void> {
    this.editing.set(undefined);
    await this.store.load();
  }
}
