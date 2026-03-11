import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeighborhoodsStats } from './neighborhoods-stats';

describe('NeighborhoodsStats', () => {
  let component: NeighborhoodsStats;
  let fixture: ComponentFixture<NeighborhoodsStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighborhoodsStats],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighborhoodsStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
