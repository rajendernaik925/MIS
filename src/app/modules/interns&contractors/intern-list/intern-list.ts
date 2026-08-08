import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ConsultantDivision {
  division: string;
  manpower: number;
  netPayable: number;
  ctcPerMonth: number;
}

interface InternDeptRow {
  department: string;
  interns: number;
  avgStipend: number;
  deptBudget: number;
  color: string;
}

@Component({
  selector: 'app-intern-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intern-list.html',
  styleUrl: './intern-list.scss',
})
export class InternList {
  // ---- Contractors / Consultants (live data) ----
  totalDivisions = 10;
  totalManpower = 65;
  totalNetPayable = 11260948;

  consultantDivisions: ConsultantDivision[] = [
    { division: 'Consultant (Hetero)', manpower: 8, netPayable: 996747, ctcPerMonth: 996747 },
    { division: 'Azista Magenet Park', manpower: 5, netPayable: 495000, ctcPerMonth: 495000 },
    { division: 'Image processing (APRILL)', manpower: 4, netPayable: 731666, ctcPerMonth: 731666 },
    { division: 'Aerospace (BD)', manpower: 3, netPayable: 305000, ctcPerMonth: 305000 },
    { division: 'AEG', manpower: 35, netPayable: 7240402, ctcPerMonth: 7240402 },
    { division: 'Azista Food', manpower: 1, netPayable: 135000, ctcPerMonth: 135000 },
    { division: 'Azista (Lakdaram)', manpower: 1, netPayable: 130000, ctcPerMonth: 130000 },
    { division: 'Intl. Mktg', manpower: 1, netPayable: 216333, ctcPerMonth: 216333 },
    { division: 'Consultant (Azista-Composites)', manpower: 7, netPayable: 1010800, ctcPerMonth: 1010800 },
    { division: 'Consultant (ABA)', manpower: 0, netPayable: 0, ctcPerMonth: 0 },
  ];

  // ---- Interns (illustrative sample data) ----
  totalInterns = 28;
  monthlyStipendBudget = 386000;
  get avgStipendPerIntern(): number {
    return Math.round(this.monthlyStipendBudget / this.totalInterns);
  }
  pctOfGrandCtc = 0.12;

  internDepartments: InternDeptRow[] = [
    { department: 'R&D', interns: 8, avgStipend: 15000, deptBudget: 120000, color: '#312e81' },
    { department: 'IT', interns: 6, avgStipend: 18000, deptBudget: 108000, color: '#f59e0b' },
    { department: 'Quality', interns: 4, avgStipend: 12000, deptBudget: 48000, color: '#059669' },
    { department: 'Production', interns: 5, avgStipend: 10000, deptBudget: 50000, color: '#9ca3af' },
    { department: 'HR & Admin', interns: 2, avgStipend: 12000, deptBudget: 24000, color: '#c7d2fe' },
    { department: 'Sales & Marketing', interns: 3, avgStipend: 12000, deptBudget: 36000, color: '#dc2626' },
  ];

  // ---- Donut chart (interns by department) ----
  get donutSegments(): { color: string; pct: number; dashOffset: number }[] {
    const total = this.internDepartments.reduce((sum, d) => sum + d.interns, 0);
    let cumulative = 0;
    return this.internDepartments.map(d => {
      const pct = (d.interns / total) * 100;
      const segment = { color: d.color, pct, dashOffset: cumulative };
      cumulative += pct;
      return segment;
    });
  }

  // conic-gradient string built from segments
  get donutGradient(): string {
    let cumulative = 0;
    const stops: string[] = [];
    for (const d of this.internDepartments) {
      const total = this.internDepartments.reduce((sum, x) => sum + x.interns, 0);
      const pct = (d.interns / total) * 100;
      const start = cumulative;
      const end = cumulative + pct;
      stops.push(`${d.color} ${start}% ${end}%`);
      cumulative = end;
    }
    return `conic-gradient(${stops.join(', ')})`;
  }

  // ---- Horizontal bar chart (stipend budget by department) ----
  get budgetXAxisTicks(): number[] {
    const max = Math.max(...this.internDepartments.map(d => d.deptBudget), 1);
    return this.buildNiceTicks(max, 7).reverse();
  }

  getBudgetBarWidthPct(value: number, ticks: number[]): number {
    const max = ticks[ticks.length - 1] || 1;
    return (value / max) * 100;
  }

  private buildNiceTicks(max: number, tickCount: number): number[] {
    const niceMax = this.niceCeiling(max);
    const step = niceMax / (tickCount - 1);
    const ticks: number[] = [];
    for (let i = tickCount - 1; i >= 0; i--) {
      ticks.push(Math.round(step * i));
    }
    return ticks;
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

  formatRupee(value: number): string {
    return '₹' + Math.round(value).toLocaleString('en-IN');
  }

  formatIndianNumber(value: number): string {
    return Math.round(value).toLocaleString('en-IN');
  }
}