import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitsTable } from './units-table';

describe('UnitsTable', () => {
  let component: UnitsTable;
  let fixture: ComponentFixture<UnitsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
