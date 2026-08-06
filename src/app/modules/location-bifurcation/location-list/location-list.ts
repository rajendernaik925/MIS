import { Component } from '@angular/core';
import { InProgress } from "../../supprt-components/in-progress/in-progress";

@Component({
  selector: 'app-location-list',
  imports: [InProgress],
  templateUrl: './location-list.html',
  styleUrl: './location-list.scss',
})
export class LocationList {

}
