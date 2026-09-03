import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProfileFormComponent } from "./profile-form-component";

describe("ProfileFormComponent", () => {
  let component: ProfileFormComponent;
  let fixture: ComponentFixture<ProfileFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
