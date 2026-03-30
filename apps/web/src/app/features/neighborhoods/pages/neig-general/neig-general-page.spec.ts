import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeigGeneralPage } from './neig-general-page';

describe('NeigGeneralPage', () => {
  let component: NeigGeneralPage;
  let fixture: ComponentFixture<NeigGeneralPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeigGeneralPage],
    }).compileComponents();

    fixture = TestBed.createComponent(NeigGeneralPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
