import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-error',
  imports: [],
  templateUrl: './server-error.html',
  styleUrl: './server-error.scss',
})
export class ServerError implements OnInit {

  private router: Router = inject(Router);

  ngOnInit() {
    const isReload = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (isReload?.type === 'reload' && !sessionStorage.getItem('retryDone')) {
      sessionStorage.setItem('retryDone', 'true');
      this.retry();
    } else {
      sessionStorage.removeItem('retryDone');
    }

  }
  retry() {
    window.history.back();
    sessionStorage.setItem('retryDone', 'true');
  }
  goHome() {
    this.router.navigate(['/']);
    sessionStorage.setItem('retryDone', 'true');
  }
}

