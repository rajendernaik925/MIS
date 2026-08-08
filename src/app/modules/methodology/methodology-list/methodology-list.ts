import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RolloutStep {
  label: string;
  description: string;
}

@Component({
  selector: 'app-methodology-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './methodology-list.html',
  styleUrl: './methodology-list.scss',
})
export class MethodologyList {
  sourceFileName = 'Consolidated_MIS_Payable_Report.xlsx';

  rolloutSteps: RolloutStep[] = [
    { label: 'Done:', description: 'consolidated Payable MIS dashboard (this build).' },
    { label: 'Next:', description: 'start exporting the employee-level file monthly so Join/Exit and Interns go live on real numbers.' },
    { label: 'Then:', description: 'once 2–3 months exist, add month-over-month trend lines instead of single-period snapshots.' },
    { label: 'Later:', description: "a small script that regenerates this page straight from each month's Excel export — refresh becomes a one-command job." },
  ];
}