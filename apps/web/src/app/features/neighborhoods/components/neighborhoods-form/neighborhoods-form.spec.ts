import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeighborhoodsForm } from './neighborhoods-form';

describe('NeighborhoodsForm', () => {
  let component: NeighborhoodsForm;
  let fixture: ComponentFixture<NeighborhoodsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighborhoodsForm],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighborhoodsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
