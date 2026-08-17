import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AvatarUploadComponent } from "./avatar-upload-component";

describe("AvatarUploadComponent", () => {
  let component: AvatarUploadComponent;
  let fixture: ComponentFixture<AvatarUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarUploadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarUploadComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
