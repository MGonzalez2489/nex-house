import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavSubmenu } from './nav-submenu';

describe('NavSubmenu', () => {
  let component: NavSubmenu;
  let fixture: ComponentFixture<NavSubmenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavSubmenu],
    }).compileComponents();

    fixture = TestBed.createComponent(NavSubmenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
