import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersFilters } from './users-filters';

describe('UsersFilters', () => {
  let component: UsersFilters;
  let fixture: ComponentFixture<UsersFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
