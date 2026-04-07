import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChargesApproval } from './charges-approval';

describe('ChargesApproval', () => {
  let component: ChargesApproval;
  let fixture: ComponentFixture<ChargesApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargesApproval],
    }).compileComponents();

    fixture = TestBed.createComponent(ChargesApproval);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
