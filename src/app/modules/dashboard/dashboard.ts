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
}

interface GroupSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutConfig {
  title: string;
  subtitle: string;
  segments: GroupSegment[];
}

interface BarRow {
  label: string;
  value: number;
}

interface BarChartConfig {
  title: string;
  color: string;
  rows: BarRow[];
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

  // ---- Group colors (shared across all donuts) ----
  private readonly groupColors = {
    hyderabad: '#6366f1',
    mumbai: '#f5a623',
    consultants: '#10b981',
  };

  /**
   * Live KPI cards, built straight from the /dashboard/summary response.
   * Falls back to em-dashes while loading/on error so the layout never
   * jumps or shows stale numbers.
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
      },
    ];
  });

  statsFootnote =
    "*Consultant/contractor rows don't split Gross vs Deductions in the source sheet — see Methodology. KPIs above recompute when you change the pay period or location filter in the top bar.";

  // ---- Donut charts: Manpower / Net Payable / CTC by Group ----
  // The /dashboard/summary endpoint returns one aggregate row for whatever
  // filter is selected (e.g. group: "ALL"), not a per-group breakdown, so
  // there's no live data source for a group-wise split yet. Kept as
  // clearly-labelled sample data below until a breakdown endpoint exists —
  // swap this block for real data the same way statCards was wired up.
  donuts: DonutConfig[] = [
    {
      title: 'Manpower by Group',
      subtitle: 'Hyderabad · Mumbai · Consultants (sample)',
      segments: [
        { label: 'Hyderabad', value: 1916, color: this.groupColors.hyderabad },
        { label: 'Mumbai', value: 4331, color: this.groupColors.mumbai },
        { label: 'Consultants', value: 65, color: this.groupColors.consultants },
      ],
    },
    {
      title: 'Net Payable by Group',
      subtitle: '₹ this pay period (sample)',
      segments: [
        { label: 'Hyderabad', value: 9.85, color: this.groupColors.hyderabad },
        { label: 'Mumbai', value: 21.9, color: this.groupColors.mumbai },
        { label: 'Consultants', value: 0.87, color: this.groupColors.consultants },
      ],
    },
    {
      title: 'CTC / Month by Group',
      subtitle: '₹ monthly cost-to-company (sample)',
      segments: [
        { label: 'Hyderabad', value: 9.6, color: this.groupColors.hyderabad },
        { label: 'Mumbai', value: 21.4, color: this.groupColors.mumbai },
        { label: 'Consultants', value: 0.92, color: this.groupColors.consultants },
      ],
    },
  ];

  // ---- Top 8 units by Net Payable, per group ----
  // Same caveat as the donuts above: sample data pending a unit-level
  // breakdown endpoint.
  barCharts: BarChartConfig[] = [
    {
      title: 'Top 8 Hyderabad Units by Net Payable (sample)',
      color: this.groupColors.hyderabad,
      rows: [
        { label: 'HHC - CORPORATE', value: 11500000 },
        { label: 'ADVANCED ENGINEERING GROUP', value: 10200000 },
        { label: 'HHC UNIT-1 ASSAM', value: 9900000 },
        { label: 'AZISTA COMPOSITES', value: 9700000 },
        { label: 'HHC UNIT-2 ASSAM', value: 8000000 },
        { label: 'AZISTA - AHMEDABAD - SATELLITE', value: 7500000 },
        { label: 'HHC - SPECIALITY CARE', value: 6000000 },
        { label: 'HHC UNIT-1 ASHYD', value: 5800000 },
      ],
    },
    {
      title: 'Top 8 Mumbai Units by Net Payable (sample)',
      color: this.groupColors.mumbai,
      rows: [
        { label: 'HHC - MAIN', value: 34000000 },
        { label: 'HHC - KRIS', value: 30500000 },
        { label: 'HHC - GENX', value: 29000000 },
        { label: 'HHC - FRENZA', value: 17000000 },
        { label: 'HHC - ONCOLOGY', value: 13000000 },
        { label: 'HHC - ASRA', value: 12000000 },
        { label: 'BLISS', value: 11000000 },
        { label: 'HHC - GASTRO', value: 10500000 },
      ],
    },
  ];

  /** Builds a CSS conic-gradient string from a donut's segments. */
  donutGradient(donut: DonutConfig): string {
    const total = donut.segments.reduce((sum, s) => sum + s.value, 0);
    let cursor = 0;
    const stops = donut.segments
      .filter((s) => s.value > 0)
      .map((s) => {
        const start = (cursor / total) * 100;
        cursor += s.value;
        const end = (cursor / total) * 100;
        return `${s.color} ${start}% ${end}%`;
      });
    return `conic-gradient(${stops.join(', ')})`;
  }

  /** Percentage share of a single segment within its donut, for optional display. */
  segmentPercent(donut: DonutConfig, segment: GroupSegment): number {
    const total = donut.segments.reduce((sum, s) => sum + s.value, 0);
    return total ? Math.round((segment.value / total) * 100) : 0;
  }

  /** Width (%) of a bar relative to the largest value in its chart. */
  barWidth(chart: BarChartConfig, row: BarRow): number {
    const max = Math.max(...chart.rows.map((r) => r.value));
    return max ? (row.value / max) * 100 : 0;
  }

  /** Evenly spaced axis tick values (5 ticks incl. 0) for a bar chart, in Indian numbering. */
  axisTicks(chart: BarChartConfig): string[] {
    const max = Math.max(...chart.rows.map((r) => r.value));
    const step = max / 4;
    return Array.from({ length: 5 }, (_, i) => this.formatIndian(Math.round(step * i)));
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
