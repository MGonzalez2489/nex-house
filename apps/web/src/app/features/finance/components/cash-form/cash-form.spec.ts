import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashForm } from './cash-form';

describe('CashForm', () => {
  let component: CashForm;
  let fixture: ComponentFixture<CashForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CashForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
