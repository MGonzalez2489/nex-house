import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAvatarGroup } from './user-avatar-group';

describe('UserAvatarGroup', () => {
  let component: UserAvatarGroup;
  let fixture: ComponentFixture<UserAvatarGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAvatarGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(UserAvatarGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
