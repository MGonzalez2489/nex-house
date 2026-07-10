import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PassRecoveryPage } from "./pass-recovery-page";

describe("PassRecoveryPage", () => {
  let component: PassRecoveryPage;
  let fixture: ComponentFixture<PassRecoveryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassRecoveryPage],
    }).compileComponents();

    fixture = TestBed.createComponent(PassRecoveryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
