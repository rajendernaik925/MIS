import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[noFirstSpace]',
    standalone: false
})
export class NoFirstSpaceDirective {

  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;

    // Prevent first character from being a space
    if (inputValue.startsWith(' ')) {
      inputValue = inputValue.trimStart();
    }

    // Set the cleaned value back to the control
    this.ngControl.control?.setValue(inputValue, { emitEvent: false });
  }
}

