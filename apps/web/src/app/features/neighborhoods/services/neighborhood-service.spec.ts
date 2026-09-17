import { TestBed } from "@angular/core/testing";
import { RequestService } from "@core/services";
import { of } from "rxjs";
import { NeighborhoodService } from "./neighborhood-service";

describe("NeighborhoodService", () => {
  let service: NeighborhoodService;
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
        NeighborhoodService,
        { provide: RequestService, useValue: request },
      ],
    });

    service = TestBed.inject(NeighborhoodService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("getAll delegates to GET /api/neighborhood with the search criteria", () => {
    const criteria = { first: 0, rows: 10 };

    service.getAll(criteria).subscribe();

    expect(request.get).toHaveBeenCalledWith("/api/neighborhood", criteria);
  });

  it("getMine delegates to GET /api/neighborhood/mine", () => {
    service.getMine().subscribe();

    expect(request.get).toHaveBeenCalledWith("/api/neighborhood/mine");
  });

  it("getById delegates to GET /api/neighborhood/:id", () => {
    service.getById("abc-123").subscribe();

    expect(request.get).toHaveBeenCalledWith("/api/neighborhood/abc-123");
  });

  it("create delegates to POST /api/neighborhood with the payload", () => {
    const payload = { name: "Centro", isActive: true };

    service.create(payload).subscribe();

    expect(request.post).toHaveBeenCalledWith("/api/neighborhood", payload);
  });

  it("update delegates to PATCH /api/neighborhood/:id with the payload", () => {
    const payload = { name: "Centro Norte" };

    service.update("abc-123", payload).subscribe();

    expect(request.patch).toHaveBeenCalledWith(
      "/api/neighborhood/abc-123",
      payload,
    );
  });

  it("getStreets delegates to GET /api/neighborhood/streets with default pagination", () => {
    service.getStreets().subscribe();

    expect(request.get).toHaveBeenCalledWith("/api/neighborhood/streets", {
      rows: 10,
      showAll: true,
      first: 0,
    });
  });

  it("getStreets uses the supplied search criteria when provided", () => {
    const criteria = { rows: 25, showAll: false };

    service.getStreets(criteria).subscribe();

    expect(request.get).toHaveBeenCalledWith(
      "/api/neighborhood/streets",
      criteria,
    );
  });
});