import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { ResidentStatusComponent } from "./resident-status-component";

const DEFAULT_STATUS = {
  publicId: "s-1",
  name: UserStatusEnum.ACTIVE,
  displayName: "Activo",
};

const STATUS_MAP: Array<[UserStatusEnum, string]> = [
  [UserStatusEnum.ACTIVE, "success"],
  [UserStatusEnum.INACTIVE, "secondary"],
  [UserStatusEnum.PENDING_ONBOARDING, "warn"],
  [UserStatusEnum.PASSWORD_RECOVERY, "danger"],
];

describe("ResidentStatusComponent", () => {
  let component: ResidentStatusComponent;
  let fixture: ComponentFixture<ResidentStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentStatusComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("status", DEFAULT_STATUS);
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it.each(STATUS_MAP)(
    "maps %s to the %s severity",
    (name, severity) => {
      fixture.componentRef.setInput("status", {
        publicId: "s-1",
        name,
        displayName: name,
      });
      fixture.detectChanges();

      expect(component.severity()).toBe(severity);
    },
  );

  it("falls back to secondary for unknown statuses", () => {
    fixture.componentRef.setInput("status", {
      publicId: "s-1",
      name: "unknown_status",
      displayName: "Unknown",
    });
    fixture.detectChanges();

    expect(component.severity()).toBe("secondary");
  });

  it("renders the status display name", () => {
    fixture.componentRef.setInput("status", {
      publicId: "s-1",
      name: UserStatusEnum.ACTIVE,
      displayName: "Activo",
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Activo");
  });
});