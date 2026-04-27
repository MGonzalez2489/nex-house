import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChargesFilters } from './charges-filters';

describe('ChargesFilters', () => {
  let component: ChargesFilters;
  let fixture: ComponentFixture<ChargesFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargesFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(ChargesFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
