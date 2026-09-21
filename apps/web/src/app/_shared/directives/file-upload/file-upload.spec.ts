import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { FileUpload } from "@openng/optimus-ui/fileupload";
import { Subject } from "rxjs";
import { FileUploadDirective } from "./file-upload";

class FakeFileUpload {
  files: File[] = [];
  disabled = false;
  onSelect = new Subject<{ files?: File[] }>();
  onClear = new Subject<void>();

  clear(): void {
    this.files = [];
    this.onClear.next();
  }
}

@Component({
  template: `<p-fileupload [formControl]="control"></p-fileupload>`,
  standalone: true,
  imports: [ReactiveFormsModule, FileUploadDirective],
})
class HostComponent {
  control = new FormControl<File | null>(null);
}

describe("FileUploadDirective", () => {
  let host: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let fakeFileUpload: FakeFileUpload;

  const makeFile = (name = "avatar.png"): File =>
    new File(["data"], name, { type: "image/png" });

  beforeEach(async () => {
    fakeFileUpload = new FakeFileUpload();

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: FileUpload, useValue: fakeFileUpload }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should update the component file list when a value is written", () => {
    const file = makeFile();
    host.control.setValue(file);
    expect(fakeFileUpload.files).toEqual([file]);
  });

  it("should clear the component file list when null is written", () => {
    const clearSpy = jest.spyOn(fakeFileUpload, "clear");
    host.control.setValue(null);
    expect(clearSpy).toHaveBeenCalled();
    expect(fakeFileUpload.files).toEqual([]);
  });

  it("should notify the form when a file is selected", () => {
    const file = makeFile("one.png");
    fakeFileUpload.onSelect.next({ files: [file] });
    expect(host.control.value).toBe(file);
  });

  it("should notify the form when files are cleared", () => {
    const file = makeFile("one.png");
    fakeFileUpload.onSelect.next({ files: [file] });
    fakeFileUpload.onClear.next();
    expect(host.control.value).toBeNull();
  });

  it("should reflect the disabled state on the file upload", () => {
    host.control.disable();
    expect(fakeFileUpload.disabled).toBe(true);

    host.control.enable();
    expect(fakeFileUpload.disabled).toBe(false);
  });
});