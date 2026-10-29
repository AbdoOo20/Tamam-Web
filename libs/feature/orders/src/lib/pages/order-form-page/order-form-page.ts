import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  applyEach,
  form,
  FormField,
  FormRoot,
  max,
  maxLength,
  min,
  required,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { errorText, ToastService } from '@tamam/core';
import {
  Field,
  LoadingState,
  MoneyPipe,
  PAYMENT_METHOD_LABEL,
  PageHeader,
  PaymentMethod,
} from '@tamam/shared';
import { catchError, firstValueFrom, of } from 'rxjs';

import { CreateOrderRequest, OrderItemRequest } from '../../models/order.model';
import { Region } from '../../models/lookups.model';
import { OrderLookupsService } from '../../services/order-lookups.service';
import { OrdersService } from '../../services/orders.service';

interface ItemModel {
  productId: string;
  productName: string;
  variant: string;
  quantity: number;
  unitPrice: number;
}

interface OrderFormModel {
  orderNo: string;
  recipientName: string;
  recipientPhone: string;
  altPhone: string;
  regionId: string;
  city: string;
  addressLine: string;
  landmark: string;
  paymentMethod: string;
  depositAmount: number;
  shippingFee: number;
  discountAmount: number;
  expectedDeliveryDate: string;
  carrierId: string;
  trackingNo: string;
  notes: string;
  items: ItemModel[];
}

const emptyItem = (): ItemModel => ({ productId: '', productName: '', variant: '', quantity: 1, unitPrice: 0 });

/** Creates a new order, or edits the data of an existing one when the route has an `:id`. */
@Component({
  selector: 'tamam-order-form-page',
  imports: [RouterLink, FormRoot, FormField, Field, PageHeader, LoadingState, MoneyPipe],
  templateUrl: './order-form-page.html',
})
export class OrderFormPage implements OnInit {
  private readonly orders = inject(OrdersService);
  private readonly lookups = inject(OrderLookupsService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Bound from the `:id` route parameter; empty when creating. */
  readonly id = input<string>();

  protected readonly paymentMethods = Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => ({ value, label }));
  protected readonly isEdit = computed(() => !!this.id());
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly serverError = signal<string | null>(null);
  protected readonly regions = signal<Region[]>([]);
  protected readonly currency = signal('EGP');
  private latitude: number | null = null;
  private longitude: number | null = null;

  protected readonly carriers = toSignal(
    this.lookups.carriers().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );
  protected readonly products = toSignal(
    this.lookups.products().pipe(catchError(() => of({ items: [] }))),
    { initialValue: { items: [] } },
  );

  protected readonly model = signal<OrderFormModel>({
    orderNo: '',
    recipientName: '',
    recipientPhone: '',
    altPhone: '',
    regionId: '',
    city: '',
    addressLine: '',
    landmark: '',
    paymentMethod: String(PaymentMethod.Cod),
    depositAmount: 0,
    shippingFee: 0,
    discountAmount: 0,
    expectedDeliveryDate: '',
    carrierId: '',
    trackingNo: '',
    notes: '',
    items: [emptyItem()],
  });

  protected readonly orderForm = form(
    this.model,
    (path) => {
      required(path.recipientName, { message: 'اسم المستلم مطلوب' });
      maxLength(path.recipientName, 150, { message: 'الاسم طويل جدًا' });
      required(path.recipientPhone, { message: 'رقم الهاتف مطلوب' });
      maxLength(path.recipientPhone, 25, { message: 'الرقم طويل جدًا' });
      maxLength(path.altPhone, 25, { message: 'الرقم طويل جدًا' });
      maxLength(path.orderNo, 50, { message: 'رقم الطلب طويل جدًا' });
      required(path.addressLine, { message: 'العنوان مطلوب' });
      maxLength(path.addressLine, 500, { message: 'العنوان طويل جدًا' });
      maxLength(path.landmark, 200, { message: 'العلامة المميزة طويلة جدًا' });
      maxLength(path.city, 100, { message: 'اسم المدينة طويل جدًا' });
      maxLength(path.notes, 1000, { message: 'الملاحظات طويلة جدًا' });
      min(path.shippingFee, 0, { message: 'لا يمكن أن تكون القيمة سالبة' });
      min(path.discountAmount, 0, { message: 'لا يمكن أن تكون القيمة سالبة' });
      min(path.depositAmount, 0, { message: 'لا يمكن أن تكون القيمة سالبة' });
      max(path.shippingFee, 100000000, { message: 'القيمة كبيرة جدًا' });
      applyEach(path.items, (item) => {
        required(item.productName, { message: 'اسم المنتج مطلوب' });
        maxLength(item.productName, 200, { message: 'الاسم طويل جدًا' });
        maxLength(item.variant, 100, { message: 'طويل جدًا' });
        min(item.quantity, 1, { message: 'الكمية 1 على الأقل' });
        max(item.quantity, 10000, { message: 'الكمية كبيرة جدًا' });
        min(item.unitPrice, 0, { message: 'السعر لا يمكن أن يكون سالبًا' });
      });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          try {
            const order = await this.save();

            this.toast.success(this.isEdit() ? 'تم تحديث الطلب' : 'تم تسجيل الطلب وتقييم مخاطره');
            await this.router.navigate(['/orders', order.id]);
          } catch (error) {
            this.serverError.set(errorText(error, 'تعذر حفظ الطلب'));
          }
        },
      },
    },
  );

  protected readonly itemsTotal = computed(() =>
    this.model().items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0),
  );
  protected readonly total = computed(() =>
    Math.max(0, this.itemsTotal() + (this.model().shippingFee || 0) - (this.model().discountAmount || 0)),
  );
  protected readonly hasDeposit = computed(() => Number(this.model().paymentMethod) === PaymentMethod.CodWithDeposit);
  protected readonly toCollect = computed(() => {
    const method = Number(this.model().paymentMethod);

    if (method === PaymentMethod.Prepaid) {
      return 0;
    }

    return method === PaymentMethod.CodWithDeposit
      ? Math.max(0, this.total() - (this.model().depositAmount || 0))
      : this.total();
  });

  async ngOnInit(): Promise<void> {
    try {
      const merchant = await firstValueFrom(this.lookups.merchant());

      this.currency.set(merchant.currencyCode);
      this.regions.set(await firstValueFrom(this.lookups.regions(merchant.countryCode)));
    } catch {
      // Regions are optional; the form works without them.
    }

    const id = this.id();

    if (id) {
      await this.loadOrder(Number(id));
    }
  }

  protected addItem(): void {
    this.model.update((m) => ({ ...m, items: [...m.items, emptyItem()] }));
  }

  protected removeItem(index: number): void {
    this.model.update((m) => ({ ...m, items: m.items.filter((_, i) => i !== index) }));
  }

  protected pickProduct(index: number, event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    const product = this.products().items.find((p) => String(p.id) === id);

    this.model.update((m) => ({
      ...m,
      items: m.items.map((item, i) =>
        i === index
          ? {
              ...item,
              productId: id,
              productName: product?.name ?? item.productName,
              unitPrice: product?.defaultPrice ?? item.unitPrice,
            }
          : item,
      ),
    }));
  }

  private async loadOrder(id: number): Promise<void> {
    this.loading.set(true);

    try {
      const order = await firstValueFrom(this.orders.get(id));

      this.latitude = order.latitude;
      this.longitude = order.longitude;
      this.model.set({
        orderNo: order.orderNo,
        recipientName: order.recipientName,
        recipientPhone: order.recipientPhoneE164,
        altPhone: order.altPhoneE164 ?? '',
        regionId: order.regionId ? String(order.regionId) : '',
        city: order.city ?? '',
        addressLine: order.addressLine,
        landmark: order.landmark ?? '',
        paymentMethod: String(order.paymentMethod),
        depositAmount: order.depositAmount,
        shippingFee: order.shippingFee,
        discountAmount: order.discountAmount,
        expectedDeliveryDate: order.expectedDeliveryDate ?? '',
        carrierId: order.carrierId ? String(order.carrierId) : '',
        trackingNo: order.trackingNo ?? '',
        notes: order.notes ?? '',
        items: [],
      });
    } catch (error) {
      this.loadError.set(errorText(error, 'تعذر تحميل الطلب'));
    } finally {
      this.loading.set(false);
    }
  }

  private async save() {
    const m = this.model();
    const method = Number(m.paymentMethod) as PaymentMethod;
    const shared = {
      recipientName: m.recipientName.trim(),
      altPhone: m.altPhone.trim() || null,
      regionId: m.regionId ? Number(m.regionId) : null,
      city: m.city.trim() || null,
      addressLine: m.addressLine.trim(),
      landmark: m.landmark.trim() || null,
      shippingFee: m.shippingFee || 0,
      discountAmount: m.discountAmount || 0,
      paymentMethod: method,
      depositAmount: method === PaymentMethod.CodWithDeposit ? m.depositAmount || 0 : 0,
      expectedDeliveryDate: m.expectedDeliveryDate || null,
      carrierId: m.carrierId ? Number(m.carrierId) : null,
      notes: m.notes.trim() || null,
    };

    const id = this.id();

    if (id) {
      return firstValueFrom(
        this.orders.update(Number(id), {
          ...shared,
          latitude: this.latitude,
          longitude: this.longitude,
          trackingNo: m.trackingNo.trim() || null,
        }),
      );
    }

    const items: OrderItemRequest[] = m.items.map((item) => ({
      productId: item.productId ? Number(item.productId) : null,
      productName: item.productName.trim(),
      variant: item.variant.trim() || null,
      quantity: item.quantity,
      unitPrice: item.unitPrice || 0,
    }));
    const request: CreateOrderRequest = {
      ...shared,
      orderNo: m.orderNo.trim() || null,
      recipientPhone: m.recipientPhone.trim(),
      items,
    };

    return firstValueFrom(this.orders.create(request));
  }
}
