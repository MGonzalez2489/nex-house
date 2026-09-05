import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProfileInfoForm } from "./profile-info-form";

describe("ProfileInfoForm", () => {
  let component: ProfileInfoForm;
  let fixture: ComponentFixture<ProfileInfoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileInfoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileInfoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
