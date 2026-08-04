import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameCharacterPipe',
  standalone: true // Mark it as standalone
})
export class EmptyValuePipe implements PipeTransform {
  transform(value: string): string {
    if (value.length > 8) {
      return value.substring(0, 8) + '...';
    }
    return value;
  }
}
