import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinanceHome } from './finance-home';

describe('FinanceHome', () => {
  let component: FinanceHome;
  let fixture: ComponentFixture<FinanceHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceHome],
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
