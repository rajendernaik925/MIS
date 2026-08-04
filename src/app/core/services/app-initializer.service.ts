import { Injectable, inject } from "@angular/core";
import { SettingsService } from "./settings.service";
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: "root",
})
export class AppInitializerService {

  private storage = inject(StorageService);

  constructor(private settingsService: SettingsService) {}

  initializeApp(): Promise<any> {
    return new Promise((resolve) => {
      const user = this.storage.get<any>("employeeAccess");

      if (user) {
        this.settingsService.setEmployeeAccess(user);
      }

      resolve(true);
    });
  }
}