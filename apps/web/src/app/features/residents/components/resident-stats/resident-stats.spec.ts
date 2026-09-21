import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UserRoleEnum, UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { UserStats } from "@nexhouse/shared-domain/interfaces";
import { ResidentStats } from "./resident-stats";

const STATS: UserStats = {
  summary: { totalUsers: 3 },
  byRole: {
    [UserRoleEnum.RESIDENT]: 2,
    [UserRoleEnum.ADMIN]: 1,
  },
  byStatus: {
    [UserStatusEnum.ACTIVE]: 2,
    [UserStatusEnum.PENDING_ONBOARDING]: 1,
  },
};

describe("ResidentStats", () => {
  let component: ResidentStats;
  let fixture: ComponentFixture<ResidentStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentStats],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows nothing until stats are provided", () => {
    expect(fixture.nativeElement.textContent).not.toContain(
      "Estadísticas Generales",
    );
  });

  it("renders the total KPI from the summary", async () => {
    fixture.componentRef.setInput("stats", STATS);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Total de registros");
    expect(fixture.nativeElement.textContent).toContain("3");
  });

  it("builds a role row per role preset with its count", async () => {
    fixture.componentRef.setInput("stats", STATS);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.roleRows()).toEqual([
      { code: UserRoleEnum.RESIDENT, label: "Residentes", dotClass: "bg-blue-500", count: 2 },
      { code: UserRoleEnum.ADMIN, label: "Administradores", dotClass: "bg-purple-500", count: 1 },
    ]);
  });

  it("sorts status rows by count in descending order", async () => {
    fixture.componentRef.setInput("stats", STATS);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.statusRows().map((s) => s.code)).toEqual([
      UserStatusEnum.ACTIVE,
      UserStatusEnum.PENDING_ONBOARDING,
    ]);
  });

  it("shows the empty-state copy when a distribution is empty", async () => {
    fixture.componentRef.setInput("stats", {
      summary: { totalUsers: 0 },
      byRole: {},
      byStatus: {},
    });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Sin datos por rol.");
    expect(fixture.nativeElement.textContent).toContain("Sin datos por estado.");
  });
});