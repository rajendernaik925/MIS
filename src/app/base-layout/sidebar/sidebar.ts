import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  /** Desktop collapse (icon-only rail). */
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  /** Mobile off-canvas drawer state. */
  @Input() mobileOpen = false;
  @Output() mobileOpenChange = new EventEmitter<boolean>();
  private storageService: StorageService = inject(StorageService);
  private router: Router = inject(Router);

  @Output() logout = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Overview', icon: 'fa-solid fa-grip', route: '/dashboard' },
    { label: 'Payable Summary', icon: 'fa-solid fa-file-invoice-dollar', route: '/payable-summary' },
    { label: 'Location Bifurcation', icon: 'fa-solid fa-scale-balanced', route: '/location-bifurcation' },
    { label: 'Join & Exit', icon: 'fa-solid fa-user-clock', route: '/joins-exits', badge: 'Sample' },
    { label: 'Interns & Contractors', icon: 'fa-solid fa-graduation-cap', route: '/interns' },
    { label: 'Methodology', icon: 'fa-solid fa-lightbulb', route: '/methodology' },
  ];

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  closeMobile(): void {
    if (!this.mobileOpen) return;
    this.mobileOpen = false;
    this.mobileOpenChange.emit(false);
  }

  /** Close the mobile drawer automatically once a nav link is used. */
  onNavClick(): void {
    this.closeMobile();
  }

  onLogout(): void {
    // TODO: if you want a confirm step, trigger your SweetAlert2 dialog
    // here (see styles-global-leftover.scss for the swal2-* theme classes)
    // before emitting — e.g. Swal.fire({...}).then(result => { if
    // (result.isConfirmed) this.logout.emit(); }).
    // this.logout.emit();

    this.storageService.removeTokens();
    this.router.navigate(['/auth/login']);

  }
}
