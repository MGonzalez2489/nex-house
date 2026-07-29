import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ResidentsTable } from "./residents-table";

describe("ResidentsTable", () => {
  let component: ResidentsTable;
  let fixture: ComponentFixture<ResidentsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
