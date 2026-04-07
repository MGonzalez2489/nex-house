import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChargesTable } from './charges-table';

describe('ChargesTable', () => {
  let component: ChargesTable;
  let fixture: ComponentFixture<ChargesTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargesTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ChargesTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
