import { Component, DestroyRef, effect, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterStateService } from '../../../base-layout/core/filter-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { payableService } from '../payable-summary.services';

interface ActiveFilters {
  payPeriod: string;
  location: string;
}

/** Shape of the /payable-summary response for the current filter selection. */
interface PayableSummary {
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

/** One column value in the consolidated summary table row. */
interface SummaryColumn {
  label: string;
  value: string;
}

/** One segment of a composition/flow bar, e.g. Net Salary's share of Gross. */
interface CompositionSegment {
  label: string;
  value: string;
  pct: number;
  color: string;
}

/** A single highlighted ratio tile, e.g. Payout Efficiency. */
interface RatioTile {
  label: string;
  value: string;
  caption: string;
  color: string;
}

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage.html',
  styleUrl: './manage.scss',
})
export class Manage implements OnInit {
  private filterState = inject(FilterStateService);
  private payableService = inject(payableService);
  private destroyRef = inject(DestroyRef);

  // ---- Reactive state ----
  currentFilters = signal<ActiveFilters>({ payPeriod: '', location: 'HYD' });
  summary = signal<PayableSummary | null>(null);
  loading = signal(false);
  loadError = signal(false);

  constructor() {
    effect(() => {
      const filters = this.filterState.filtersSignal();
      if (!filters.payPeriod) {
        return;
      }

      const prev = this.currentFilters();
      if (prev.payPeriod === filters.payPeriod && prev.location === filters.location) {
        return;
      }

      this.currentFilters.set(filters);
      this.fetchData();
    });
  }

  ngOnInit(): void {}

  fetchData(): void {
    if (!this.currentFilters().payPeriod) {
      return;
    }

    this.loading.set(true);
    this.loadError.set(false);

    const formData = new FormData();
    formData.append('payPeriod', this.currentFilters().payPeriod);
    formData.append('type', this.currentFilters().location);

    this.payableService.summary(formData).subscribe({
      next: (res: PayableSummary) => {
        this.summary.set(res ?? null);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching payable summary:', err);
        this.summary.set(null);
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  /** Display name for the single aggregate row the API currently returns. */
  rowLabel = computed<string>(() => {
    const s = this.summary();
    if (!s) return '';
    return s.businessUnitName ?? (s.group === 'ALL' ? 'All Business Units' : s.group);
  });

  /**
   * The consolidated summary table row, in the same column order as the
   * finance team's existing "Consolidated Summary" report (Business Unit,
   * Manpower, Expense/TEDA, Incentive, Net Salary, Total Net Payable,
   * Total Actual Gross, Total Deductions, CTC/Month) so this screen reads
   * the same way for anyone who already knows that sheet.
   */
  tableColumns = computed<SummaryColumn[]>(() => {
    const s = this.summary();
    if (!s) return [];
    return [
      { label: 'Manpower', value: this.formatIndian(s.manpower) },
      { label: 'Expense (TEDA)', value: `₹${this.formatIndian(s.teda)}` },
      { label: 'Incentive', value: `₹${this.formatIndian(s.incentive)}` },
      { label: 'Net Salary', value: `₹${this.formatIndian(s.netSalary)}` },
      { label: 'Total Net Payable', value: `₹${this.formatIndian(s.totalNetPayable)}` },
      { label: 'Total Actual Gross', value: `₹${this.formatIndian(s.totalActualGross)}` },
      { label: 'Total Deductions', value: `₹${this.formatIndian(s.totalDeductions)}` },
      { label: 'CTC / Month', value: `₹${this.formatIndian(s.ctcPerMonth)}` },
    ];
  });

  /** Quick-glance KPI strip, same visual language as the Executive Overview page. */
  statCards = computed(() => {
    const s = this.summary();
    if (!s) return [];
    return [
      { label: 'Total Manpower', value: this.formatIndian(s.manpower), color: '#4338ca', sublabel: `${s.group} · Pay Period ${s.payPeriod}` },
      { label: 'Total Net Payable', value: this.formatCr(s.totalNetPayable), color: '#2563eb', sublabel: `₹${this.formatIndian(s.totalNetPayable)}` },
      { label: 'Total Actual Gross', value: this.formatCr(s.totalActualGross), color: '#0f172a', sublabel: `₹${this.formatIndian(s.totalActualGross)}` },
      { label: 'Total Deductions', value: this.formatCr(s.totalDeductions), color: '#dc2626', sublabel: `₹${this.formatIndian(s.totalDeductions)}` },
      { label: 'Total CTC / Month', value: this.formatCr(s.ctcPerMonth), color: '#0ab86d', sublabel: `₹${this.formatIndian(s.ctcPerMonth)}`, badge: 'Approx' },
    ];
  });

  /**
   * Actual Gross broken into its three source components. These three
   * always sum exactly to Total Actual Gross (confirmed against the
   * sample payload), so the bar's segments always add to 100%.
   */
  grossComposition = computed<CompositionSegment[]>(() => {
    const s = this.summary();
    if (!s || !s.totalActualGross) return [];
    const pct = (n: number) => Math.round((n / s.totalActualGross) * 1000) / 10;
    return [
      { label: 'Net Salary', value: `₹${this.formatIndian(s.netSalary)}`, pct: pct(s.netSalary), color: '#4338ca' },
      { label: 'Expense (TEDA)', value: `₹${this.formatIndian(s.teda)}`, pct: pct(s.teda), color: '#2563eb' },
      { label: 'Incentive', value: `₹${this.formatIndian(s.incentive)}`, pct: pct(s.incentive), color: '#f59e0b' },
    ];
  });

  /** Gross → Deductions → Net Payable, as a two-segment flow bar. */
  payoutFlow = computed<CompositionSegment[]>(() => {
    const s = this.summary();
    if (!s || !s.totalActualGross) return [];
    const pct = (n: number) => Math.round((n / s.totalActualGross) * 1000) / 10;
    return [
      { label: 'Net Payable', value: `₹${this.formatIndian(s.totalNetPayable)}`, pct: pct(s.totalNetPayable), color: '#0ab86d' },
      { label: 'Deductions', value: `₹${this.formatIndian(s.totalDeductions)}`, pct: pct(s.totalDeductions), color: '#dc2626' },
    ];
  });

  /** Three director-level ratios that raw rupee figures don't surface on their own. */
  ratioTiles = computed<RatioTile[]>(() => {
    const s = this.summary();
    if (!s || !s.totalActualGross || !s.manpower) return [];

    const payoutEfficiency = (s.totalNetPayable / s.totalActualGross) * 100;
    const deductionRate = (s.totalDeductions / s.totalActualGross) * 100;
    const costPerHead = s.ctcPerMonth / s.manpower;

    return [
      {
        label: 'Payout Efficiency',
        value: `${payoutEfficiency.toFixed(1)}%`,
        caption: 'of gross reaches employees as net payable',
        color: '#0ab86d',
      },
      {
        label: 'Deduction Rate',
        value: `${deductionRate.toFixed(1)}%`,
        caption: 'of gross withheld across all deductions',
        color: '#dc2626',
      },
      {
        label: 'Avg. Cost / Head',
        value: `₹${this.formatIndian(costPerHead)}`,
        caption: 'monthly CTC per employee, this period',
        color: '#4338ca',
      },
    ];
  });

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