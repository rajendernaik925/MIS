import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterStateService } from '../../../base-layout/core/filter-state.service';
import { joinAndExitService } from '../join.services';
import { HttpErrorResponse } from '@angular/common/http';
import { form } from '@angular/forms/signals';

interface DeptBar {
  label: string;
  joins: number;
  exits: number;
}

interface DesignationBar {
  label: string;
  joins: number;
  exits: number;
}

interface RequiredField {
  name: string;
  description: string;
}

@Component({
  selector: 'app-join-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './join-list.html',
  styleUrl: './join-list.scss',
})
export class JoinList {

  private filterState = inject(FilterStateService);
  private joinAndExitService = inject(joinAndExitService);
  // Top stat cards
  joinsThisMonth = 47;
  exitsThisMonth = 36;


  constructor() {
    effect(() => {
      const filters = this.filterState.filtersSignal();
      // Wait for the filter bar to resolve a real pay period before firing.
      if (!filters.payPeriod) {
        return;
      }
      console.log("Filters: ", filters);
      this.loadListData(filters);       
    });
  }

  loadListData(filters: { payPeriod: string; location: string }) {
    const formData = new FormData();
    formData.append('payPeriod', filters.payPeriod);
    formData.append('type', filters.location);
    this.joinAndExitService.joinAndExitList(formData).subscribe({
      next: (res: any) => {
        console.log("Join and Exit List: ", res);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching join and exit data:', err);
      },
    })
  }
  get netHeadcountChange(): number {
    return this.joinsThisMonth - this.exitsThisMonth;
  }
  attritionRate = 0.65;

  // Joins vs Exits by Department
  departmentBars: DeptBar[] = [
    { label: 'Production', joins: 14, exits: 9 },
    { label: 'Quality', joins: 6, exits: 3 },
    { label: 'R&D', joins: 4, exits: 2 },
    { label: 'Sales & Marketing', joins: 9, exits: 11 },
    { label: 'HR & Admin', joins: 3, exits: 2 },
    { label: 'Finance', joins: 2, exits: 1 },
    { label: 'IT', joins: 5, exits: 3 },
    { label: 'Supply Chain', joins: 4, exits: 5 },
  ];

  // Joins vs Exits by Designation
  designationBars: DesignationBar[] = [
    { label: 'Trainee/Associate', joins: 22, exits: 14 },
    { label: 'Executive', joins: 15, exits: 13 },
    { label: 'Senior Executive', joins: 6, exits: 5 },
    { label: 'Manager', joins: 5, exits: 5 },
    { label: 'Senior Manager', joins: 0, exits: 2 },
    { label: 'AGM & above', joins: 0, exits: 1 },
  ];

  requiredFields: RequiredField[] = [
    { name: 'Employee ID', description: 'Joins with the payable sheet' },
    { name: 'Business Unit', description: 'Must match Payable Summary naming exactly' },
    { name: 'Department', description: 'Production, Quality, R&D, HR, Finance, IT, Sales, Supply Chain...' },
    { name: 'Designation / Grade', description: 'Trainee, Executive, Manager, Sr. Manager...' },
    { name: 'Employment Type', description: 'Permanent / Contractor / Intern' },
    { name: 'Date of Joining / Date of Leaving', description: 'DD-MM-YYYY, blank DOL if still active' },
    { name: 'Exit Reason', description: 'Resignation, Termination, Retirement, Contract End...' },
  ];

  // ---- Vertical chart (department) helpers ----
  get departmentYAxisTicks(): number[] {
    const max = Math.max(...this.departmentBars.flatMap(d => [d.joins, d.exits]), 1);
    return this.buildNiceTicks(max, 8);
  }

  getVerticalBarHeightPct(value: number, ticks: number[]): number {
    const max = ticks[0] || 1;
    return (value / max) * 100;
  }

  // ---- Horizontal chart (designation) helpers ----
  get designationXAxisTicks(): number[] {
    const max = Math.max(...this.designationBars.flatMap(d => [d.joins, d.exits]), 1);
    return this.buildNiceTicks(max, 6).reverse(); // ascending left-to-right
  }

  getHorizontalBarWidthPct(value: number, ticks: number[]): number {
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
}