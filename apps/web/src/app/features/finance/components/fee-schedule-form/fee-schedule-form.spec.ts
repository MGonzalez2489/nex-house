import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeeScheduleForm } from './fee-schedule-form';

describe('FeeScheduleForm', () => {
  let component: FeeScheduleForm;
  let fixture: ComponentFixture<FeeScheduleForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeScheduleForm],
    }).compileComponents();

    fixture = TestBed.createComponent(FeeScheduleForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
