import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeigUnitsPage } from './neig-units-page';

describe('NeigUnitsPage', () => {
  let component: NeigUnitsPage;
  let fixture: ComponentFixture<NeigUnitsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeigUnitsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(NeigUnitsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
