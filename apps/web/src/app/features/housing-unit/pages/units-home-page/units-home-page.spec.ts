import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitsHomePage } from './units-home-page';

describe('UnitsHomePage', () => {
  let component: UnitsHomePage;
  let fixture: ComponentFixture<UnitsHomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitsHomePage],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitsHomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
