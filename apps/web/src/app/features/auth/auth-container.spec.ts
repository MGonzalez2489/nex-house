import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {AuthContainer} from './auth-container';

describe('AuthContainer', () => {
  let fixture: ComponentFixture<AuthContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthContainer],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthContainer);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a semantic main landmark with the brand and the routed view', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('main')).not.toBeNull();
    expect(element.querySelector('app-brand-component')).not.toBeNull();
    expect(element.querySelector('router-outlet')).not.toBeNull();
  });
});
