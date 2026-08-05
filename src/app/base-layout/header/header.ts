import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FilterStateService } from '../core/filter-state.service';

interface PayPeriodOption {
  value: string; // "202607"
  label: string; // "Jul 2026 (202607)"
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  private readonly filterState = inject(FilterStateService);
  private subscription?: Subscription;

  /** Set by BaseLayout (or a route resolver) per page. */
  @Input() pageTitle = 'Executive Overview';

  /** Emitted when the mobile hamburger button is tapped (opens the sidebar drawer). */
  @Output() menuToggle = new EventEmitter<void>();

  selectedLocation = this.filterState.current.location;
  selectedPayPeriod = this.filterState.current.payPeriod;

  readonly payPeriods: PayPeriodOption[] = this.buildPayPeriodOptions();

  ngOnInit(): void {
    // Keep the header in sync if some other part of the app (or a
    // routed component) updates the filters programmatically.
    this.subscription = this.filterState.filters.subscribe((filters) => {
      this.selectedLocation = filters.location;
      this.selectedPayPeriod = filters.payPeriod;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onPayPeriodChange(): void {
    this.filterState.setPayPeriod(this.selectedPayPeriod);
  }

  onLocationChange(): void {
    this.filterState.setLocation(this.selectedLocation);
  }

  /** Builds the last 6 pay periods (current month back), formatted as YYYYMM. */
  private buildPayPeriodOptions(): PayPeriodOption[] {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const now = new Date();
    const options: PayPeriodOption[] = [];

    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
      options.push({ value, label: `${months[d.getMonth()]} ${d.getFullYear()} (${value})` });
    }

    // Make sure the default selected period is always a valid option,
    // even if it doesn't fall in the last 6 months.
    if (!options.some((o) => o.value === this.filterState.current.payPeriod)) {
      options.unshift({
        value: this.filterState.current.payPeriod,
        label: `Pay Period ${this.filterState.current.payPeriod}`,
      });
    }

    return options;
  }
}
