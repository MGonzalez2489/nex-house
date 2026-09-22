import { TestBed } from "@angular/core/testing";
import { RequestService } from "@core/services";
import { ProfileEditPayload } from "@core/models/profile-edit-payload";
import { of } from "rxjs";
import { ProfileService } from "./profile-service";

describe("ProfileService", () => {
  let service: ProfileService;
  let request: {
    get: jest.Mock;
    patch: jest.Mock;
  };

  beforeEach(() => {
    request = {
      get: jest.fn().mockReturnValue(of({ data: {}, message: "ok" })),
      patch: jest.fn().mockReturnValue(of({ data: {}, message: "ok" })),
    };

    TestBed.configureTestingModule({
      providers: [
        ProfileService,
        { provide: RequestService, useValue: request },
      ],
    });

    service = TestBed.inject(ProfileService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("get delegates to GET /api/user/profile", () => {
    service.get().subscribe();

    expect(request.get).toHaveBeenCalledWith("/api/user/profile");
  });

  it("update delegates to PATCH /api/user/profile with the multipart payload", () => {
    const dto: ProfileEditPayload = { firstName: "Juan" };

    service.update(dto).subscribe();

    expect(request.patch).toHaveBeenCalledTimes(1);
    const [url, payload] = request.patch.mock.calls[0];
    expect(url).toBe("/api/user/profile");
    expect(payload).toBeInstanceOf(FormData);
    expect((payload as FormData).get("firstName")).toBe("Juan");
  });
});