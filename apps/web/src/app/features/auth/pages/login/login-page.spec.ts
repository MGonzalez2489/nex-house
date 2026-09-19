import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router, provideRouter} from '@angular/router';
import {AuthStore} from '@auth/store';
import {StartupStore} from '@stores/startup.store';
import {LoginPage} from './login-page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let login: jest.Mock;
  let armLoading: jest.Mock;
  let navigateByUrl: jest.Mock;

  beforeEach(async () => {
    login = jest.fn().mockResolvedValue(true);
    armLoading = jest.fn();
    navigateByUrl = jest.fn();

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        {provide: Router, useValue: {navigateByUrl}},
        {provide: ActivatedRoute, useValue: {}},
        {
          provide: AuthStore,
          useValue: {
            login,
            callState: () => 'idle',
            loading: () => false,
          },
        },
        {
          provide: StartupStore,
          useValue: {armLoading},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('arms the splash and navigates to dashboard on successful login', async () => {
    await component.doSubmit();

    expect(login).toHaveBeenCalledWith({email: 'root@test.com', password: '1234'});
    expect(armLoading).toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('does not arm the splash or navigate when login fails', async () => {
    login.mockResolvedValue(false);

    await component.doSubmit();

    expect(armLoading).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('does not submit when the form is invalid', async () => {
    component.form.controls.password.setValue('x');

    await component.doSubmit();

    expect(login).not.toHaveBeenCalled();
    expect(armLoading).not.toHaveBeenCalled();
  });

  it('renders a single h1 heading and an accessible email field', () => {
    fixture.detectChanges();

    const headings = fixture.nativeElement.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toContain('Bienvenido de vuelta');

    const email: HTMLInputElement = fixture.nativeElement.querySelector('input#email');
    expect(email).not.toBeNull();
    expect(email.getAttribute('autocomplete')).toBe('email');
  });
});
