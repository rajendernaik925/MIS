import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NumbersOnlyDirective } from "../core/directives/numbers-only.directive";
import { StringOnlyDirective } from "../core/directives/string-only.directive";
import { NoFirstSpaceDirective } from "../core/directives/no-first-space.directive";
import { SafeUrlPipe } from "./pipes/safe-url.pipe";

@NgModule({
  declarations: [
    NumbersOnlyDirective,
    StringOnlyDirective,
    NoFirstSpaceDirective,
    SafeUrlPipe
  ],
  imports: [
    FormsModule,
    CommonModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    NumbersOnlyDirective,
    StringOnlyDirective,
    NoFirstSpaceDirective,
    SafeUrlPipe,
  ],
})

export class SharedModule {}
