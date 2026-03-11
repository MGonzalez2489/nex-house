import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeigUsersPage } from './neig-users-page';

describe('NeigUsersPage', () => {
  let component: NeigUsersPage;
  let fixture: ComponentFixture<NeigUsersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeigUsersPage],
    }).compileComponents();

    fixture = TestBed.createComponent(NeigUsersPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
