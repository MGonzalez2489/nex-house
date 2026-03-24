import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeighborhoodsList } from './neighborhoods-list';

describe('NeighborhoodsList', () => {
  let component: NeighborhoodsList;
  let fixture: ComponentFixture<NeighborhoodsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighborhoodsList],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighborhoodsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
