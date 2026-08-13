import { Component, DestroyRef, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterStateService } from '../../../base-layout/core/filter-state.service';
import { joinAndExitService } from '../join.services';

/** Shape of a single row exactly as the API returns it. */
interface ApiJoinExitRow {
  callName: string;
  businessUnitId: number;
  businessUnitName: string;
  departmentName: string;
  leftEmployees: number;
  newJoiners: number;
  totalEmployees: number;
}

/** Shape of the full paginated response envelope. */
interface JoinExitListResponse {
  content: ApiJoinExitRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Shape used by the template. */
interface JoinExitRow {
  callName: string;
  businessUnitId: number;
  businessUnit: string;
  department: string;
  newJoiners: number;
  leftEmployees: number;
  totalEmployees: number;
  netChange: number;
}

/** Location/pay-period filters coming from the shared filter bar. */
interface ActiveFilters {
  payPeriod: string;
  location: string;
}

type SortKey = keyof JoinExitRow;

@Component({
  selector: 'app-join-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './join-list.html',
  styleUrl: './join-list.scss',
})
export class JoinList {
  private filterState = inject(FilterStateService);
  private joinAndExitService = inject(joinAndExitService);
  private destroyRef = inject(DestroyRef);

  // ---- Reactive state ----
  currentFilters = signal<ActiveFilters>({ payPeriod: '', location: 'HYD' });

  search = signal('');
  private searchInput$ = new Subject<string>();

  allRows = signal<JoinExitRow[]>([]);
  totalRecords = signal(0);

  page = signal(1); // 1-based
  size = signal(10);
  totalPages = signal(0);

  loading = signal(false);
  loadError = signal(false);

  sortKey = signal<SortKey | null>(null);
  sortAsc = signal(true);

  constructor() {
    // React to pay period / location changes from the shared filter bar.
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

    this.joinAndExitService.joinAndExitList(formData).subscribe({
      next: (res: JoinExitListResponse) => {
        this.allRows.set((res?.content ?? []).map(row => this.mapApiRow(row)));
        this.totalRecords.set(res?.totalElements ?? this.allRows().length);
        this.totalPages.set(res?.totalPages ?? (this.allRows().length ? 1 : 0));
        if (res?.page !== undefined) this.page.set(res.page);
        if (res?.size !== undefined) this.size.set(res.size);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Join and Exit List Error:', err);
        this.allRows.set([]);
        this.totalRecords.set(0);
        this.totalPages.set(0);
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  private mapApiRow(row: ApiJoinExitRow): JoinExitRow {
    return {
      callName: row.callName,
      businessUnitId: row.businessUnitId,
      businessUnit: row.businessUnitName,
      department: row.departmentName,
      newJoiners: row.newJoiners,
      leftEmployees: row.leftEmployees,
      totalEmployees: row.totalEmployees,
      netChange: row.newJoiners - row.leftEmployees,
    };
  }

  /** Client-side sort of the current page's rows. */
  sortedRows = computed<JoinExitRow[]>(() => {
    const rows = [...this.allRows()];
    const key = this.sortKey();

    if (key) {
      const asc = this.sortAsc();
      rows.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
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

  hasData = computed(() => !this.loading() && !this.loadError() && this.allRows().length > 0);

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortAsc.update(v => !v);
    } else {
      this.sortKey.set(key);
      this.sortAsc.set(true);
    }
  }

  // ---- Pagination ----
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

  formatNumber(value: number): string {
    return value.toLocaleString('en-IN');
  }

  downloadExcel() {
    const formData = new FormData();
    formData.append('payPeriod', this.currentFilters().payPeriod);
    formData.append('type', this.currentFilters().location);
    this.joinAndExitService.exportExcel(formData).subscribe({
      next: (res: any) => {
        console.log(res)
      }
    })

  }
}