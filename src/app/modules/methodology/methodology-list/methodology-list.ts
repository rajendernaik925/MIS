import { Component } from '@angular/core';
import { InProgress } from "../../supprt-components/in-progress/in-progress";

@Component({
  selector: 'app-methodology-list',
  imports: [
    InProgress
],
  templateUrl: './methodology-list.html',
  styleUrl: './methodology-list.scss',
})
export class MethodologyList {

}
