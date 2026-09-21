import { TestBed } from "@angular/core/testing";
import { RequestService } from "@core/services";
import { of } from "rxjs";
import { UserService } from "./user-service";

describe("UserService", () => {
  let service: UserService;
  let request: {
    get: jest.Mock;
  };

  beforeEach(() => {
    request = {
      get: jest.fn().mockReturnValue(of({ data: {}, message: "ok" })),
    };

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: RequestService, useValue: request },
      ],
    });

    service = TestBed.inject(UserService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("get delegates to GET /api/user", () => {
    service.get().subscribe();

    expect(request.get).toHaveBeenCalledWith("/api/user");
  });
});