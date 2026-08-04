import { FormGroup } from "@angular/forms";

export function autoSelectAndDisableIfSingle<T>(
  form: FormGroup,
  controlName: string,
  list: T[],
  valueKey: keyof T
) {

  const control = form.get(controlName);

  if (!control) return;

  if (list?.length === 1) {

    const value = list[0][valueKey];

    // ✅ Set value properly
    control.setValue(value);

    // ✅ Mark for UI update
    control.markAsDirty();
    control.markAsTouched();
    control.updateValueAndValidity();

    // ✅ Disable without emitting event
    setTimeout(() => {
      control.disable({ emitEvent: false });
    });

  } else {

    control.enable({ emitEvent: false });

  }

}