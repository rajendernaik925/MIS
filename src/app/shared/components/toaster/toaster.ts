import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CoreService } from '../../../core/services/core.services';
import { IToastInterface } from '../../../core/modals/toast';
import { Subscription } from 'rxjs';
import { COMMON_EXPORTS } from '../../../core/common-exports.constants';

@Component({
  selector: 'app-toaster',
  imports: [CommonModule, COMMON_EXPORTS],
  templateUrl: './toaster.html',
  styleUrls: ['./toaster.scss'],
})
export class Toaster implements OnInit, OnDestroy {

  toastMessage = signal('');
  toastType = signal(false);
  showClass = signal(false);
  toastWidth = signal('200px');

  private subs: Subscription | null = null;
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;
  private restartTimeout: ReturnType<typeof setTimeout> | null = null;
  private coreService: CoreService = inject(CoreService);

  private readonly MIN_CHARS = 10;
  private readonly MAX_CHARS = 100;
  private readonly MIN_WIDTH = 200;
  private readonly MAX_WIDTH = 600;

  ngOnInit(): void {
    this.subs = this.coreService.showToast.subscribe((value: IToastInterface) => {
      if (!value.message?.length) return;

      this.clearTimers();
      this.showClass.set(false); // reset so re-triggered toasts replay the animation

      this.restartTimeout = setTimeout(() => {
        this.toastMessage.set(value.message);
        this.toastType.set(value.type === 'success');
        this.toastWidth.set(this.calculateWidth(value.message));
        this.showClass.set(true);

        this.toastTimeout = setTimeout(() => {
          this.showClass.set(false);
          this.toastTimeout = null;
        }, 2000);
      }, 20);
    });
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
    this.clearTimers();
  }

  toasterClose(): void {
    this.showClass.set(false);
  }

  private clearTimers(): void {
    if (this.toastTimeout) { clearTimeout(this.toastTimeout); this.toastTimeout = null; }
    if (this.restartTimeout) { clearTimeout(this.restartTimeout); this.restartTimeout = null; }
  }

  private calculateWidth(message: string): string {
    const len = message.length;
    if (len <= this.MIN_CHARS) return `${this.MIN_WIDTH}px`;
    if (len >= this.MAX_CHARS) return `${this.MAX_WIDTH}px`;
    const ratio = (len - this.MIN_CHARS) / (this.MAX_CHARS - this.MIN_CHARS);
    const width = Math.round(this.MIN_WIDTH + ratio * (this.MAX_WIDTH - this.MIN_WIDTH));
    return `${width}px`;
  }
}