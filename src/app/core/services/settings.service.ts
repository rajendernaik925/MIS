// import { computed, Injectable, Signal, signal, WritableSignal } from "@angular/core";
// import { IAdmin } from "../modals/admin";

// @Injectable({
//   providedIn: 'root',
// })

// export class SettingsService {

//   adminInfo: WritableSignal<IAdmin> = signal({
//     id: "",
//     full_name: "",
//     image: null,
//     email: "",
//     status: "",
//     mobile: "",
//   });
//   adminSettings: Signal<IAdmin> = computed(() => this.adminInfo());
// }


import { Injectable, WritableSignal, Signal, signal, computed } from '@angular/core';
import { IEmployeeAccess } from '../modals/tokent';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // Store employee details
  private employeeInfoSignal: WritableSignal<IEmployeeAccess['employeeData'] | null> =
    signal(null);

  // Store module permissions
  private moduleAccessSignal: WritableSignal<IEmployeeAccess['moduleAccess']> =
    signal([]);

  // Public readonly signals (computed)
  employeeInfo: Signal<IEmployeeAccess['employeeData'] | null> =
    computed(() => this.employeeInfoSignal());

  moduleAccess: Signal<IEmployeeAccess['moduleAccess']> =
    computed(() => this.moduleAccessSignal());

  // Save values
  setEmployeeAccess(data: IEmployeeAccess) {
    if (data?.employeeData) {
      this.employeeInfoSignal.set(data.employeeData);
    }
    if (data?.moduleAccess) {
      this.moduleAccessSignal.set(data.moduleAccess);
    }
  }
}

