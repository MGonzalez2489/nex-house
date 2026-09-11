import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PassCodeValidatePage} from './pass-code-validate-page';

describe('PassCodeValidatePage', () => {
  let component: PassCodeValidatePage;
  let fixture: ComponentFixture<PassCodeValidatePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassCodeValidatePage],
    }).compileComponents();

    fixture = TestBed.createComponent(PassCodeValidatePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
