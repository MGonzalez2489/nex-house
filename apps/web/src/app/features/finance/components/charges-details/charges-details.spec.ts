import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChargesDetails } from './charges-details';

describe('ChargesDetails', () => {
  let component: ChargesDetails;
  let fixture: ComponentFixture<ChargesDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargesDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ChargesDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
