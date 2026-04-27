import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeeScheduleInit } from './fee-schedule-init';

describe('FeeScheduleInit', () => {
  let component: FeeScheduleInit;
  let fixture: ComponentFixture<FeeScheduleInit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeScheduleInit],
    }).compileComponents();

    fixture = TestBed.createComponent(FeeScheduleInit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
