import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeeScheduleDetails } from './fee-schedule-details';

describe('FeeScheduleDetails', () => {
  let component: FeeScheduleDetails;
  let fixture: ComponentFixture<FeeScheduleDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeScheduleDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(FeeScheduleDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
