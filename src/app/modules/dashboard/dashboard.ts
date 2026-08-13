import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal, computed } from '@angular/core';
import { FilterStateService } from '../../base-layout/core/filter-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { dashboardService } from './dashboard.service';

/** Shape of the KPI summary the /dashboard/summary endpoint returns. */
interface DashboardSummary {
  fyYear: string;
  payPeriod: number;
  businessUnitId: number | null;
  businessUnitName: string | null;
  group: string;
  manpower: number;
  teda: number;
  incentive: number;
  netSalary: number;
  totalNetPayable: number;
  totalActualGross: number;
  totalDeductions: number;
  ctcPerMonth: number;
}

interface StatCard {
  label: string;
  value: string;
  valueColor: string;
  sublabel: string;
  badge?: string;
  note?: string;
}

/** One label/value field rendered as a table row. */
interface SummaryField {
  label: string;
  value: string;
}

/** One bar in a vertical monthly-trend chart. */
interface MonthlyPoint {
  month: string;
  value: number;
  tooltipValue: string;
}

interface BusinessUnitOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private filterState = inject(FilterStateService);
  private destroyRef = inject(DestroyRef);
  private dashboardService = inject(dashboardService);

  // ---- Reactive state ----
  // Signals throughout, same pattern as the Payable Summary `List`
  // component: writes from the HTTP callback land directly in Angular's
  // reactive graph, so the KPI cards always reflect the latest response
  // without any NG0100 / stale-view risk.
  summary = signal<DashboardSummary | null>(null);
  loading = signal(false);
  loadError = signal(false);

  constructor() {
    effect(() => {
      const filters = this.filterState.filtersSignal();
      // Wait for the filter bar to resolve a real pay period before firing.
      if (!filters.payPeriod) {
        return;
      }
      this.loadDashboardData(filters);
    });
  }

  private loadDashboardData(filters: { payPeriod: string; location: string }): void {
    this.loading.set(true);
    this.loadError.set(false);

    const formData = new FormData();
    formData.append('payPeriod', filters.payPeriod);
    formData.append('type', filters.location);

    // NOTE: previously this called `summary(new FormData())` — an empty
    // FormData thrown away right after building the real one — so the
    // backend never actually received payPeriod/type. Passing `formData`
    // through is the fix.
    this.dashboardService.summary(formData).subscribe({
      next: (res: DashboardSummary) => {
        this.summary.set(res ?? null);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching dashboard data:', err);
        this.summary.set(null);
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  /**
   * Live KPI cards, built straight from the /dashboard/summary response.
   * Falls back to em-dashes while loading/on error so the layout never
   * jumps or shows stale numbers.
   *
   * The CTC card carries an "Approx" badge (rendered as a corner chip,
   * not inline with the value, so the value always has full width to
   * render without truncating) and a note underneath the exact rupee
   * amount, since CTC/Month is an estimate that includes annualised
   * components spread across the year.
   *
   * Exactly 5 cards — Manpower, Net Payable, Actual Gross, Deductions,
   * CTC/Month. The dash__stats grid below is sized for 5 columns to
   * match.
   */
  statCards = computed<StatCard[]>(() => {
    const s = this.summary();

    if (!s) {
      const placeholder = this.loading() ? '···' : '—';
      return [
        { label: 'Total Manpower', value: placeholder, valueColor: '#4338ca', sublabel: this.loading() ? 'Loading…' : 'No data for this selection' },
        { label: 'Total Net Payable', value: placeholder, valueColor: '#2563eb', sublabel: '' },
        { label: 'Total Actual Gross', value: placeholder, valueColor: '#0f172a', sublabel: '' },
        { label: 'Total Deductions', value: placeholder, valueColor: '#dc2626', sublabel: '' },
        { label: 'Total CTC / Month', value: placeholder, valueColor: '#0ab86d', sublabel: '' },
      ];
    }

    return [
      {
        label: 'Total Manpower',
        value: this.formatIndian(s.manpower),
        valueColor: '#4338ca',
        sublabel: `${s.group} · Pay Period ${s.payPeriod}`,
      },
      {
        label: 'Total Net Payable',
        value: this.formatCr(s.totalNetPayable),
        valueColor: '#2563eb',
        sublabel: `₹${this.formatIndian(s.totalNetPayable)} bank credit`,
      },
      {
        label: 'Total Actual Gross',
        value: this.formatCr(s.totalActualGross),
        valueColor: '#0f172a',
        sublabel: `₹${this.formatIndian(s.totalActualGross)} gross`,
      },
      {
        label: 'Total Deductions',
        value: this.formatCr(s.totalDeductions),
        valueColor: '#dc2626',
        sublabel: `₹${this.formatIndian(s.totalDeductions)}`,
      },
      {
        label: 'Total CTC / Month',
        value: this.formatCr(s.ctcPerMonth),
        valueColor: '#0ab86d',
        sublabel: `₹${this.formatIndian(s.ctcPerMonth)}`,
        badge: 'Approx',
        note: 'Including all annual components',
      },
    ];
  });

  statsFootnote =
    "*Consultant/contractor rows don't split Gross vs Deductions in the source sheet — see Methodology. KPIs above recompute when you change the pay period or location filter in the top bar.";

  /**
   * Full summary breakdown, split into two flat halves and rendered as
   * two separate plain <table> elements side by side with a gap between
   * them, both inside a single shared card. Built straight off the same
   * `summary()` signal the KPI cards use — no extra HTTP call.
   */
  private summaryFields = computed<SummaryField[]>(() => {
    const s = this.summary();
    if (!s) {
      return [];
    }

    return [
      { label: 'FY Year', value: s.fyYear },
      { label: 'Pay Period', value: String(s.payPeriod) },
      { label: 'Business Unit', value: s.businessUnitName ?? 'All units' },
      { label: 'Group', value: s.group },
      { label: 'Manpower', value: this.formatIndian(s.manpower) },
      { label: 'TEDA', value: `₹${this.formatIndian(s.teda)}` },
      { label: 'Incentive', value: `₹${this.formatIndian(s.incentive)}` },
      { label: 'Net Salary', value: `₹${this.formatIndian(s.netSalary)}` },
      { label: 'Total Net Payable', value: `₹${this.formatIndian(s.totalNetPayable)}` },
      { label: 'Total Actual Gross', value: `₹${this.formatIndian(s.totalActualGross)}` },
      { label: 'Total Deductions', value: `₹${this.formatIndian(s.totalDeductions)}` },
      { label: 'CTC / Month', value: `₹${this.formatIndian(s.ctcPerMonth)}` },
    ];
  });

  summaryLeft = computed<SummaryField[]>(() => {
    const half = Math.ceil(this.summaryFields().length / 2);
    return this.summaryFields().slice(0, half);
  });

  summaryRight = computed<SummaryField[]>(() => {
    const half = Math.ceil(this.summaryFields().length / 2);
    return this.summaryFields().slice(half);
  });

  // ---- Business unit filter for the monthly trend charts ----
  businessUnits: BusinessUnitOption[] = [
    { id: 'all', name: 'All Business Units' },
    { id: 'hhc-corporate', name: 'HHC - Corporate' },
    { id: 'hhc-main', name: 'HHC - Main' },
    { id: 'hhc-kris', name: 'HHC - Kris' },
    { id: 'advanced-eng', name: 'Advanced Engineering Group' },
    { id: 'azista-composites', name: 'Azista Composites' },
  ];

  selectedBusinessUnit = signal<string>('all');

  onBusinessUnitChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedBusinessUnit.set(value);
  }

  // ---- Monthly trend charts: CTC / Month and Manpower, Jan–Dec ----
  // Sample data pending a real monthly-trend-by-business-unit endpoint.
  // `monthlyFactor()` just scales the "All Business Units" baseline so
  // picking a unit from the dropdown visibly changes the charts — replace
  // this whole block with a live fetch keyed on selectedBusinessUnit()
  // once that endpoint exists.
  private readonly monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  private readonly ctcMonthlyBaseCr = [28.4, 29.1, 30.0, 29.6, 30.8, 31.2, 31.92, 32.1, 31.5, 30.9, 31.4, 32.0];
  private readonly manpowerMonthlyBase = [5980, 6025, 6080, 6110, 6150, 6200, 6312, 6280, 6260, 6240, 6300, 6350];

  private readonly businessUnitFactors: Record<string, number> = {
    all: 1,
    'hhc-corporate': 0.18,
    'hhc-main': 0.32,
    'hhc-kris': 0.22,
    'advanced-eng': 0.15,
    'azista-composites': 0.13,
  };

  private monthlyFactor(): number {
    return this.businessUnitFactors[this.selectedBusinessUnit()] ?? 1;
  }

  ctcMonthly = computed<MonthlyPoint[]>(() => {
    const factor = this.monthlyFactor();
    return this.monthLabels.map((month, i) => {
      const value = +(this.ctcMonthlyBaseCr[i] * factor).toFixed(2);
      return { month, value, tooltipValue: `₹${value} Cr (Approx)` };
    });
  });

  manpowerMonthly = computed<MonthlyPoint[]>(() => {
    const factor = this.monthlyFactor();
    return this.monthLabels.map((month, i) => {
      const value = Math.round(this.manpowerMonthlyBase[i] * factor);
      return { month, value, tooltipValue: `${this.formatIndian(value)} (Approx)` };
    });
  });

  /** Height (%) of a vertical bar relative to the largest value in its series. */
  vbarHeight(points: MonthlyPoint[], point: MonthlyPoint): number {
    const max = Math.max(...points.map((p) => p.value));
    return max ? (point.value / max) * 100 : 0;
  }

  /** Formats a number using Indian digit grouping, e.g. 15000000 -> "1,50,00,000". */
  formatIndian(value: number): string {
    const [intPart, decPart] = Math.round(value).toString().split('.');
    const negative = intPart.startsWith('-');
    const digits = negative ? intPart.slice(1) : intPart;

    let formatted: string;
    if (digits.length <= 3) {
      formatted = digits;
    } else {
      const last3 = digits.slice(-3);
      const rest = digits.slice(0, -3);
      const groups = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
      formatted = `${groups},${last3}`;
    }

    return `${negative ? '-' : ''}${formatted}${decPart ? '.' + decPart : ''}`;
  }

  /** Formats a rupee amount in Crores, e.g. 335419563 -> "₹33.54 Cr". */
  formatCr(value: number): string {
    return `₹${(value / 1e7).toFixed(2)} Cr`;
  }
}