import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { errorText, ToastService } from '@tamam/core';
import { Badge, ImportKind, MoneyPipe, PageHeader, parseCsv } from '@tamam/shared';
import { firstValueFrom } from 'rxjs';

import { CreateOrderRequest, OrderImportResult } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';

const MAX_ROWS = 200;

/** Column names of the CSV file, in the order of the downloadable template. */
const COLUMNS = ['orderNo', 'recipientName', 'recipientPhone', 'city', 'addressLine', 'productName', 'variant', 'quantity', 'unitPrice', 'shippingFee', 'notes'] as const;

const TEMPLATE = [
  COLUMNS.join(','),
  'A-1001,منى أحمد,01012345678,الإسكندرية,12 شارع البحر بجوار الصيدلية,قميص قطن,أزرق M,2,250,40,',
  'A-1001,منى أحمد,01012345678,الإسكندرية,12 شارع البحر بجوار الصيدلية,حزام جلد,,1,120,40,',
  'A-1002,كريم سامي,01123456789,الجيزة,5 شارع التحرير,حذاء رياضي,43,1,890,50,يفضل بعد الظهر',
].join('\n');

interface PreviewOrder {
  request: CreateOrderRequest;
  total: number;
}

@Component({
  selector: 'tamam-order-import-page',
  imports: [RouterLink, PageHeader, Badge, MoneyPipe],
  templateUrl: './order-import-page.html',
})
export class OrderImportPage {
  private readonly service = inject(OrdersService);
  private readonly toast = inject(ToastService);
  protected readonly fileName = signal('');
  protected readonly orders = signal<PreviewOrder[]>([]);
  protected readonly problems = signal<string[]>([]);
  protected readonly kind = signal<ImportKind>(ImportKind.Regular);
  protected readonly importing = signal(false);
  protected readonly result = signal<OrderImportResult | null>(null);
  protected readonly serverError = signal<string | null>(null);
  protected readonly kinds = [
    { value: ImportKind.Regular, label: 'طلبات جديدة', hint: 'تُقيَّم مخاطرها ويُجهَّز لها رابط تأكيد' },
    { value: ImportKind.Historical, label: 'طلبات سابقة', hint: 'لتغذية سجل العملاء فقط، بدون تأكيد' },
  ];
  protected readonly tooMany = computed(() => this.orders().length > MAX_ROWS);
  protected readonly canImport = computed(
    () => this.orders().length > 0 && !this.tooMany() && !this.importing() && this.result() === null,
  );

  protected downloadTemplate(): void {
    const blob = new Blob(['﻿' + TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'tamam-orders-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  protected async onFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];

    this.result.set(null);
    this.serverError.set(null);

    if (!file) {
      return;
    }

    this.fileName.set(file.name);
    this.read(await file.text());
  }

  protected async submit(): Promise<void> {
    this.importing.set(true);
    this.serverError.set(null);

    try {
      const result = await firstValueFrom(
        this.service.import({
          fileName: this.fileName(),
          kind: this.kind(),
          orders: this.orders().map((order) => order.request),
        }),
      );

      this.result.set(result);
      this.toast.success(`تم استيراد ${result.rowsImported} من ${result.rowsTotal} طلب`);
    } catch (error) {
      this.serverError.set(errorText(error, 'تعذر استيراد الملف'));
    } finally {
      this.importing.set(false);
    }
  }

  protected reset(): void {
    this.fileName.set('');
    this.orders.set([]);
    this.problems.set([]);
    this.result.set(null);
  }

  private read(text: string): void {
    const rows = parseCsv(text);
    const problems: string[] = [];
    const [header, ...body] = rows;

    if (!header) {
      this.orders.set([]);
      this.problems.set(['الملف فارغ']);

      return;
    }

    const index = new Map(header.map((name, position) => [name.trim(), position]));
    const missing = ['recipientName', 'recipientPhone', 'addressLine', 'productName', 'quantity', 'unitPrice'].filter(
      (name) => !index.has(name),
    );

    if (missing.length > 0) {
      this.orders.set([]);
      this.problems.set([`أعمدة ناقصة في الملف: ${missing.join('، ')}. حمّل النموذج واتبع أسماء الأعمدة.`]);

      return;
    }

    const cell = (row: string[], name: string): string => row[index.get(name) ?? -1]?.trim() ?? '';
    const grouped = new Map<string, CreateOrderRequest>();

    body.forEach((row, position) => {
      const line = position + 2;
      const name = cell(row, 'recipientName');
      const phone = cell(row, 'recipientPhone');
      const address = cell(row, 'addressLine');
      const product = cell(row, 'productName');
      const quantity = Number(cell(row, 'quantity') || 1);
      const price = Number(cell(row, 'unitPrice') || 0);

      if (!name || !phone || !address || !product) {
        problems.push(`السطر ${line}: الاسم والهاتف والعنوان واسم المنتج مطلوبة`);

        return;
      }

      if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(price) || price < 0) {
        problems.push(`السطر ${line}: الكمية أو السعر غير صحيح`);

        return;
      }

      const orderNo = cell(row, 'orderNo');
      const key = orderNo || `row-${line}`;
      const item = { productId: null, productName: product, variant: cell(row, 'variant') || null, quantity, unitPrice: price };
      const existing = grouped.get(key);

      if (existing) {
        existing.items.push(item);

        return;
      }

      grouped.set(key, {
        orderNo: orderNo || null,
        recipientName: name,
        recipientPhone: phone,
        altPhone: null,
        regionId: null,
        city: cell(row, 'city') || null,
        addressLine: address,
        landmark: null,
        shippingFee: Number(cell(row, 'shippingFee') || 0) || 0,
        discountAmount: 0,
        paymentMethod: 1,
        depositAmount: 0,
        expectedDeliveryDate: null,
        carrierId: null,
        notes: cell(row, 'notes') || null,
        items: [item],
      });
    });

    this.problems.set(problems);
    this.orders.set(
      [...grouped.values()].map((request) => ({
        request,
        total: request.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) + request.shippingFee,
      })),
    );
  }
}
