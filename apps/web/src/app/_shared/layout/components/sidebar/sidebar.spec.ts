import {
  UserModel,
  UserProfileModel,
  UserRoleModel,
} from "@nexhouse/shared-domain/models";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { SideItem } from "../sidebar-item/side-item";
import { Sidebar } from "./sidebar";

const ROLE: UserRoleModel = {
  publicId: "role-1",
  name: "super_admin",
  displayName: "Super Admin",
};

const PROFILE: UserProfileModel = {
  publicId: "profile-1",
  firstName: "Root",
  lastName: "Admin",
  fullName: "Root Admin",
  phone: "",
};

const USER: UserModel = {
  publicId: "user-1",
  email: "root@nexhouse.com",
  isFirstAdmin: true,
  requirePwdChange: false,
  role: ROLE,
  profile: PROFILE,
  userUnits: [],
};

const ITEMS: SideItem[] = [
  {
    title: "Principal",
    items: [{ title: "Dashboard", route: "/dashboard" }],
  },
  { title: "Fraccionamientos", route: "/neighborhoods" },
];

describe("Sidebar", () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("items", ITEMS);
    fixture.componentRef.setInput("user", USER);
    fixture.componentRef.setInput("profile", PROFILE);
    fixture.componentRef.setInput("role", ROLE);
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
