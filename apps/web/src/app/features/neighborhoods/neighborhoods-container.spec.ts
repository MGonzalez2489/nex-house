import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeighborhoodsContainer } from './neighborhoods-container';

describe('NeighborhoodsContainer', () => {
  let component: NeighborhoodsContainer;
  let fixture: ComponentFixture<NeighborhoodsContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighborhoodsContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighborhoodsContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
