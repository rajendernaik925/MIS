import { Component } from '@angular/core';
import { Header } from './header/header';
import { RouterModule } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';

@Component({
  selector: 'app-base-layout',
  imports: [Header, RouterModule, Sidebar],
  templateUrl: './base-layout.html',
  styleUrl: './base-layout.scss',
})
export class BaseLayout {
  // TODO: drive this from route data (e.g. this.router.events + a
  // `data: { title: '...' }` on each route) if every page needs its own
  // title without hardcoding it here.
  pageTitle = 'Executive Overview';

  /** Desktop: icon-only collapsed rail. */
  sidebarCollapsed = false;

  /** Mobile: off-canvas drawer open/closed. */
  mobileSidebarOpen = false;

  onSidebarToggle(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  onMobileSidebarToggle(open: boolean): void {
    this.mobileSidebarOpen = open;
  }

  openMobileSidebar(): void {
    this.mobileSidebarOpen = true;
  }

  onLogout(): void {
    // TODO: clear auth/session state via your auth service, then redirect
    // e.g. this.authService.logout(); this.router.navigate(['/login']);
    console.log('Logout requested');
  }
}
