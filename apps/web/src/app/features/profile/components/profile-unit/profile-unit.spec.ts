import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProfileUnit } from "./profile-unit";

describe("ProfileUnit", () => {
  let component: ProfileUnit;
  let fixture: ComponentFixture<ProfileUnit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileUnit],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileUnit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
