import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormOptions } from './form-options';

describe('FormOptions', () => {
  let component: FormOptions;
  let fixture: ComponentFixture<FormOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormOptions],
    }).compileComponents();

    fixture = TestBed.createComponent(FormOptions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
