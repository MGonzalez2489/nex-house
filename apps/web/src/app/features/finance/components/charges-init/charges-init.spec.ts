import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChargesInit } from './charges-init';

describe('ChargesInit', () => {
  let component: ChargesInit;
  let fixture: ComponentFixture<ChargesInit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargesInit],
    }).compileComponents();

    fixture = TestBed.createComponent(ChargesInit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
