import { ComponentFixture } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ProfileEditPayload } from "@core/models/profile-edit-payload";
import { FileModel, UserProfileModel } from "@nexhouse/shared-domain/models";
import { ProfileFormComponent } from "./profile-form-component";

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: jest.fn().mockReturnValue("blob:mock"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: jest.fn(),
  });
});

const BASE_DATE = new Date().toISOString();

const FILE_MODEL: FileModel = {
  publicId: "file-1",
  originalName: "avatar.png",
  fileName: "avatar.png",
  mimeType: "image/png",
  size: 1024,
  url: "http://localhost:3000/uploads/avatar.png",
  extension: "png",
  createdAt: BASE_DATE,
  updatedAt: BASE_DATE,
};

const PROFILE: UserProfileModel = {
  publicId: "prof-1",
  firstName: "Ana",
  lastName: "Martínez López",
  fullName: "Ana Martínez López",
  phone: "(614)-123-4567",
  avatar: FILE_MODEL,
  createdAt: BASE_DATE,
  updatedAt: BASE_DATE,
};

function makeFile(name = "avatar.png"): File {
  return new File(["data"], name, { type: "image/png" });
}

function chooseFile(
  fixture: ComponentFixture<ProfileFormComponent>,
  file: File,
): void {
  const input = fixture.nativeElement.querySelector(
    "input[type='file']",
  ) as HTMLInputElement;
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [file],
  });
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("ProfileFormComponent", () => {
  let fixture: ComponentFixture<ProfileFormComponent>;
  let component: ProfileFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    (URL.createObjectURL as jest.Mock).mockReset();
    (URL.createObjectURL as jest.Mock).mockReturnValue("blob:mock");
    (URL.revokeObjectURL as jest.Mock).mockReset();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("renders the required labels and form controls", () => {
    const nameLabel: HTMLLabelElement = fixture.nativeElement.querySelector(
      "label[for='firstName']",
    );
    const phoneLabel: HTMLLabelElement = fixture.nativeElement.querySelector(
      "label[for='phone']",
    );

    expect(nameLabel.textContent?.trim()).toBe("Nombre");
    expect(nameLabel.className).toContain("required");
    expect(phoneLabel.textContent?.trim()).toBe("Teléfono");
    expect(phoneLabel.className).toContain("required");
    expect(
      fixture.nativeElement.querySelector("input[id='firstName']"),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector("input[id='lastName']"),
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector("input[id='phone']")).toBeTruthy();
  });

  it("keeps the phone mask placeholder", () => {
    const phone: HTMLInputElement =
      fixture.nativeElement.querySelector("input[id='phone']");

    expect(phone.getAttribute("placeholder")).toBe("(614)-123-4567");
    expect(phone.getAttribute("pinputmask")).not.toBeNull();
  });

  it("does not emit when the form is invalid", () => {
    const emitted: ProfileEditPayload[] = [];
    component.doSubmit.subscribe((value) => emitted.push(value));

    component.onSubmit();

    expect(emitted).toHaveLength(0);
  });

  it("emits all fields when there is no source profile", () => {
    const emitted: ProfileEditPayload[] = [];
    component.doSubmit.subscribe((value) => emitted.push(value));

    component.form.controls.firstName.setValue("Ana");
    component.form.controls.lastName.setValue("Martínez López");
    component.form.controls.phone.setValue("(614)-123-4567");
    component.onSubmit();

    expect(emitted).toEqual([
      {
        firstName: "Ana",
        lastName: "Martínez López",
        phone: "(614)-123-4567",
      },
    ]);
  });

  it("emits only the changed fields when a source profile exists", async () => {
    fixture.componentRef.setInput("profile", PROFILE);
    await fixture.whenStable();

    const emitted: ProfileEditPayload[] = [];
    component.doSubmit.subscribe((value) => emitted.push(value));

    component.form.controls.phone.setValue("(614)-555-0101");
    component.onSubmit();

    expect(emitted).toEqual([{ phone: "(614)-555-0101" }]);
  });

  it("patches the form from the profile input and falls back to the stored avatar preview", async () => {
    fixture.componentRef.setInput("profile", PROFILE);
    await fixture.whenStable();

    expect(component.form.controls.firstName.value).toBe("Ana");
    expect(component.form.controls.phone.value).toBe("(614)-123-4567");
    expect(component.form.controls.avatar.value).toBeNull();
    expect(component.form.controls.avatar.pristine).toBe(true);
    expect(component.previewUrl()).toBe(PROFILE.avatar?.url);
    expect(fixture.nativeElement.querySelector("img[alt='']")).toBeTruthy();
  });

  it("selects a file through the file upload and includes it in the payload when dirty", async () => {
    const file = makeFile();
    chooseFile(fixture, file);
    await fixture.whenStable();

    expect(component.form.controls.avatar.value).toBe(file);

    const emitted: ProfileEditPayload[] = [];
    component.doSubmit.subscribe((value) => emitted.push(value));
    component.form.controls.firstName.setValue("Ana");
    component.form.controls.phone.setValue("(614)-123-4567");
    component.onSubmit();

    expect(emitted[0].avatar).toBe(file);
  });

  it("excludes the avatar from the payload when the control is not dirty", async () => {
    const file = makeFile();
    component.form.controls.avatar.setValue(file);
    component.form.controls.avatar.markAsPristine();
    component.form.controls.firstName.setValue("Ana");
    component.form.controls.lastName.setValue("Martínez López");
    component.form.controls.phone.setValue("(614)-123-4567");

    const emitted: ProfileEditPayload[] = [];
    component.doSubmit.subscribe((value) => emitted.push(value));
    component.onSubmit();

    expect(emitted).toEqual([
      {
        firstName: "Ana",
        lastName: "Martínez López",
        phone: "(614)-123-4567",
      },
    ]);
  });

  it("revokes the previous object URL when a new avatar is selected", async () => {
    const createSpy = URL.createObjectURL as jest.Mock;
    createSpy.mockReset();
    createSpy.mockReturnValueOnce("blob:first").mockReturnValueOnce("blob:second");
    const revokeSpy = URL.revokeObjectURL as jest.Mock;

    chooseFile(fixture, makeFile("first.png"));
    await fixture.whenStable();
    chooseFile(fixture, makeFile("second.png"));
    await fixture.whenStable();

    expect(createSpy).toHaveBeenCalledTimes(2);
    expect(revokeSpy).toHaveBeenCalledWith("blob:first");
  });

  it("reverts the avatar preview to the original stored avatar when resyncKey is bumped", async () => {
    fixture.componentRef.setInput("profile", PROFILE);
    await fixture.whenStable();

    chooseFile(fixture, makeFile("new.png"));
    await fixture.whenStable();
    expect(component.form.controls.avatar.value).toBeInstanceOf(File);
    expect(component.previewUrl()).toBe("blob:mock");

    fixture.componentRef.setInput("resyncKey", 1);
    await fixture.whenStable();

    expect(component.form.controls.avatar.value).toBeNull();
    expect(component.form.controls.avatar.pristine).toBe(true);
    expect(component.previewUrl()).toBe(PROFILE.avatar?.url);
    expect(fixture.nativeElement.querySelector("img[alt='']")).toBeTruthy();
  });

  it("reverts to the placeholder icon when there is no stored avatar and resyncKey is bumped", async () => {
    fixture.componentRef.setInput("profile", { ...PROFILE, avatar: undefined });
    await fixture.whenStable();

    chooseFile(fixture, makeFile("new.png"));
    await fixture.whenStable();
    expect(component.previewUrl()).toBe("blob:mock");

    fixture.componentRef.setInput("resyncKey", 1);
    await fixture.whenStable();

    expect(component.previewUrl()).toBeNull();
    expect(fixture.nativeElement.querySelector("img[alt='']")).toBeNull();
    expect(
      fixture.nativeElement.querySelector("i.pi-user"),
    ).toBeTruthy();
  });

  it("opens the native chooser when the avatar button is clicked", () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      "button[aria-label='Subir foto de perfil']",
    );
    const input = fixture.nativeElement.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    const clickSpy = jest.spyOn(input, "click");

    button.click();

    expect(clickSpy).toHaveBeenCalled();
  });

  it("does not open the chooser when the form is disabled", async () => {
    fixture.componentRef.setInput("disabledForm", true);
    await fixture.whenStable();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      "button[aria-label='Subir foto de perfil']",
    );
    const input = fixture.nativeElement.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    const clickSpy = jest.spyOn(input, "click");

    button.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("disables the form and the avatar trigger when disabledForm is set", async () => {
    fixture.componentRef.setInput("disabledForm", true);
    await fixture.whenStable();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      "button[aria-label='Subir foto de perfil']",
    );
    const firstName: HTMLInputElement =
      fixture.nativeElement.querySelector("input[id='firstName']");

    expect(component.form.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    expect(firstName.disabled).toBe(true);
  });

  it("wires aria-invalid and aria-describedby to the shared error element", () => {
    component.onSubmit();
    fixture.detectChanges();

    const firstName: HTMLInputElement =
      fixture.nativeElement.querySelector("input[id='firstName']");
    const phone: HTMLInputElement =
      fixture.nativeElement.querySelector("input[id='phone']");
    const lastName: HTMLInputElement =
      fixture.nativeElement.querySelector("input[id='lastName']");

    expect(firstName.getAttribute("aria-invalid")).toBe("true");
    expect(firstName.getAttribute("aria-describedby")).toBe("firstName-errors");
    expect(
      fixture.nativeElement.querySelector("#firstName-errors"),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector("#firstName-errors small").textContent?.trim(),
    ).toBe("Nombre es obligatorio.");

    expect(phone.getAttribute("aria-describedby")).toBe("phone-errors");
    expect(
      fixture.nativeElement.querySelector("#phone-errors small").textContent?.trim(),
    ).toBe("Teléfono es obligatorio.");

    expect(lastName.getAttribute("aria-describedby")).toBeNull();
  });

  it("announces the avatar helper text", () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      "button[aria-label='Subir foto de perfil']",
    );

    expect(button.getAttribute("aria-describedby")).toBe("avatar-hint");
    expect(fixture.nativeElement.querySelector("#avatar-hint")).toBeTruthy();
  });
});