import { SessionModel } from "@nexhouse/shared-domain/models";
import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AuthService } from "../services/auth-service";
import { AuthStore } from "./auth.store";
import { APP_CONSTANTS } from "@core/constants";

describe("AuthStore", () => {
  let authServiceMock: jest.Mocked<AuthService>;

  const mockSession: SessionModel = {
    token: "jwt-access-token-987",
    exp: Date.now() + 3_600_000,
    refreshToken: "refresh-token",
    user: {
      email: "resident@nexhouse.com",
      firstName: "Alejandro",
      lastName: "Ríos",
    } as SessionModel["user"],
  };

  beforeEach(() => {
    localStorage.clear();

    const authSpy = {
      login: jest.fn(),
      logout: jest.fn(),
      recoveryRequest: jest.fn(),
      codeValidation: jest.fn(),
      resetPwd: jest.fn(),
      refreshSession: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    TestBed.configureTestingModule({
      providers: [AuthStore, { provide: AuthService, useValue: authSpy }],
    });

    authServiceMock = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Initialization", () => {
    it("should initialize with anonymous state values when localStorage is empty", () => {
      const store = TestBed.inject(AuthStore);

      expect(store.token()).toBeNull();
      expect(store.exp()).toBe(0);
      expect(store.recoveryCode()).toBeUndefined();
      expect(store.resetPwdToken()).toBeNull();
      expect(store.isAuthenticated()).toBe(false);
    });
  });

  describe("loadSession", () => {
    it("should map session data to state and persist the token in localStorage", () => {
      const setItemSpy = jest.spyOn(Storage.prototype, "setItem");
      const store = TestBed.inject(AuthStore);

      store.loadSession(mockSession);

      expect(store.token()).toBe(mockSession.token);
      expect(store.exp()).toBe(mockSession.exp);
      expect(store.isAuthenticated()).toBe(true);
      expect(setItemSpy).toHaveBeenCalledWith(
        APP_CONSTANTS.TOKEN_STORAGE_KEY,
        mockSession.token,
      );
      expect(setItemSpy).toHaveBeenCalledWith(
        APP_CONSTANTS.TOKEN_EXP,
        mockSession.exp.toString(),
      );

      setItemSpy.mockRestore();
    });
  });

  describe("session expiry", () => {
    it("keeps the user authenticated while the session has not expired", () => {
      const store = TestBed.inject(AuthStore);

      store.loadSession({token: "fresh-token", exp: Date.now() + 60_000});

      expect(store.isSessionExpired()).toBe(false);
      expect(store.isAuthenticated()).toBe(true);
    });

    it("marks the session as expired and unauthenticated once exp is in the past", () => {
      const store = TestBed.inject(AuthStore);

      store.loadSession({token: "stale-token", exp: Date.now() - 1_000});

      expect(store.isSessionExpired()).toBe(true);
      expect(store.isAuthenticated()).toBe(false);
    });
  });

  describe("clearSession", () => {
    it("removes only the session keys and leaves unrelated localStorage entries intact", () => {
      localStorage.setItem(APP_CONSTANTS.TOKEN_STORAGE_KEY, "jwt-access-token");
      localStorage.setItem(APP_CONSTANTS.TOKEN_EXP, "123");
      localStorage.setItem(APP_CONSTANTS.TOKEN_RESET_PWD, "reset-jwt");
      localStorage.setItem("unrelated-key", "keep-me");
      const store = TestBed.inject(AuthStore);

      store.clearSession();

      expect(localStorage.getItem(APP_CONSTANTS.TOKEN_STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem(APP_CONSTANTS.TOKEN_EXP)).toBeNull();
      expect(localStorage.getItem(APP_CONSTANTS.TOKEN_RESET_PWD)).toBeNull();
      expect(localStorage.getItem("unrelated-key")).toBe("keep-me");
      expect(store.token()).toBeNull();
      expect(store.exp()).toBe(0);
      expect(store.resetPwdToken()).toBeNull();
      expect(store.isAuthenticated()).toBe(false);
    });
  });

  describe("logout", () => {
    it("calls the API and clears the local session, returning true", async () => {
      authServiceMock.logout.mockReturnValue(
        of({ message: "Logged out successfully", data: { message: "ok" } }),
      );
      const store = TestBed.inject(AuthStore);
      store.loadSession(mockSession);

      const result = await store.logout();

      expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
      expect(store.token()).toBeNull();
      expect(localStorage.getItem(APP_CONSTANTS.TOKEN_STORAGE_KEY)).toBeNull();
    });

    it("clears the local session and returns false when the API call fails", async () => {
      authServiceMock.logout.mockReturnValue(
        throwError(() => new Error("Network down")),
      );
      const store = TestBed.inject(AuthStore);
      store.loadSession(mockSession);

      const result = await store.logout();

      expect(result).toBe(false);
      expect(store.token()).toBeNull();
      expect(localStorage.getItem(APP_CONSTANTS.TOKEN_STORAGE_KEY)).toBeNull();
    });
  });

  describe("login", () => {
    it("should load the session and return true on success", async () => {
      authServiceMock.login.mockReturnValue(
        of({ success: true, data: mockSession, message: "Success" }),
      );
      const store = TestBed.inject(AuthStore);

      const result = await store.login({
        email: "resident@nexhouse.com",
        password: "password123",
      });

      expect(result).toBe(true);
      expect(store.token()).toBe(mockSession.token);
      expect(store.loading()).toBe(false);
    });

    it("should set the error state and return false on failure", async () => {
      authServiceMock.login.mockReturnValue(
        throwError(() => new Error("Invalid Credentials")),
      );
      const store = TestBed.inject(AuthStore);

      const result = await store.login({
        email: "wrong@nexhouse.com",
        password: "bad",
      });

      expect(result).toBe(false);
      expect(store.token()).toBeNull();
      expect(store.error()).toEqual("Invalid Credentials");
    });
  });

  describe("pwdRecoveryRequest", () => {
    it("should store the returned recovery code and return true", async () => {
      authServiceMock.recoveryRequest.mockReturnValue(
        of({ message: "ok", data: { code: "ABC-123456" } }),
      );
      const store = TestBed.inject(AuthStore);

      const result = await store.pwdRecoveryRequest("resident@nexhouse.com");

      expect(result).toBe(true);
      expect(store.recoveryCode()).toBe("ABC-123456");
    });

    it("should set the error state and return false on failure", async () => {
      authServiceMock.recoveryRequest.mockReturnValue(
        throwError(() => new Error("Something went wrong")),
      );
      const store = TestBed.inject(AuthStore);

      const result = await store.pwdRecoveryRequest("resident@nexhouse.com");

      expect(result).toBe(false);
      expect(store.error()).toEqual("Something went wrong");
    });
  });

  describe("codeValidation", () => {
    it("should persist the reset token in state and localStorage, returning true", async () => {
      authServiceMock.codeValidation.mockReturnValue(
        of({ message: "ok", data: { token: "reset-jwt", exp: 12345 } }),
      );
      const store = TestBed.inject(AuthStore);

      const result = await store.codeValidation("ABC-123456");

      expect(result).toBe(true);
      expect(store.resetPwdToken()).toBe("reset-jwt");
      expect(localStorage.getItem(APP_CONSTANTS.TOKEN_RESET_PWD)).toBe(
        "reset-jwt",
      );
    });

    it("should set the error state and return false on failure", async () => {
      authServiceMock.codeValidation.mockReturnValue(
        throwError(() => new Error("Invalid code")),
      );
      const store = TestBed.inject(AuthStore);

      const result = await store.codeValidation("ABC-000000");

      expect(result).toBe(false);
      expect(store.resetPwdToken()).toBeNull();
    });
  });

  describe("resetPwd", () => {
    it("should clear the reset token, load the session and return true on success", async () => {
      localStorage.setItem(APP_CONSTANTS.TOKEN_RESET_PWD, "stale-reset-jwt");
      authServiceMock.resetPwd.mockReturnValue(
        of({ success: true, data: mockSession, message: "Success" }),
      );
      const store = TestBed.inject(AuthStore);

      const result = await store.resetPwd("new-password");

      expect(result).toBe(true);
      expect(store.token()).toBe(mockSession.token);
      expect(store.resetPwdToken()).toBeNull();
      expect(store.recoveryCode()).toBeUndefined();
      expect(localStorage.getItem(APP_CONSTANTS.TOKEN_RESET_PWD)).toBeNull();
    });

    it("should set the error state and keep the reset token on failure", async () => {
      localStorage.setItem(APP_CONSTANTS.TOKEN_RESET_PWD, "stale-reset-jwt");
      authServiceMock.resetPwd.mockReturnValue(
        throwError(() => new Error("Reset failed")),
      );
      const store = TestBed.inject(AuthStore);

      const result = await store.resetPwd("new-password");

      expect(result).toBe(false);
      expect(store.error()).toEqual("Reset failed");
      expect(localStorage.getItem(APP_CONSTANTS.TOKEN_RESET_PWD)).toBe(
        "stale-reset-jwt",
      );
    });
  });
});