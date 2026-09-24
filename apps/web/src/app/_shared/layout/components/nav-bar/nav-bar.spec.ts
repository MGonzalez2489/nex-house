import {
  UserModel,
  UserProfileModel,
  UserRoleModel,
} from "@nexhouse/shared-domain/models";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NavBar } from "./nav-bar";

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

describe("NavBar", () => {
  let component: NavBar;
  let fixture: ComponentFixture<NavBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBar],
    }).compileComponents();

    fixture = TestBed.createComponent(NavBar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("user", USER);
    fixture.componentRef.setInput("profile", PROFILE);
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
