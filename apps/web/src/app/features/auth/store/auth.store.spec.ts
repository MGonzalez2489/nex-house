import { UserModel, SessionModel } from "@nexhouse/shared-domain/models";
import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { AuthService } from "../services/auth-service";
import { AuthStore } from "./auth.store";
import { APP_CONSTANTS } from "@core/constants";

describe("AuthStore (Zoneless Edition)", () => {
  let authServiceMock: jest.Mocked<AuthService>;

  const mockUser: UserModel = {
    email: "resident@nexhouse.com",
    firstName: "Alejandro",
    lastName: "Ríos",
  } as UserModel;

  const mockSession: SessionModel = {
    token: "jwt-access-token-987",
    exp: 1718820000,
    user: mockUser,
    refreshToken: "",
  };

  beforeEach(() => {
    // Clean storage values before starting each test execution context
    localStorage.clear();

    const authSpy = {
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    TestBed.configureTestingModule({
      providers: [AuthStore, { provide: AuthService, useValue: authSpy }],
    });

    // We only inject the service mock, allowing each test to instantiate the store on demand
    authServiceMock = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Initialization and Storage Checks", () => {
    it("should initialize with anonymous state values when localStorage is empty", () => {
      // Lazy instantiation: trigger store creation while localStorage is empty
      const store = TestBed.inject(AuthStore);

      expect(store.user()).toBeUndefined();
      expect(store.token()).toBeNull();
      expect(store.recoveryToken()).toBeUndefined();
      expect(store.exp()).toBe(0);
      expect(store.isAuthenticated()).toBe(false);
    });
  });

  describe("loadSession Method", () => {
    it("should map session data to state, store references in local storage, and update loading state to loaded", () => {
      // Spy on the prototype of Storage to safely intercept localStorage calls in JSDOM
      const setItemSpy = jest.spyOn(Storage.prototype, "setItem");
      const store = TestBed.inject(AuthStore);

      store.loadSession(mockSession);

      // Verify state properties update
      expect(store.token()).toBe(mockSession.token);
      expect(store.user()).toEqual(mockSession.user);
      expect(store.exp()).toBe(mockSession.exp);

      // Verify computed properties evaluate instantly
      expect(store.isAuthenticated()).toBe(true);

      // Verify callState updates to loaded (from @angular-architects/ngrx-toolkit)
      expect(store.loaded()).toBe(true);
      expect(store.loading()).toBe(false);

      // Verify side-effects in localStorage
      expect(setItemSpy).toHaveBeenCalledWith(
        APP_CONSTANTS.TOKEN_STORAGE_KEY,
        mockSession.token,
      );
      expect(setItemSpy).toHaveBeenCalledWith(
        APP_CONSTANTS.TOKEN_EXP,
        mockSession.exp.toString(),
      );

      // Clean up the spy to avoid affecting other tests
      setItemSpy.mockRestore();
    });
  });

  describe("login Method Workflows (Zoneless)", () => {
    it("should set loading flag synchronously, await API, and resolve to true upon successful authorization", async () => {
      authServiceMock.login.mockReturnValue(
        of({ success: true, data: mockSession, message: "Success" }),
      );
      const store = TestBed.inject(AuthStore);

      // Trigger the login promise
      const loginPromise = store.login({
        email: "resident@nexhouse.com",
        password: "password123",
      });

      // Synchronous Verification: Before resolving, the store must IMMEDIATELY enter the loading state
      expect(store.loading()).toBe(true);

      // Await promise resolution natively (without fakeAsync/tick)
      const loginResult = await loginPromise;

      // Post-resolution checks
      expect(loginResult).toBe(true);
      expect(store.token()).toBe(mockSession.token);
      expect(store.user()).toEqual(mockSession.user);
      expect(store.loading()).toBe(false);
      expect(store.loaded()).toBe(true);
      expect(store.isAuthenticated()).toBe(true);
    });

    it("should catch exceptions synchronously, update callState to error and return false upon failure response", async () => {
      const apiError = new Error("Invalid Credentials");
      authServiceMock.login.mockReturnValue(throwError(() => apiError));
      const store = TestBed.inject(AuthStore);

      // Trigger the login promise
      const loginPromise = store.login({
        email: "wrong@nexhouse.com",
        password: "bad",
      });

      // Synchronous Verification: Check transition to loading state
      expect(store.loading()).toBe(true);

      // Await promise rejection handling
      const loginResult = await loginPromise;

      expect(loginResult).toBe(false);
      expect(store.user()).toBeUndefined();
      expect(store.token()).toBeNull();

      // Verify callState handles the error (from @angular-architects/ngrx-toolkit)
      expect(store.loading()).toBe(false);
      expect(store.error()).toEqual("Invalid Credentials");
    });
  });
});
