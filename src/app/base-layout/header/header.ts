import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterStateService } from '../core/filter-state.service';
import { IEmployeeAccess, IEmployeeData } from '../../core/modals/tokent';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  protected readonly filterState = inject(FilterStateService);
  private readonly elRef = inject(ElementRef<HTMLElement>);

  @Input() pageTitle = 'Smart MIS';
  @Output() menuToggle = new EventEmitter<void>();

  readonly payPeriodOpen = signal(false);
  readonly locationOpen = signal(false);

  readonly employeeData = signal<IEmployeeData | null>(null);

  ngOnInit(): void {
    this.loadEmployeeData();
  }

  private loadEmployeeData(): void {
    const raw = localStorage.getItem('employeeAccess');
    if (!raw) return;

    try {
      const parsed: IEmployeeAccess = JSON.parse(raw);
      if (parsed?.employeeData) {
        this.employeeData.set(parsed.employeeData);
      }
    } catch (err) {
      console.error('[Header] Failed to parse employeeAccess from localStorage:', err);
    }
  }

  togglePayPeriod(): void {
    this.locationOpen.set(false);
    this.payPeriodOpen.update((v) => !v);
  }

  toggleLocation(): void {
    this.payPeriodOpen.set(false);
    this.locationOpen.update((v) => !v);
  }

  selectPayPeriod(value: string): void {
    this.filterState.setPayPeriod(value);
    this.payPeriodOpen.set(false);
  }

  selectLocation(value: string): void {
    this.filterState.setLocation(value);
    this.locationOpen.set(false);
  }

  // Close both panels on any click outside this component.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target as Node)) {
      this.payPeriodOpen.set(false);
      this.locationOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.payPeriodOpen.set(false);
    this.locationOpen.set(false);
  }

  trackByValue(_: number, item: { value: string }): string {
    return item.value;
  }

  payPeriodSelectedLabel(): string {
    const val = this.filterState.selectedPayPeriod();
    return this.filterState.payPeriods().find((p) => p.value === val)?.label ?? '';
  }

  locationSelectedLabel(): string {
    const val = this.filterState.selectedLocation();
    return this.filterState.locations().find((l) => l.value === val)?.label ?? '';
  }

  toTitleCase(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}