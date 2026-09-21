/* eslint-disable @angular-eslint/component-selector */
import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  ComponentFixture,
  contentChild,
  input,
  output,
  TemplateRef,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { CallState } from "@ngrx-toolkit/core";
import { UserModel, UserProfileModel } from "@nexhouse/shared-domain/models";
import { FormOptions, ProfileFormComponent } from "@shared/components/forms";
import { Button } from "@openng/optimus-ui/button";
import { Panel } from "@openng/optimus-ui/panel";
import { ProfileInfoForm } from "./profile-info-form";

const USER: UserModel = {
  publicId: "usr-1",
  email: "user@example.com",
  isFirstAdmin: false,
  requirePwdChange: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userUnits: [],
};

const PROFILE: UserProfileModel = {
  publicId: "prof-1",
  firstName: "Juan",
  lastName: "Pérez",
  fullName: "Juan Pérez",
  phone: "6141234567",
};

@Component({
  standalone: true,
  selector: "p-panel",
  imports: [NgTemplateOutlet],
  template: `
    <ng-content />
    @if (icons()) {
      <ng-container [ngTemplateOutlet]="icons() ?? null" />
    }
  `,
})
class StubPanel {
  icons = contentChild("icons", { read: TemplateRef });
}

@Component({
  standalone: true,
  selector: "p-button",
  template: `<button type="button" class="stub-edit"><ng-content /></button>`,
})
class StubButton {}

@Component({
  standalone: true,
  selector: "app-profile-form-component",
  template: `<ng-content />`,
})
class StubProfileForm {
  readonly profile = input<UserProfileModel>();
  readonly disabledForm = input<boolean>();
  readonly doSubmit = output<FormData>();
}

@Component({
  standalone: true,
  selector: "app-form-options",
  template: `
    <button
      type="button"
      class="stub-cancel"
      (click)="doCancel.emit(true)"
    >
      cancelar
    </button>
  `,
})
class StubFormOptions {
  readonly callState = input<CallState>();
  readonly isLoading = input<boolean>();
  readonly submitLabel = input<string>();
  readonly doCancel = output<boolean>();
}

describe("ProfileInfoForm", () => {
  let fixture: ComponentFixture<ProfileInfoForm>;
  let component: ProfileInfoForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileInfoForm],
    })
      .overrideComponent(ProfileInfoForm, {
        remove: {
          imports: [Panel, Button, ProfileFormComponent, FormOptions],
        },
        add: {
          imports: [StubPanel, StubButton, StubProfileForm, StubFormOptions],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileInfoForm);
    component = fixture.componentInstance;

    fixture.componentRef.setInput("user", USER);
    fixture.componentRef.setInput("profile", PROFILE);
    fixture.componentRef.setInput("isLoading", false);
    fixture.componentRef.setInput("callState", undefined);

    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("renders the email read-only with the user email", () => {
    const email = fixture.nativeElement.querySelector(
      "input[id='email']",
    ) as HTMLInputElement;

    expect(email?.value).toBe("user@example.com");
    expect(email?.disabled).toBe(true);
  });

  it("starts in info mode without the form actions", () => {
    expect(
      fixture.nativeElement.querySelector(".stub-cancel"),
    ).not.toBeTruthy();
  });

  it("switches to form mode when the edit button is clicked", async () => {
    fixture.nativeElement.querySelector(".stub-edit")?.click();
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector(".stub-cancel"),
    ).toBeTruthy();
  });

  it("emits save with the submitted FormData", async () => {
    const dto = new FormData();
    dto.append("firstName", "Maria");
    let emitted: FormData | undefined;
    component.save.subscribe((value) => (emitted = value));

    fixture.nativeElement.querySelector(".stub-edit")?.click();
    await fixture.whenStable();

    const profileForm = fixture.debugElement.query(
      (el) => el.componentInstance instanceof StubProfileForm,
    )?.componentInstance as StubProfileForm;
    profileForm.doSubmit.emit(dto);

    expect(emitted).toBe(dto);
  });

  it("returns to info mode when the user cancels", async () => {
    fixture.nativeElement.querySelector(".stub-edit")?.click();
    await fixture.whenStable();

    fixture.nativeElement.querySelector(".stub-cancel")?.click();
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector(".stub-cancel"),
    ).not.toBeTruthy();
  });

  it("returns to info mode after a successful save", async () => {
    fixture.nativeElement.querySelector(".stub-edit")?.click();
    await fixture.whenStable();

    fixture.componentRef.setInput("callState", "loading");
    await fixture.whenStable();
    fixture.componentRef.setInput("callState", "loaded");
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector(".stub-cancel"),
    ).not.toBeTruthy();
  });

  it("stays in form mode when the save fails", async () => {
    fixture.nativeElement.querySelector(".stub-edit")?.click();
    await fixture.whenStable();

    fixture.componentRef.setInput("callState", "loading");
    await fixture.whenStable();
    fixture.componentRef.setInput(
      "callState",
      { error: new Error("boom"), errorMessage: "boom" },
    );
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector(".stub-cancel"),
    ).toBeTruthy();
  });
});