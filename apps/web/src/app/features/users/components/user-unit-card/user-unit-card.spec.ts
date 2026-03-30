import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserUnitCard } from './user-unit-card';

describe('UserUnitCard', () => {
  let component: UserUnitCard;
  let fixture: ComponentFixture<UserUnitCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserUnitCard],
    }).compileComponents();

    fixture = TestBed.createComponent(UserUnitCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
