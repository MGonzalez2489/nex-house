import { TestBed } from "@angular/core/testing";
import { RequestService } from "@core/services";
import { AuthService } from "./auth-service";
import { ApiResponse } from "@nexhouse/shared-domain/interfaces";
import { RoleModel, SessionModel } from "@nexhouse/shared-domain/models";
import { of, throwError } from "rxjs";

describe("AuthService", () => {
  let service: AuthService;
  let requestServiceMock: jest.Mocked<RequestService>;

  const mockrole: RoleModel = {
    name: "ADMIN",
    displayName: "ADMIN",
  };
  // Dummy mock data for successful assertions
  const mockSession: SessionModel = {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_token",
    exp: 86400,
    user: {
      email: "admin@nexhouse.com",
      role: mockrole,
      firstName: "Alberto",
      lastName: "Dominguez",
      fullName: "",
      phone: "",
      status: {
        name: "active",
        displayName: "active",
      },
    },
    refreshToken: "",
  };

  const mockSuccessResponse: ApiResponse<SessionModel> = {
    message: "Login successful",
    data: mockSession,
  };

  beforeEach(() => {
    // Creating a robust Jasmine/Jest compatible spy object for RequestService
    const spy = { post: jest.fn() } as unknown as jest.Mocked<RequestService>;

    TestBed.configureTestingModule({
      providers: [AuthService, { provide: RequestService, useValue: spy }],
    });

    service = TestBed.inject(AuthService);
    requestServiceMock = TestBed.inject(
      RequestService,
    ) as jest.Mocked<RequestService>;
  });

  it("should be created securely via dependency injection", () => {
    expect(service).toBeDefined();
  });

  describe("login() workflow validations", () => {
    it("should invoke RequestService post with exact credentials and URL parameters", (done) => {
      const credentials = {
        email: "admin@nexhouse.com",
        password: "password123",
      };
      requestServiceMock.post.mockReturnValue(of(mockSuccessResponse));

      service.login(credentials).subscribe({
        next: (response) => {
          expect(requestServiceMock.post).toHaveBeenCalledTimes(1);
          expect(requestServiceMock.post).toHaveBeenCalledWith(
            "/api/auth/login",
            credentials,
          );
          expect(response.data).not.toBeNull();
          expect(response.data.token).toBe(mockSession.token);
          expect(response.data.user.role.name).toBe("ADMIN");
          done();
        },
      });
    });

    it("should forward API exceptions transparently if the auth pipeline fails", (done) => {
      const credentials = {
        email: "bad@nexhouse.com",
        password: "wrongpassword",
      };
      const apiError = {
        status: 401,
        message: "Invalid credentials provided.",
      };

      requestServiceMock.post.mockReturnValue(throwError(() => apiError));

      service.login(credentials).subscribe({
        next: () => {
          fail("Should have failed with invalid credentials exception.");
        },
        error: (err) => {
          expect(requestServiceMock.post).toHaveBeenCalledTimes(1);
          expect(err.status).toBe(401);
          expect(err.message).toBe("Invalid credentials provided.");
          done();
        },
      });
    });
  });

  describe("password recovery endpoints", () => {
    it("should POST the email to pwd-recovery-request", (done) => {
      requestServiceMock.post.mockReturnValue(
        of({ message: "ok", data: { code: "ABC-123456" } }),
      );

      service.recoveryRequest("admin@nexhouse.com").subscribe({
        next: (response) => {
          expect(requestServiceMock.post).toHaveBeenCalledWith(
            "/api/auth/pwd-recovery-request",
            { email: "admin@nexhouse.com" },
          );
          expect(response.data.code).toBe("ABC-123456");
          done();
        },
      });
    });

    it("should POST the code to code-validation", (done) => {
      requestServiceMock.post.mockReturnValue(
        of({ message: "ok", data: { token: "reset-jwt", exp: 12345 } }),
      );

      service.codeValidation("ABC-123456").subscribe({
        next: (response) => {
          expect(requestServiceMock.post).toHaveBeenCalledWith(
            "/api/auth/code-validation",
            { code: "ABC-123456" },
          );
          expect(response.data.token).toBe("reset-jwt");
          done();
        },
      });
    });

    it("should POST the new password to reset-password", (done) => {
      requestServiceMock.post.mockReturnValue(of(mockSuccessResponse));

      service.resetPwd("new-password").subscribe({
        next: (response) => {
          expect(requestServiceMock.post).toHaveBeenCalledWith(
            "/api/auth/reset-password",
            { pwd: "new-password" },
          );
          expect(response.data.token).toBe(mockSession.token);
          done();
        },
      });
    });
  });
});

// describe('AuthService', () => {
//   let service: AuthService;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({});
//     service = TestBed.inject(AuthService);
//   });
//
//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
// });
