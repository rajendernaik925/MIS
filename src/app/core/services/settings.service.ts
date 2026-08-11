import { Injectable, WritableSignal, Signal, signal, computed } from '@angular/core';
import { IEmployeeAccess } from '../modals/tokent';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private employeeInfoSignal: WritableSignal<IEmployeeAccess['employeeData'] | null> =
    signal(null);

  private moduleAccessSignal: WritableSignal<IEmployeeAccess['moduleAccess']> =
    signal([]);

  employeeInfo: Signal<IEmployeeAccess['employeeData'] | null> =
    computed(() => this.employeeInfoSignal());

  moduleAccess: Signal<IEmployeeAccess['moduleAccess']> =
    computed(() => this.moduleAccessSignal());

  setEmployeeAccess(data: IEmployeeAccess): void {
    if (data?.employeeData) {
      this.employeeInfoSignal.set(data.employeeData);
    }
    if (data?.moduleAccess) {
      this.moduleAccessSignal.set(data.moduleAccess);
    }
  }

  // Call on logout / token expiry to avoid stale permissions in memory
  clear(): void {
    this.employeeInfoSignal.set(null);
    this.moduleAccessSignal.set([]);
  }
}