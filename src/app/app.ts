import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toaster } from './shared/components/toaster/toaster';
import { Loader } from './core/components/loader/loader';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Toaster,
    Loader
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('MIS-dynamic-reports');
}
