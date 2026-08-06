import { Component } from '@angular/core';
import { InProgress } from "../../supprt-components/in-progress/in-progress";

@Component({
  selector: 'app-list',
  imports: [InProgress],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
export class List {

}
