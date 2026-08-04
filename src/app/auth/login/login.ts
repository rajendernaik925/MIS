import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CoreService } from '../../core/services/core.services';
import { IAuthResponse } from '../../core/modals/tokent';
import { SettingsService } from '../../core/services/settings.service';
import { StorageService } from '../../core/services/storage.service';
// ⬇️ type-only import — erased at compile time, safe on the server
import type { Offcanvas } from 'bootstrap';
import { LogoutService } from '../../core/services/logout.service';
import { ActivatedRoute } from '@angular/router';
import { SpinnerService } from '../../core/services/spinner.service';
import { SharedModule } from "../../shared/shared-modules";

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {

  logo: string = 'images/indent-logo.png';
  sideImage: string = 'images/side-image.png';
  errorMessage: string = '';
  showPassword = false;

  // ⬇️ typed with the type-only import, but never assigned the real bootstrap class on the server
  private forgotOffcanvas: Offcanvas | null = null;
  private forgotAutoCloseTimer: ReturnType<typeof setTimeout> | null = null;

  @ViewChild('forgotCanvas') forgotCanvasRef?: ElementRef<HTMLElement>;

  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);
  private coreService: CoreService = inject(CoreService);
  private settingsService: SettingsService = inject(SettingsService);
  private storageService: StorageService = inject(StorageService);
  private logoutService: LogoutService = inject(LogoutService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private spinnerService: SpinnerService = inject(SpinnerService);
  private platformId = inject(PLATFORM_ID);

  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(5)]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  })

  ngOnInit() {
  //   console.log("Login component initialized with query params: ");
  //   this.route.paramMap.subscribe(params => {

  //     const empId = params.get('empId');
  //     const pwd = params.get('pwd');

  //     if (empId && pwd) {

  //       this.loginForm.reset();

  //       this.spinnerService.show();

  //       this.loginForm.patchValue({
  //         username: empId,
  //         password: pwd
  //       });

  //       this.onSubmit();

  //     }

  //   });

  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.storageService.removeTokens();
      this.authService.Login(this.loginForm.value).subscribe({
        next: (res: any) => {
          const tokens: IAuthResponse = {
            jwtToken: res.jwtToken,
            employeeAccess: res.employeeAccess
          };
          this.coreService.setTokens(tokens.jwtToken);
          this.settingsService.setEmployeeAccess(tokens.employeeAccess);
          localStorage.setItem("employeeAccess", JSON.stringify(tokens.employeeAccess));
          this.router.navigate(['/dashboard']);
          this.spinnerService.hide();
        },

        error: (err: any) => {

          if (typeof err === 'string') {

            this.errorMessage = err;

          } else if (err?.error?.message) {

            this.errorMessage = err.error.message;

          } else if (err?.error?.error) {

            this.errorMessage = err.error.error;

          } else if (err?.message) {

            this.errorMessage = err.message;

          } else {

            this.errorMessage = 'Something went wrong. Please try again.';
          }
          setTimeout(() => {
            this.errorMessage = '';
          }, 2000);

          console.log('Error:', this.errorMessage);
        }
      })
    } else {
      Object.keys(this.loginForm.controls).forEach((key) => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
        control?.markAsDirty();
        control?.updateValueAndValidity();
      });
      this.coreService.displayToast({
        type: "error",
        message: "Please Enter Valid Credentials"
      })
    }
  }

  // ⬇️ now async, and only touches bootstrap's real JS in the browser
  async forgotpwd(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const offcanvasElement = this.forgotCanvasRef?.nativeElement;
    if (!offcanvasElement) {
      return;
    }

    if (this.forgotAutoCloseTimer) {
      clearTimeout(this.forgotAutoCloseTimer);
      this.forgotAutoCloseTimer = null;
    }

    if (!this.forgotOffcanvas) {
      // ⬇️ dynamic import — only executes in the browser, never on the server
      const { Offcanvas } = await import('bootstrap');
      this.forgotOffcanvas = new Offcanvas(offcanvasElement, {
        backdrop: false,
        keyboard: true,
        scroll: true
      });
    }

    this.forgotOffcanvas.show();

    this.forgotAutoCloseTimer = setTimeout(() => {
      this.forgotOffcanvas?.hide();
      this.forgotAutoCloseTimer = null;
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.forgotAutoCloseTimer) {
      clearTimeout(this.forgotAutoCloseTimer);
    }
    this.forgotOffcanvas?.dispose();
  }

}