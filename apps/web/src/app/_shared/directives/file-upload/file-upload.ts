/* eslint-disable @typescript-eslint/no-explicit-any */
import { Directive, forwardRef, inject } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { FileUpload } from "primeng/fileupload";

@Directive({
  // selector: "[appFileUpload]",
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: "p-fileupload[formControlName], p-fileupload[formControl]",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadDirective),
      multi: true,
    },
  ],
  standalone: true,
})
export class FileUploadDirective implements ControlValueAccessor {
  private fileUpload = inject(FileUpload);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (file: File | null) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  async writeValue(file: File | null) {
    // Update the component's internal file list if value is set programmatically
    if (file && file instanceof File) {
      this.fileUpload.files = [file];
    } else {
      this.fileUpload.clear();
    }
  }

  registerOnChange(fn: any): void {
    // Notify the form when a file is selected or cleared
    this.fileUpload.onSelect.subscribe((event: any) => {
      fn(event.files?.[0] || null);
    });
    this.fileUpload.onClear.subscribe(() => {
      fn(null);
    });
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.fileUpload.disabled = isDisabled;
  }
}
