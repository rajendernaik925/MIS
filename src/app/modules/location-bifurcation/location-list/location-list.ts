import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GroupSummary {
  key: 'hyderabad' | 'mumbai' | 'consultants';
  label: string;
  manpower: number;
  manpowerPct: number;
  netPayable: number;       // raw rupee value
  netPayableCr: number;     // for card display (in Cr)
}

interface ChartBar {
  label: string;
  value: number;
  colorClass: string;
}

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-list.html',
  styleUrl: './location-list.scss',
})
export class LocationList {
  summaries: GroupSummary[] = [
    {
      key: 'hyderabad',
      label: 'Hyderabad — Full-Time',
      manpower: 1916,
      manpowerPct: 30.4,
      netPayable: 10810000 * 10, // 10.81 Cr in rupees
      netPayableCr: 10.81,
    },
    {
      key: 'mumbai',
      label: 'Mumbai — Full-Time',
      manpower: 4331,
      manpowerPct: 68.6,
      netPayable: 20680000 * 10, // 20.68 Cr in rupees
      netPayableCr: 20.68,
    },
    {
      key: 'consultants',
      label: 'Consultants / Contractors',
      manpower: 65,
      manpowerPct: 1.0,
      netPayable: 1130000 * 10, // 1.13 Cr in rupees
      netPayableCr: 1.13,
    },
  ];

  get manpowerChart(): ChartBar[] {
    return this.summaries.map(s => ({
      label: this.shortLabel(s.key),
      value: s.manpower,
      colorClass: s.key,
    }));
  }

  get netPayableChart(): ChartBar[] {
    return this.summaries.map(s => ({
      label: this.shortLabel(s.key),
      value: s.netPayable,
      colorClass: s.key,
    }));
  }

  get avgCostPerHeadChart(): ChartBar[] {
    return this.summaries.map(s => ({
      label: this.shortLabel(s.key),
      value: s.manpower > 0 ? Math.round(s.netPayable / s.manpower) : 0,
      colorClass: s.key,
    }));
  }

  private shortLabel(key: string): string {
    switch (key) {
      case 'hyderabad':
        return 'Hyderabad';
      case 'mumbai':
        return 'Mumbai';
      case 'consultants':
        return 'Consultants';
      default:
        return key;
    }
  }

  // Returns bar height as a percentage of the tallest bar in the given chart
  getBarHeightPct(bar: ChartBar, chart: ChartBar[]): number {
    const max = Math.max(...chart.map(b => b.value), 1);
    return (bar.value / max) * 100;
  }

  // Builds evenly spaced Y-axis tick labels for a chart, top to bottom
  getYAxisTicks(chart: ChartBar[], tickCount = 6): number[] {
    const max = Math.max(...chart.map(b => b.value), 1);
    // Round the max up to a "nice" number
    const niceMax = this.niceCeiling(max);
    const step = niceMax / (tickCount - 1);
    const ticks: number[] = [];
    for (let i = tickCount - 1; i >= 0; i--) {
      ticks.push(Math.round(step * i));
    }
    return ticks;
  }

  getBarHeightPctAgainstAxis(bar: ChartBar, ticks: number[]): number {
    const max = ticks[0] || 1;
    return (bar.value / max) * 100;
  }

  private niceCeiling(value: number): number {
    if (value === 0) return 1;
    const exponent = Math.floor(Math.log10(value));
    const magnitude = Math.pow(10, exponent);
    const residual = value / magnitude;
    let niceResidual: number;
    if (residual <= 1) niceResidual = 1;
    else if (residual <= 2) niceResidual = 2;
    else if (residual <= 2.5) niceResidual = 2.5;
    else if (residual <= 5) niceResidual = 5;
    else niceResidual = 10;
    return niceResidual * magnitude;
  }

  formatCompact(value: number): string {
    return value.toLocaleString('en-IN');
  }

  formatIndianNumber(value: number): string {
    return Math.round(value).toLocaleString('en-IN');
  }
}