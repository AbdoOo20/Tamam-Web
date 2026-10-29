import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { form, FormField, FormRoot, max, maxLength, min, pattern, required } from '@angular/forms/signals';
import { errorText, ToastService } from '@tamam/core';
import { Field, Modal } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { Product } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'tamam-product-form',
  imports: [Modal, Field, FormRoot, FormField],
  template: `
    <tamam-modal [title]="product() ? 'تعديل المنتج' : 'إضافة منتج'" (closed)="closed.emit()">
      <form [formRoot]="productForm" id="product-form" novalidate>
        @if (serverError(); as message) {
          <div class="alert alert-danger" role="alert">{{ message }}</div>
        }

        <tamam-field label="اسم المنتج" [field]="productForm.name" [required]="true">
          <input type="text" class="form-control" [formField]="productForm.name" />
        </tamam-field>

        <div class="row">
          <div class="col-sm-6">
            <tamam-field label="كود المنتج (SKU)" [field]="productForm.sku">
              <input type="text" class="form-control ltr" [formField]="productForm.sku" />
            </tamam-field>
          </div>
          <div class="col-sm-6">
            <tamam-field label="السعر الافتراضي" [field]="productForm.defaultPrice">
              <input type="number" class="form-control" step="0.01" [formField]="productForm.defaultPrice" />
            </tamam-field>
          </div>
        </div>

        <tamam-field label="رابط الإعلان" [field]="productForm.adUrl" hint="يساعد في مقارنة وصف الإعلان بما استلمه العميل">
          <input type="url" class="form-control" [formField]="productForm.adUrl" />
        </tamam-field>

        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="product-active" [formField]="productForm.isActive" />
          <label class="form-check-label" for="product-active">منتج نشط</label>
        </div>
      </form>

      <div modal-footer class="d-flex gap-2">
        <button type="button" class="btn btn-light" (click)="closed.emit()">إلغاء</button>
        <button type="submit" form="product-form" class="btn btn-primary" [disabled]="productForm().submitting()">حفظ</button>
      </div>
    </tamam-modal>
  `,
})
export class ProductForm implements OnInit {
  private readonly service = inject(ProductsService);
  private readonly toast = inject(ToastService);

  readonly product = input<Product | null>(null);
  readonly saved = output<void>();
  readonly closed = output<void>();

  protected readonly serverError = signal<string | null>(null);

  private readonly model = signal<{
    name: string;
    sku: string;
    defaultPrice: number | null;
    adUrl: string;
    isActive: boolean;
  }>({ name: '', sku: '', defaultPrice: null, adUrl: '', isActive: true });

  protected readonly productForm = form(
    this.model,
    (path) => {
      required(path.name, { message: 'اسم المنتج مطلوب' });
      maxLength(path.name, 200, { message: 'الاسم طويل جدًا' });
      maxLength(path.sku, 60, { message: 'الكود طويل جدًا' });
      min(path.defaultPrice, 0, { message: 'السعر لا يمكن أن يكون سالبًا' });
      max(path.defaultPrice, 100000000, { message: 'السعر كبير جدًا' });
      maxLength(path.adUrl, 500, { message: 'الرابط طويل جدًا' });
      pattern(path.adUrl, /^(https?:\/\/.*)?$/, { message: 'يجب أن يبدأ الرابط بـ http أو https' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          const value = this.model();
          const request = {
            name: value.name.trim(),
            sku: value.sku.trim() || null,
            defaultPrice: value.defaultPrice,
            adUrl: value.adUrl.trim() || null,
            isActive: value.isActive,
          };

          try {
            const current = this.product();

            await firstValueFrom(
              current ? this.service.update(current.id, request) : this.service.create(request),
            );
            this.toast.success(current ? 'تم تحديث المنتج' : 'تمت إضافة المنتج');
            this.saved.emit();
          } catch (error) {
            this.serverError.set(errorText(error));
          }
        },
      },
    },
  );

  ngOnInit(): void {
    const current = this.product();

    if (current) {
      this.model.set({
        name: current.name,
        sku: current.sku ?? '',
        defaultPrice: current.defaultPrice,
        adUrl: current.adUrl ?? '',
        isActive: current.isActive,
      });
    }
  }
}
