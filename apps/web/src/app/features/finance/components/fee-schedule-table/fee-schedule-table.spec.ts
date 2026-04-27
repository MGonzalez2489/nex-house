import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeeScheduleTable } from './fee-schedule-table';

describe('FeeScheduleTable', () => {
  let component: FeeScheduleTable;
  let fixture: ComponentFixture<FeeScheduleTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeScheduleTable],
    }).compileComponents();

    fixture = TestBed.createComponent(FeeScheduleTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
