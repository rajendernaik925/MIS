import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { authUrls } from "../../api.constants";
import { catchError, Observable, throwError } from "rxjs";
import { CoreService } from "../core/services/core.services";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private coreService: CoreService = inject(CoreService);
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('API Error:', error);

    if (error.status === 0 || error.status === 500) {
      this.router.navigate(['/server-error']);
      return throwError(() => 'Server error');
    }

    let errorMessage = '';
    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    this.coreService.displayToast({
      type: 'error',
      message: errorMessage || 'Something went wrong'
    });

    return throwError(() => errorMessage);
  };

  Login(data: any = {}): Observable<any> {
    return this.http.post<any>(`${authUrls.login}`, data).pipe(
      catchError(this.handleError),
    );
  }
}