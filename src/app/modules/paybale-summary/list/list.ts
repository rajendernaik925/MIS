import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BusinessUnitRow {
  group: 'HYD' | 'MUM' | 'CON';
  businessUnit: string;
  manpower: number;
  teda: number;
  incentive: number;
  netSalary: number;
  netPayable: number;
  actualGross: number | null;
  deductions: number | null;
  ctcPerMonth: number;
}

type SortKey = keyof BusinessUnitRow;
type GroupFilter = 'ALL' | 'HYD' | 'MUM' | 'CON';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
export class List {
  payPeriod = '202607';
  totalBusinessUnits = 45;

  allRows: BusinessUnitRow[] = [
    { group: 'CON', businessUnit: 'AEG', manpower: 35, teda: 0, incentive: 0, netSalary: 7240402, netPayable: 7240402, actualGross: null, deductions: null, ctcPerMonth: 7240402 },
    { group: 'CON', businessUnit: 'Consultant (Azista-Composites)', manpower: 7, teda: 0, incentive: 0, netSalary: 1010800, netPayable: 1010800, actualGross: null, deductions: null, ctcPerMonth: 1010800 },
    { group: 'CON', businessUnit: 'Consultant (Hetero)', manpower: 8, teda: 50000, incentive: 0, netSalary: 946747, netPayable: 996747, actualGross: null, deductions: null, ctcPerMonth: 996747 },
    { group: 'CON', businessUnit: 'Image processing (APRILL)', manpower: 4, teda: 0, incentive: 0, netSalary: 731666, netPayable: 731666, actualGross: null, deductions: null, ctcPerMonth: 731666 },
    { group: 'CON', businessUnit: 'Azista Magenet Park', manpower: 5, teda: 0, incentive: 0, netSalary: 495000, netPayable: 495000, actualGross: null, deductions: null, ctcPerMonth: 495000 },
    { group: 'CON', businessUnit: 'Aerospace (BD)', manpower: 3, teda: 0, incentive: 0, netSalary: 305000, netPayable: 305000, actualGross: null, deductions: null, ctcPerMonth: 305000 },
    { group: 'CON', businessUnit: 'Intl. Mktg', manpower: 1, teda: 0, incentive: 0, netSalary: 216333, netPayable: 216333, actualGross: null, deductions: null, ctcPerMonth: 216333 },
    { group: 'CON', businessUnit: 'Azista Food', manpower: 1, teda: 0, incentive: 0, netSalary: 135000, netPayable: 135000, actualGross: null, deductions: null, ctcPerMonth: 135000 },
    { group: 'CON', businessUnit: 'Azista (Lakdaram)', manpower: 1, teda: 0, incentive: 0, netSalary: 130000, netPayable: 130000, actualGross: null, deductions: null, ctcPerMonth: 130000 },
    { group: 'CON', businessUnit: 'Consultant (ABA)', manpower: 0, teda: 0, incentive: 0, netSalary: 0, netPayable: 0, actualGross: null, deductions: null, ctcPerMonth: 0 },
  ];

  groupFilter: GroupFilter = 'CON';
  searchTerm = '';
  sortKey: SortKey | null = null;
  sortAsc = true;

  get filteredRows(): BusinessUnitRow[] {
    let rows = [...this.allRows];

    if (this.groupFilter !== 'ALL') {
      rows = rows.filter(r => r.group === this.groupFilter);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      rows = rows.filter(r => r.businessUnit.toLowerCase().includes(term));
    }

    if (this.sortKey) {
      const key = this.sortKey;
      rows.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        if (valA === null) return 1;
        if (valB === null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return this.sortAsc ? valA - valB : valB - valA;
        }
        return this.sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return rows;
  }

  setGroupFilter(filter: GroupFilter): void {
    this.groupFilter = filter;
  }

  sortBy(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }
  }

  formatNumber(value: number | null): string {
    if (value === null) return '—';
    return value.toLocaleString('en-IN');
  }

  downloadCsv(): void {
    const headers = ['Group', 'Business Unit', 'Manpower', 'TEDA', 'Incentive', 'Net Salary', 'Net Payable', 'Actual Gross', 'Deductions', 'CTC / Month'];
    const rows = this.filteredRows.map(r => [
      r.group,
      r.businessUnit,
      r.manpower,
      r.teda,
      r.incentive,
      r.netSalary,
      r.netPayable,
      r.actualGross ?? '',
      r.deductions ?? '',
      r.ctcPerMonth,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payable-summary-${this.payPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}