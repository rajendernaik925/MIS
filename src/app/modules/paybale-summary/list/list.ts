import { Component, DestroyRef, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { payableService } from '../payable-summary.services';
import { FilterStateService } from '../../../base-layout/core/filter-state.service';
import { Router } from '@angular/router';

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
export class List {
  private payableService: payableService = inject(payableService);
  private filterState = inject(FilterStateService);
  private destroyRef = inject(DestroyRef);
  private route: Router = inject(Router);

  // ---- Reactive state ----
  // Everything the template reads is a signal. Signals participate in
  // Angular's fine-grained reactivity graph directly, so writing to them
  // (even from an async HTTP callback, or synchronously inside another
  // signal's reaction) always lands correctly on the next render — there's
  // no dirty-checking race to win, and therefore no NG0100
  // ExpressionChangedAfterItHasBeenCheckedError to work around with
  // setTimeout/delay(0) hacks. This is also why the table used to stay
  // blank until the user clicked something: the old delay(0) pipeline
  // could update the plain component fields in a tick where nothing told
  // Angular to re-check the view, so the (correctly loaded) data just sat
  // there unrendered until some unrelated event (a click) forced a CD run.

  // Active filters driving the API call — kept in sync with FilterStateService.
  currentFilters = signal<ActiveFilters>({ payPeriod: '', location: 'HYD' });

  // Free-text search — bound to the input, pushed through a debounced stream.
  search = signal('');
  private searchInput$ = new Subject<string>();

  allRows = signal<BusinessUnitRow[]>([]);
  totalBusinessUnits = signal(0);

  page = signal(1); // 1-based — matches what's shown in the UI and sent to the API
  size = signal(10);
  totalPages = signal(0);

  loading = signal(false);
  loadError = signal(false);

  sortKey = signal<SortKey | null>(null);
  sortAsc = signal(true);

  constructor() {
    // React to pay period / location changes from the shared filter bar.
    // `effect()` always runs with the *latest* values of every signal it
    // read last time — including the very first (default) values — and
    // re-runs whenever any of them change, batched into a single
    // microtask flush. We skip the run until a real pay period is
    // present so we don't fire a request with an empty filter before the
    // filter bar's own data has loaded.
    effect(() => {
      const filters = this.filterState.filtersSignal();
      if (!filters.payPeriod) {
        return;
      }

      const prev = this.currentFilters();
      if (prev.payPeriod === filters.payPeriod && prev.location === filters.location) {
        return;
      }

      this.currentFilters.set(filters);
      this.page.set(1);
      this.fetchList();
    });

    // Re-fetch on search text, debounced so we don't hit the API per keystroke.
    this.searchInput$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(term => {
        this.search.set(term);
        this.page.set(1);
        this.fetchList();
      });
  }

  onSearchInput(value: string): void {
    this.searchInput$.next(value.trim());
  }

  fetchList(): void {
    // Guard against firing before the filter bar has resolved a pay period.
    if (!this.currentFilters().payPeriod) {
      return;
    }

    this.loading.set(true);
    this.loadError.set(false);

    const formData = new FormData();
    formData.append('payPeriod', this.currentFilters().payPeriod);
    formData.append('type', this.currentFilters().location);
    formData.append('page', String(this.page()));
    formData.append('size', String(this.size()));
    formData.append('search', this.search());

    this.payableService.payableList(formData).subscribe({
      next: (res: PayableListResponse) => {
        this.allRows.set((res?.content ?? []).map(row => this.mapApiRow(row)));
        this.totalBusinessUnits.set(res?.totalElements ?? this.allRows().length);
        this.totalPages.set(res?.totalPages ?? (this.allRows().length ? 1 : 0));
        // Backend's `page` in the response is 1-based too, so it maps
        // straight onto our 1-based `page` signal — no offset needed.
        if (res?.page !== undefined) this.page.set(res.page);
        if (res?.size !== undefined) this.size.set(res.size);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Payable List Error:', err);
        this.allRows.set([]);
        this.totalBusinessUnits.set(0);
        this.totalPages.set(0);
        this.loading.set(false);
        this.loadError.set(true);
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
  sortedRows = computed<BusinessUnitRow[]>(() => {
    const rows = [...this.allRows()];
    const key = this.sortKey();

    if (key) {
      const asc = this.sortAsc();
      rows.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        if (valA === null) return 1;
        if (valB === null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return asc ? valA - valB : valB - valA;
        }
        return asc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return rows;
  });

  /** Drives the enable/disable state of the download button. */
  hasData = computed(() => !this.loading() && !this.loadError() && this.allRows().length > 0);

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortAsc.update(v => !v);
    } else {
      this.sortKey.set(key);
      this.sortAsc.set(true);
    }
  }

  // ---- Pagination (drives the template's `pagination` block) ----

  totalRecords = computed(() => this.totalBusinessUnits());

  startIndex = computed(() => (this.totalRecords() === 0 ? 0 : (this.page() - 1) * this.size() + 1));

  endIndex = computed(() => Math.min(this.page() * this.size(), this.totalRecords()));

  pageNumbers = computed<number[]>(() => {
    const maxButtons = 5;
    const total = this.totalPages();
    if (total <= 0) return [];

    let start = Math.max(1, this.page() - Math.floor(maxButtons / 2));
    let end = Math.min(total, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  });

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages() || p === this.page()) {
      return;
    }
    this.page.set(p);
    this.fetchList();
  }

  formatNumber(value: number | null): string {
    if (value === null) return '—';
    return value.toLocaleString('en-IN');
  }

  downloadingExcel = signal(false);

  downloadCsv(): void {
    if (!this.hasData() || this.downloadingExcel()) {
      return;
    }

    const formData = new FormData();
    formData.append('payPeriod', this.currentFilters().payPeriod);
    formData.append('type', this.currentFilters().location);

    this.downloadingExcel.set(true);

    this.payableService.exportExcel(formData).subscribe({
      next: (res) => {
        const blob = res.body;
        if (!blob) {
          this.downloadingExcel.set(false);
          return;
        }

        // Prefer the filename the backend suggests via Content-Disposition,
        // e.g. `attachment; filename="Payable_Summary_202607.xlsx"`.
        const disposition = res.headers.get('content-disposition') ?? '';
        const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
        const filename = match?.[1] ?? `payable-summary-${this.currentFilters().payPeriod}.xlsx`;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.downloadingExcel.set(false);
      },
      error: (err) => {
        console.error('Export Excel Error:', err);
        this.downloadingExcel.set(false);
      },
    });
  }

  individualSummary() {
    if (!this.hasData()) {
      return;
    }

    this.route.navigate(['payable/summary']);
  }
}
