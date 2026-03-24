import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersHomePage } from './users-home-page';

describe('UsersHomePage', () => {
  let component: UsersHomePage;
  let fixture: ComponentFixture<UsersHomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersHomePage],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersHomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
