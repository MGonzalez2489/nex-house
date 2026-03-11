import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeighborhoodsFilters } from './neighborhoods-filters';

describe('NeighborhoodsFilters', () => {
  let component: NeighborhoodsFilters;
  let fixture: ComponentFixture<NeighborhoodsFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighborhoodsFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighborhoodsFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
