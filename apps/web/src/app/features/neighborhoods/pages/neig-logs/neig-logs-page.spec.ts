import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeigLogsPage } from './neig-logs-page';

describe('NeigLogsPage', () => {
  let component: NeigLogsPage;
  let fixture: ComponentFixture<NeigLogsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeigLogsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(NeigLogsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
