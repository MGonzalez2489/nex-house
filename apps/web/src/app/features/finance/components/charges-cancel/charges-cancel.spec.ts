import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChargesCancel } from './charges-cancel';

describe('ChargesCancel', () => {
  let component: ChargesCancel;
  let fixture: ComponentFixture<ChargesCancel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargesCancel],
    }).compileComponents();

    fixture = TestBed.createComponent(ChargesCancel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
