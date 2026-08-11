import { inject, Injectable, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, Observable } from 'rxjs';
import { masterService } from '../../master.service';

export interface HeaderFilters {
  /** e.g. "202607" */
  payPeriod: string;
  /** e.g. 'ALL' | 'HYD' | 'MUM' | 'CONSULT' */
  location: string;
}

export interface PayPeriodOption {
  value: string; // "202607"
  label: string; // "Jul 2026 (202607)"
}

export interface ILocationOption {
  value: string; // location_shortname, e.g. "HYD"
  label: string; // location_name, e.g. "HYDERABAD"
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** "202607" -> "Jul 2026 (202607)" */
function formatPayPeriodLabel(value: string): string {
  if (value.length !== 6) return value;
  const year = Number(value.slice(0, 4));
  const monthIndex = Number(value.slice(4, 6)) - 1;
  const monthName = MONTHS[monthIndex];
  if (!monthName || Number.isNaN(year)) return value;
  return `${monthName} ${year} (${value})`;
}

/**
 * Some backends return a bare array, others wrap it as
 * { data: [...] } / { result: [...] } / { items: [...] }.
 * This normalizes either shape to a plain array so the rest of the
 * code doesn't silently early-return on a shape it didn't expect.
 */
function toArray<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.result)) return res.result;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

/** Reads a value off an object trying several possible key spellings. */
function pick(obj: any, ...keys: string[]): any {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return undefined;
}

@Injectable({ providedIn: 'root' })
export class FilterStateService {
  private masterService = inject(masterService);

  // ---- dropdown option lists ----
  readonly payPeriods = signal<PayPeriodOption[]>([]);
  readonly locations = signal<ILocationOption[]>([]);

  readonly loadingPayPeriods = signal(true);
  readonly loadingLocations = signal(true);

  // ---- current selection ----
  readonly selectedPayPeriod = signal<string>('');
  readonly selectedLocation = signal<string>('');

  readonly filtersSignal = computed<HeaderFilters>(() => ({
    payPeriod: this.selectedPayPeriod(),
    location: this.selectedLocation(),
  }));

  readonly filters: Observable<HeaderFilters> = toObservable(this.filtersSignal);

  get current(): HeaderFilters {
    return this.filtersSignal();
  }

  constructor() {
    this.loadPayPeriods();
    this.loadLocations();
  }

  setPayPeriod(payPeriod: string): void {
    this.selectedPayPeriod.set(payPeriod);
  }

  setLocation(location: string): void {
    this.selectedLocation.set(location);
  }

  setFilters(partial: Partial<HeaderFilters>): void {
    if (partial.payPeriod !== undefined) this.selectedPayPeriod.set(partial.payPeriod);
    if (partial.location !== undefined) this.selectedLocation.set(partial.location);
  }

  private loadPayPeriods(): void {
    this.masterService
      .payPeriod()
      .pipe(
        catchError((err) => {
          console.error('[FilterStateService] payPeriod HTTP error:', err);
          return of([] as any[]);
        }),
      )
      .subscribe((raw) => {
        this.loadingPayPeriods.set(false);
        console.debug('[FilterStateService] payPeriod raw response:', raw);

        const list = toArray<any>(raw);
        if (!list.length) {
          console.warn('[FilterStateService] payPeriod: no items after parsing. Raw:', raw);
          return;
        }

        const options: PayPeriodOption[] = list
          .map((p) => {
            const value = pick(p, 'payPeriod', 'pay_period', 'PayPeriod', 'payperiod');
            if (value === undefined) {
              console.warn('[FilterStateService] payPeriod item missing expected field:', p);
              return null;
            }
            const strValue = String(value);
            return { value: strValue, label: formatPayPeriodLabel(strValue) };
          })
          .filter((o): o is PayPeriodOption => o !== null);

        if (!options.length) return;

        this.payPeriods.set(options);

        // Default: first index from API, unless a valid selection already exists.
        if (!options.some((o) => o.value === this.selectedPayPeriod())) {
          this.selectedPayPeriod.set(options[0].value);
        }
      });
  }

  private loadLocations(): void {
    this.masterService
      .locations()
      .pipe(
        catchError((err) => {
          console.error('[FilterStateService] locations HTTP error:', err);
          return of([] as any[]);
        }),
      )
      .subscribe((raw) => {
        this.loadingLocations.set(false);
        console.debug('[FilterStateService] locations raw response:', raw);

        const list = toArray<any>(raw);
        if (!list.length) {
          console.warn('[FilterStateService] locations: no items after parsing. Raw:', raw);
          return;
        }

        const options: ILocationOption[] = list
          .map((l) => {
            const value = pick(l, 'location_shortname', 'locationShortname', 'shortname');
            const label = pick(l, 'location_name', 'locationName', 'name');
            if (value === undefined || label === undefined) {
              console.warn('[FilterStateService] location item missing expected field:', l);
              return null;
            }
            return { value: String(value), label: String(label) };
          })
          .filter((o): o is ILocationOption => o !== null);

        if (!options.length) return;

        this.locations.set(options);

        if (!options.some((o) => o.value === this.selectedLocation())) {
          this.selectedLocation.set(options[0].value);
        }
      });
  }
}