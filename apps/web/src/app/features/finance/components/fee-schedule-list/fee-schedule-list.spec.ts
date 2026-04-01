import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeeScheduleList } from './fee-schedule-list';

describe('FeeScheduleList', () => {
  let component: FeeScheduleList;
  let fixture: ComponentFixture<FeeScheduleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeScheduleList],
    }).compileComponents();

    fixture = TestBed.createComponent(FeeScheduleList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
