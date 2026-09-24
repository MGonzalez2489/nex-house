import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { SideItem } from "./side-item";
import { SidebarItem } from "./sidebar-item";

const ITEM: SideItem = {
  title: "Dashboard",
  route: "/dashboard",
};

describe("SidebarItem", () => {
  let component: SidebarItem;
  let fixture: ComponentFixture<SidebarItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarItem],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarItem);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("item", ITEM);
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
