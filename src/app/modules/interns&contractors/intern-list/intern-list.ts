import { Component } from '@angular/core';
import { InProgress } from "../../supprt-components/in-progress/in-progress";

@Component({
  selector: 'app-intern-list',
  imports: [InProgress],
  templateUrl: './intern-list.html',
  styleUrl: './intern-list.scss',
})
export class InternList {

}
