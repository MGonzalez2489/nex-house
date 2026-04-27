import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChargesSummary } from './charges-summary';

describe('ChargesSummary', () => {
  let component: ChargesSummary;
  let fixture: ComponentFixture<ChargesSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargesSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(ChargesSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
