import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable } from 'rxjs';

export const apiResolver: ResolveFn<boolean> = (route, state): Observable<any> => {
  const http = inject(HttpClient);
  return http.get<any>(`${route.data["apiUrl"]}`);
};
