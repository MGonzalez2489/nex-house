import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeighborhoodHomePage } from './neighborhood-home-page';

describe('NeighborhoodHomePage', () => {
  let component: NeighborhoodHomePage;
  let fixture: ComponentFixture<NeighborhoodHomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighborhoodHomePage],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighborhoodHomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
