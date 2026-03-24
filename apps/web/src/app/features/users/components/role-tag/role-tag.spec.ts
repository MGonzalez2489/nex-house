import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleTag } from './role-tag';

describe('RoleTag', () => {
  let component: RoleTag;
  let fixture: ComponentFixture<RoleTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleTag],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleTag);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
