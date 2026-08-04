import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { CommonModule } from '@angular/common';
import { COMMON_EXPORTS } from '../../common-exports.constants';

@Component({
  selector: 'app-loader',
  imports: [
    CommonModule,
    COMMON_EXPORTS
  ],
  templateUrl: './loader.html',
  styleUrls: ['./loader.scss'],
})
export class Loader implements OnInit {

 isLoading = false;
  loadingImage: string = '/images/gear-spinner.gif';
  logo: string = 'images/mis-logo.png';
  // logo: string = 'images/Fav.png';
  private spinnerService: SpinnerService = inject(SpinnerService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.spinnerService.loading.subscribe((loader: boolean) => {
      loader ? this.show() : this.hide();
      this.cdr.detectChanges();
    });
  }

  show() {
    this.isLoading = true;
  }

  hide() {
    this.isLoading = false;
  }
}

