import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-page-not-found',
  imports: [],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.scss',
})
export class PageNotFound implements OnInit {

  private location: Location = inject(Location);

  ngOnInit(): void {
    console.log("Locartion Data : ", Location)
  }

  back() {
    this.location.back();
  }

}
