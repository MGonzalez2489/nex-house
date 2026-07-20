import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DataViewerComponent } from "./data-viewer-component";

describe("DataViewerComponent", () => {
  let component: DataViewerComponent;
  let fixture: ComponentFixture<DataViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataViewerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
