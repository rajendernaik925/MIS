import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, delay, distinctUntilChanged, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { payableService } from '../payable-summary.services';
import { FilterStateService } from '../../../base-layout/core/filter-state.service';

/** Shape of a single row exactly as the API returns it. */
interface ApiBusinessUnitRow {
  fyYear: string;
  payPeriod: number;
  businessUnitId: number;
  businessUnitName: string;
  group: 'HYD' | 'MUM' | 'CON';
  manpower: number;
  teda: number;
  incentive: number;
  netSalary: number;
  totalNetPayable: number;
  totalActualGross: number | null;
  totalDeductions: number | null;
  ctcPerMonth: number;
}

/** Shape of the full paginated response envelope. */
interface PayableListResponse {
  content: ApiBusinessUnitRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Shape used by the template — flattened / renamed for the table. */
interface BusinessUnitRow {
  businessUnitId: number;
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

/** Location/pay-period filters coming from the shared filter bar. */
interface ActiveFilters {
  payPeriod: string;
  location: string;
}

type SortKey = keyof BusinessUnitRow;

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
export class List implements OnInit {
  private payableService: payableService = inject(payableService);
  private filterState = inject(FilterStateService);
  private destroyRef = inject(DestroyRef);

  // Active filters driving the API call — kept in sync with FilterStateService.
  currentFilters: ActiveFilters = { payPeriod: '', location: 'HYD' };

  // Free-text search — bound to the input, pushed through a debounced stream.
  searchText = '';
  private searchInput$ = new Subject<string>();

  allRows: BusinessUnitRow[] = [];
  totalBusinessUnits = 0;

  page = 0; // zero-based, mirrors the API
  size = 10;
  totalPages = 0;

  loading = false;
  loadError = false;

  sortKey: SortKey | null = null;
  sortAsc = true;

  ngOnInit(): void {
    // Re-fetch whenever pay period or location changes.
    this.filterState.filters
      .pipe(
        distinctUntilChanged(
          (prev, curr) => prev.payPeriod === curr.payPeriod && prev.location === curr.location,
        ),
        // IMPORTANT: FilterStateService notifies synchronously — on init because
        // it's a BehaviorSubject (fires immediately on subscribe, still inside
        // Angular's first change-detection pass for this component), and later
        // because a dropdown's click handler calls `.next(...)` directly, which
        // reaches our subscriber synchronously within that same click's call
        // stack, before Angular ticks for that event.
        //
        // Mutating template-bound state (currentFilters, totalRecords, etc.) in
        // either case, in the same tick Angular already rendered, causes
        // NG0100 ExpressionChangedAfterItHasBeenCheckedError.
        //
        // `delay(0)` reschedules the emission onto a macrotask (setTimeout),
        // guaranteeing it lands in a genuinely separate tick from whatever
        // triggered it — unlike a microtask (Promise.resolve().then()), this
        // can't get pulled back into the same change-detection cycle even if
        // the underlying service replays synchronously (e.g. shareReplay).
        delay(0),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(filters => {
        this.currentFilters = filters;
        this.page = 0;
        this.payableList();
      });

    // Re-fetch on search text, debounced so we don't hit the API per keystroke.
    // This is always user-triggered well after the initial render, so it's safe
    // to update state directly (no microtask needed here).
    this.searchInput$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(term => {
        this.searchText = term;
        this.page = 0;
        this.payableList();
      });
  }

  onSearchInput(value: string): void {
    this.searchInput$.next(value.trim());
  }

  payableList(): void {
    this.loading = true;
    this.loadError = false;

    const formData = new FormData();
    formData.append('payPeriod', this.currentFilters.payPeriod);
    formData.append('type', this.currentFilters.location);
    formData.append('page', String(this.page));
    formData.append('size', String(this.size));
    formData.append('searchText', this.searchText);

    this.payableService.payableList(formData).subscribe({
      next: (res: PayableListResponse) => {
        this.allRows = (res.content ?? []).map(row => this.mapApiRow(row));
        this.totalBusinessUnits = res.totalElements ?? this.allRows.length;
        this.totalPages = res.totalPages ?? (this.allRows.length ? 1 : 0);
        this.page = res.page ?? this.page;
        this.size = res.size ?? this.size;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Payable List Error:', err);
        this.allRows = [];
        this.totalBusinessUnits = 0;
        this.totalPages = 0;
        this.loading = false;
        this.loadError = true;
      },
    });
  }

  private mapApiRow(row: ApiBusinessUnitRow): BusinessUnitRow {
    return {
      businessUnitId: row.businessUnitId,
      group: row.group,
      businessUnit: row.businessUnitName,
      manpower: row.manpower,
      teda: row.teda,
      incentive: row.incentive,
      netSalary: row.netSalary,
      netPayable: row.totalNetPayable,
      actualGross: row.totalActualGross,
      deductions: row.totalDeductions,
      ctcPerMonth: row.ctcPerMonth,
    };
  }

  /** Client-side sort of the current page's rows. */
  get sortedRows(): BusinessUnitRow[] {
    let rows = [...this.allRows];

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

  /** Drives the enable/disable state of the download button. */
  get hasData(): boolean {
    return !this.loading && !this.loadError && this.allRows.length > 0;
  }

  sortBy(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }
  }

  // ---- Pagination (drives the template's `pagination` block) ----

  get totalRecords(): number {
    return this.totalBusinessUnits;
  }

  get currentPage(): number {
    return this.page + 1; // 1-based for display
  }

  get startIndex(): number {
    return this.totalRecords === 0 ? 0 : this.page * this.size + 1;
  }

  get endIndex(): number {
    return Math.min((this.page + 1) * this.size, this.totalRecords);
  }

  get pageNumbers(): number[] {
    const maxButtons = 5;
    const total = this.totalPages;
    if (total <= 0) return [];

    let start = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(total, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.currentPage) {
      return;
    }
    this.page = p - 1;
    this.payableList();
  }

  formatNumber(value: number | null): string {
    if (value === null) return '—';
    return value.toLocaleString('en-IN');
  }

  downloadCsv(): void {
    if (!this.hasData) {
      return;
    }

    const headers = ['Group', 'Business Unit', 'Manpower', 'TEDA', 'Incentive', 'Net Salary', 'Net Payable', 'Actual Gross', 'Deductions', 'CTC / Month'];
    const rows = this.sortedRows.map(r => [
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
    link.setAttribute('download', `payable-summary-${this.currentFilters.payPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}