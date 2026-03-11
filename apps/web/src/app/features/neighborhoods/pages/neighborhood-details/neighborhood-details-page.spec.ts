import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeighborhoodDetailsPage } from './neighborhood-details-page';

describe('NeighborhoodDetailsPage', () => {
  let component: NeighborhoodDetailsPage;
  let fixture: ComponentFixture<NeighborhoodDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighborhoodDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighborhoodDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
