import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CoreService } from '../../../core/services/core.services';
import { IToastInterface } from '../../../core/modals/toast';
import { Subscription } from 'rxjs';
import { COMMON_EXPORTS } from '../../../core/common-exports.constants';

@Component({
  selector: 'app-toaster',
  imports: [
    CommonModule,
    COMMON_EXPORTS
  ],
  templateUrl: './toaster.html',
  styleUrls: ['./toaster.scss'],
})
export class Toaster {

  toastMessage: string = '';
  toastType: boolean = false;
  showClass: boolean = false;
  toastWidth: string = '200px';

  private subs: Subscription | null = null;
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;
  private coreService: CoreService = inject(CoreService);

  // Min/max character thresholds → pixel widths
  private readonly MIN_CHARS = 10;
  private readonly MAX_CHARS = 100;
  private readonly MIN_WIDTH = 200;   // px
  private readonly MAX_WIDTH = 600;   // px

  ngOnInit(): void {
    this.subs = this.coreService.showToast.subscribe((value: IToastInterface) => {
      if (value.message?.length) {
        this.toastMessage = value.message;
        this.toastType = value.type === 'success';
        this.toastWidth = this.calculateWidth(value.message);
        this.showClass = true;

        if (this.toastTimeout) {
          clearTimeout(this.toastTimeout);
        }
        this.toastTimeout = setTimeout(() => {
          this.showClass = false;
          this.toastTimeout = null;
        }, 2000);
      }
    });
  }

  ngOnDestroy(): void {
    this.subs?.unsubscribe();
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  toasterClose(): void {
    this.showClass = false;
  }

  private calculateWidth(message: string): string {
    const len = message.length;

    if (len <= this.MIN_CHARS) return `${this.MIN_WIDTH}px`;
    if (len >= this.MAX_CHARS) return `${this.MAX_WIDTH}px`;

    // Linear interpolation between min and max
    const ratio = (len - this.MIN_CHARS) / (this.MAX_CHARS - this.MIN_CHARS);
    const width = Math.round(this.MIN_WIDTH + ratio * (this.MAX_WIDTH - this.MIN_WIDTH));

    return `${width}px`;
  }
}
