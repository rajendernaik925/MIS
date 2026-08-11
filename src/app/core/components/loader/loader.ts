import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { CommonModule } from '@angular/common';
import { COMMON_EXPORTS } from '../../common-exports.constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loader',
  imports: [
    CommonModule,
    COMMON_EXPORTS
  ],
  templateUrl: './loader.html',
  styleUrls: ['./loader.scss'],
})
export class Loader implements OnInit, OnDestroy {

  isLoading = false;
  loadingImage: string = '/images/gear-spinner.gif';
  logo: string = 'images/mis-logo.png';
  private spinnerService: SpinnerService = inject(SpinnerService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private sub: Subscription | null = null;

  ngOnInit(): void {
    this.sub = this.spinnerService.loading.subscribe((loader: boolean) => {
      loader ? this.show() : this.hide();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  show() {
    this.isLoading = true;
  }

  hide() {
    this.isLoading = false;
  }
}
