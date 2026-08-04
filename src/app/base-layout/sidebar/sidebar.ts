import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() logout = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Overview', icon: 'fa-solid fa-grip', route: '/dashboard' },
    { label: 'Payable Summary', icon: 'fa-solid fa-file-invoice-dollar', route: '/payable' },
    { label: 'Location Bifurcation', icon: 'fa-solid fa-scale-balanced', route: '/bifurcation' },
    { label: 'Join & Exit', icon: 'fa-solid fa-user-clock', route: '/joins-exits', badge: 'Sample' },
    { label: 'Interns & Contractors', icon: 'fa-solid fa-graduation-cap', route: '/interns' },
    { label: 'Methodology', icon: 'fa-solid fa-lightbulb', route: '/methodology' },
  ];

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  onLogout(): void {
    // TODO: if you want a confirm step, trigger your SweetAlert2 dialog
    // here (see styles-global-leftover.scss for the swal2-* theme classes)
    // before emitting — e.g. Swal.fire({...}).then(result => { if
    // (result.isConfirmed) this.logout.emit(); }).
    this.logout.emit();
  }
}
