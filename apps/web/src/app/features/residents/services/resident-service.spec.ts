import { TestBed } from "@angular/core/testing";
import { RequestService } from "@core/services";
import { SearchUser } from "@nexhouse/shared-domain/interfaces";
import { of } from "rxjs";
import { ResidentService } from "./resident-service";

describe("ResidentService", () => {
  let service: ResidentService;
  let request: {
    get: jest.Mock;
    post: jest.Mock;
    patch: jest.Mock;
  };

  beforeEach(() => {
    request = {
      get: jest.fn().mockReturnValue(of({ data: [], message: "ok" })),
      post: jest.fn().mockReturnValue(of({ data: {}, message: "ok" })),
      patch: jest.fn().mockReturnValue(of({ data: {}, message: "ok" })),
    };

    TestBed.configureTestingModule({
      providers: [
        ResidentService,
        { provide: RequestService, useValue: request },
      ],
    });

    service = TestBed.inject(ResidentService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("getAll delegates to GET /api/neighborhoods/:nId/residents with the search criteria", () => {
    const criteria: SearchUser = { first: 0, rows: 10 };

    service.getAll("nb-1", criteria).subscribe();

    expect(request.get).toHaveBeenCalledWith(
      "/api/neighborhoods/nb-1/residents",
      criteria,
    );
  });

  it("getById delegates to GET /api/neighborhoods/:nId/residents/:id", () => {
    service.getById("nb-1", "usr-1").subscribe();

    expect(request.get).toHaveBeenCalledWith(
      "/api/neighborhoods/nb-1/residents/usr-1",
    );
  });

  it("getStats delegates to GET /api/neighborhoods/:nId/residents/stats", () => {
    service.getStats("nb-1").subscribe();

    expect(request.get).toHaveBeenCalledWith(
      "/api/neighborhoods/nb-1/residents/stats",
    );
  });

  it("create delegates to POST /api/neighborhoods/:nId/residents with the payload", () => {
    const payload = {
      email: "resident@example.com",
      userRoleId: "role-1",
      unit: {
        streetId: "st-1",
        unitIdentifier: "D-101",
        unitTypeId: "unit-type-1",
        unitRoleId: "unit-role-1",
        isCurrentOccupant: true,
      },
    };

    service.create("nb-1", payload).subscribe();

    expect(request.post).toHaveBeenCalledWith(
      "/api/neighborhoods/nb-1/residents",
      payload,
    );
  });

  it("update delegates to PATCH /api/neighborhoods/:nId/residents/:id with the payload", () => {
    const payload = { userRoleId: "role-2" };

    service.update("nb-1", "usr-1", payload).subscribe();

    expect(request.patch).toHaveBeenCalledWith(
      "/api/neighborhoods/nb-1/residents/usr-1",
      payload,
    );
  });
});