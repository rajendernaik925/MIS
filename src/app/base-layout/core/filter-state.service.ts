import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface HeaderFilters {
  /** e.g. "202607" */
  payPeriod: string;
  /** 'ALL' | 'HYD' | 'MUM' | 'CON' */
  location: string;
}

/**
 * Single source of truth for the header's Pay Period + Group filters.
 *
 * `Header` writes to this service whenever the user changes a dropdown.
 * Any routed component (Payable Summary, Location Bifurcation, etc.) can
 * inject this service and subscribe to `filters` to react to those
 * changes — no need to pass data through BaseLayout/router-outlet, since
 * routed components are siblings of the layout, not children of Header.
 *
 * Usage in a routed component:
 *
 *   private filterState = inject(FilterStateService);
 *
 *   ngOnInit() {
 *     this.filterState.filters.subscribe(({ payPeriod, location }) => {
 *       this.loadPayableSummary(payPeriod, location);
 *     });
 *   }
 */
@Injectable({ providedIn: 'root' })
export class FilterStateService {
  private readonly defaultFilters: HeaderFilters = {
    payPeriod: '202607',
    location: 'ALL',
  };

  private readonly filters$ = new BehaviorSubject<HeaderFilters>(
    this.defaultFilters,
  );

  /** Observable stream — subscribe to this from any routed component. */
  readonly filters = this.filters$.asObservable();

  /** Synchronous snapshot, handy for one-off reads (e.g. building a CSV export URL). */
  get current(): HeaderFilters {
    return this.filters$.value;
  }

  setPayPeriod(payPeriod: string): void {
    this.filters$.next({ ...this.filters$.value, payPeriod });
  }

  setLocation(location: string): void {
    this.filters$.next({ ...this.filters$.value, location });
  }

  setFilters(partial: Partial<HeaderFilters>): void {
    this.filters$.next({ ...this.filters$.value, ...partial });
  }
}
