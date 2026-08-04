import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[stringOnly]',
    standalone: false
})
export class StringOnlyDirective {
  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    let input = inputEl.value || '';

    let cleaned = input.replace(/[^a-zA-Z\s]/g, '');

    if (cleaned.startsWith(' ')) {
      cleaned = cleaned.trimStart();
    }

    if (input !== cleaned) {
      this.ngControl.control?.setValue(cleaned);
    }
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const inputEl = event.target as HTMLInputElement;
    const inputValue = inputEl.value;

    const key = event.key;
    const isLetter = /^[a-zA-Z]$/.test(key);
    const isSpace = key === ' ';

    if (isSpace && inputValue.length === 0) {
      event.preventDefault();
    }

    if (!isLetter && !isSpace) {
      event.preventDefault();
    }
  }
}
