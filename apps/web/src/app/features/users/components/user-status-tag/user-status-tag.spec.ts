import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserStatusTag } from './user-status-tag';

describe('UserStatusTag', () => {
  let component: UserStatusTag;
  let fixture: ComponentFixture<UserStatusTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserStatusTag],
    }).compileComponents();

    fixture = TestBed.createComponent(UserStatusTag);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
