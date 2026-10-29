import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Logo, MoneyPipe } from '@tamam/shared';
import { catchError, of } from 'rxjs';

import { PublicPlansService } from '../../services/public-plans.service';

interface DemoCase {
  key: 'low' | 'medium' | 'high';
  tab: string;
  customer: string;
  city: string;
  total: string;
  score: number;
  level: string;
  action: string;
  signals: { text: string; points: number }[];
}

const DEMO_CASES: readonly DemoCase[] = [
  {
    key: 'low',
    tab: 'عميل معروف',
    customer: 'منى أحمد',
    city: 'الإسكندرية',
    total: '640 ج.م',
    score: 18,
    level: 'مخاطرة منخفضة',
    action: 'يكفي تأكيد الطلب على واتساب ثم الشحن.',
    signals: [
      { text: 'استلمت 4 طلبات سابقة من متجرك دون مشاكل', points: -12 },
      { text: 'العنوان كامل وفيه علامة مميزة', points: 0 },
      { text: 'قيمة الطلب ضمن المعتاد', points: 0 },
    ],
  },
  {
    key: 'medium',
    tab: 'أول طلب',
    customer: 'كريم سامي',
    city: 'الجيزة',
    total: '1,250 ج.م',
    score: 52,
    level: 'مخاطرة متوسطة',
    action: 'أرسل رابط التأكيد ولا تشحن قبل رد العميل.',
    signals: [
      { text: 'أول طلب من هذا العميل عندك', points: 20 },
      { text: 'العنوان بدون علامة مميزة', points: 15 },
      { text: 'الطلب وصل بعد منتصف الليل', points: 17 },
    ],
  },
  {
    key: 'high',
    tab: 'سجل رفض',
    customer: 'هشام فؤاد',
    city: 'المنصورة',
    total: '3,900 ج.م',
    score: 86,
    level: 'مخاطرة عالية',
    action: 'اطلب عربونًا أو راجع الطلب يدويًا قبل الشحن.',
    signals: [
      { text: 'رفض 3 طلبات سابقة عندك', points: 40 },
      { text: 'الرقم مرتبط برفض عند تجار آخرين في الشبكة', points: 28 },
      { text: 'قيمة الطلب أعلى من 3 أضعاف المعتاد', points: 18 },
    ],
  },
];

@Component({
  selector: 'tamam-landing-page',
  imports: [RouterLink, Logo, MoneyPipe],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  protected readonly cases = DEMO_CASES;
  protected readonly selected = signal<DemoCase['key']>('high');
  protected readonly current = computed(() => DEMO_CASES.find((c) => c.key === this.selected()) ?? DEMO_CASES[0]);
  protected readonly menuOpen = signal(false);
  protected readonly plans = toSignal(
    inject(PublicPlansService)
      .getPlans()
      .pipe(catchError(() => of([]))),
    { initialValue: null },
  );
  protected readonly steps = [
    { title: 'سجّل الطلب', text: 'أضفه يدويًا أو ارفع ملف CSV، أو اربط متجرك بمفتاح API.' },
    { title: 'شوف التقييم وأسبابه', text: 'درجة من 100 مع شرح بالعربي لكل إشارة، وتوصية واضحة بما تفعله.' },
    { title: 'أكّد مع العميل', text: 'رابط تأكيد ورسالة واتساب جاهزة. العميل يؤكد أو يؤجل أو يلغي بنفسه.' },
    { title: 'اعرف من المسؤول', text: 'لو رُفض الطلب، يتحدد السبب والمسؤول وقيمة الخسارة.' },
  ];
  protected readonly features = [
    { icon: 'bi-shield-check', title: 'تقييم مخاطر بقواعد واضحة', text: 'لا صندوق أسود. كل نقطة في الدرجة لها سبب تقرؤه وتقتنع به.' },
    { icon: 'bi-whatsapp', title: 'تأكيد عبر واتساب', text: 'رسالة جاهزة بالعربي وفتح مباشر للمحادثة، بدون تكلفة رسائل في البداية.' },
    { icon: 'bi-people', title: 'ذاكرة عملاء مشتركة', text: 'بعد موافقتك، تستفيد من سجل الرفض في الشبكة، ويستفيد غيرك من سجلك.' },
    { icon: 'bi-bar-chart-line', title: 'تقارير الجودة والخسائر', text: 'نسبة التسليم والرفض وخسائر الشحن والمرتجع شهرًا بشهر.' },
    { icon: 'bi-plug', title: 'ربط بمتجرك', text: 'مفتاح API لإرسال الطلبات تلقائيًا من موقعك دون تكرار الطلب الواحد.' },
    { icon: 'bi-person-lock', title: 'خصوصية العميل أولًا', text: 'العميل يوقف الرسائل أو يطلب حذف بياناته بنفسه من الرابط.' },
  ];
  protected readonly parties = [
    { name: 'العميل', icon: 'bi-person', text: 'غيّر رأيه، لا يرد، أو لا يملك المال وقت التسليم.' },
    { name: 'التاجر', icon: 'bi-shop', text: 'منتج مختلف عن الإعلان، سعر غير متفق عليه، أو تأخر في الشحن.' },
    { name: 'شركة الشحن', icon: 'bi-truck', text: 'سلوك المندوب، أو عنوان لم يُبحث عنه فعلًا.' },
    { name: 'محايد', icon: 'bi-dash-circle', text: 'ظرف لا يمكن نسبته لأحد، ولا يُحسب على أي طرف.' },
  ];
  protected readonly faqs = [
    { q: 'هل أحتاج واتساب بزنس API؟', a: 'لا. نبدأ برابط واتساب يفتح المحادثة برسالة جاهزة تضغط إرسال بنفسك. ربط Cloud API يضاف لاحقًا لمن يحتاجه.' },
    { q: 'هل التقييم يمنع الطلب تلقائيًا؟', a: 'لا. التقييم توصية فقط، والقرار لك دائمًا. ويمكنك تشغيل الوضع التجريبي لترى التقييم دون أي تأثير على عملك.' },
    { q: 'كيف يحدد تمام المسؤول عن الرفض؟', a: 'من سبب الرفض الذي يذكره التاجر وإجابة العميل نفسه في استبيان قصير. إذا اختلفت الإجابتان يُعتبر الطلب موضع نزاع.' },
    { q: 'ماذا عن بيانات عملائي؟', a: 'تبقى بياناتك مفصولة عن غيرك. المشاركة مع الشبكة اختيارية وتتحكم فيها من الإعدادات في أي وقت.' },
    { q: 'هل توجد تجربة مجانية؟', a: 'نعم، 14 يومًا عند التسجيل بدون بطاقة دفع.' },
  ];

  protected select(key: DemoCase['key']): void {
    this.selected.set(key);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}
