import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FilterStateService } from '../../base-layout/core/filter-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs/operators';
import { OpenaiService } from '../openai';
import { HttpErrorResponse } from '@angular/common/http';

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
export class Dashboard implements OnInit {

  private filterState = inject(FilterStateService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.filterState.filters.pipe(
      distinctUntilChanged((prev, curr) =>
        prev.payPeriod === curr.payPeriod && prev.location === curr.location
      ),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((filters) => {
      this.loadDashboardData(filters);
    });
  }

  private loadDashboardData(filters: { payPeriod: string; location: string }): void {
    console.log('Loading dashboard data for:', filters);
  }

  // private TextInformation(): void {
  //   const formData = new FormData();
  //   formData.append('key', 'value'); // Add any necessary key-value pairs to the FormData
  //   this.OpenaiService.textInformation(formData).subscribe({
  //     next: (res: any) => {
  //       console.log('Text information response:', res);
  //     },
  //     error: (err: HttpErrorResponse) => {
  //       console.error('Error fetching text information:', err);
  //     }
  //   }
  //   );
  // }


  // ---- Group colors (shared across all donuts) ----
  private readonly groupColors = {
    hyderabad: '#312e81',
    mumbai: '#f5a623',
    consultants: '#0ab86d',
  };

  // ---- Top stat cards ----
  statCards: StatCard[] = [
    {
      label: 'Total Manpower',
      value: '6,312',
      valueColor: '#4338ca',
      sublabel: 'HYD 1,916 · MUM 4,331 · CON 65',
    },
    {
      label: 'Total Net Payable',
      value: '₹32.62 Cr',
      valueColor: '#2563eb',
      sublabel: '₹32,61,66,162 bank credit',
    },
    {
      label: 'Total Actual Gross',
      value: '₹34.08 Cr',
      valueColor: '#0f172a',
      sublabel: 'HYD + MUM only*',
    },
    {
      label: 'Total Deductions',
      value: '₹2.59 Cr',
      valueColor: '#dc2626',
      sublabel: 'HYD + MUM only*',
    },
    {
      label: 'Total CTC / Month',
      value: '₹31.92 Cr',
      valueColor: '#0ab86d',
      sublabel: '₹31,92,46,892',
    },
  ];

  statsFootnote =
    "*Consultant/contractor rows don't split Gross vs Deductions in the source sheet — see Methodology. KPIs above recompute when you change the group filter in the top bar.";

  // ---- Donut charts: Manpower / Net Payable / CTC by Group ----
  donuts: DonutConfig[] = [
    {
      title: 'Manpower by Group',
      subtitle: 'Hyderabad · Mumbai · Consultants',
      segments: [
        { label: 'Hyderabad', value: 1916, color: this.groupColors.hyderabad },
        { label: 'Mumbai', value: 4331, color: this.groupColors.mumbai },
        { label: 'Consultants', value: 65, color: this.groupColors.consultants },
      ],
    },
    {
      title: 'Net Payable by Group',
      subtitle: '₹ this pay period',
      segments: [
        { label: 'Hyderabad', value: 9.85, color: this.groupColors.hyderabad },
        { label: 'Mumbai', value: 21.9, color: this.groupColors.mumbai },
        { label: 'Consultants', value: 0.87, color: this.groupColors.consultants },
      ],
    },
    {
      title: 'CTC / Month by Group',
      subtitle: '₹ monthly cost-to-company',
      segments: [
        { label: 'Hyderabad', value: 9.6, color: this.groupColors.hyderabad },
        { label: 'Mumbai', value: 21.4, color: this.groupColors.mumbai },
        { label: 'Consultants', value: 0.92, color: this.groupColors.consultants },
      ],
    },
  ];

  // ---- Top 8 units by Net Payable, per group ----
  barCharts: BarChartConfig[] = [
    {
      title: 'Top 8 Hyderabad Units by Net Payable',
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
      title: 'Top 8 Mumbai Units by Net Payable',
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
}