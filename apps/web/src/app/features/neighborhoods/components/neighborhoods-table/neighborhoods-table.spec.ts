import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeighborhoodsTable } from './neighborhoods-table';

describe('NeighborhoodsTable', () => {
  let component: NeighborhoodsTable;
  let fixture: ComponentFixture<NeighborhoodsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighborhoodsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighborhoodsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
