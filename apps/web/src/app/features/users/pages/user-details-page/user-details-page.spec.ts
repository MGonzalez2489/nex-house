import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsPage } from './user-details-page';

describe('UserDetailsPage', () => {
  let component: UserDetailsPage;
  let fixture: ComponentFixture<UserDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
