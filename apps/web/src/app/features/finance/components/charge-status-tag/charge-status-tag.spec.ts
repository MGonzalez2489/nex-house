import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChargeStatusTag } from './charge-status-tag';

describe('ChargeStatusTag', () => {
  let component: ChargeStatusTag;
  let fixture: ComponentFixture<ChargeStatusTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargeStatusTag],
    }).compileComponents();

    fixture = TestBed.createComponent(ChargeStatusTag);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
