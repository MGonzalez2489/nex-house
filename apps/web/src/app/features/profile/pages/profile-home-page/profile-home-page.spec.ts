import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProfileHomePage } from "./profile-home-page";

describe("ProfileHomePage", () => {
  let component: ProfileHomePage;
  let fixture: ComponentFixture<ProfileHomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileHomePage],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileHomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
