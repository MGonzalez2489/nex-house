import { TestBed } from "@angular/core/testing";
import { CanActivateFn, provideRouter, UrlTree } from "@angular/router";
import { UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { UserStore } from "@user/user.store";

import { onboardingRequiredGuard } from "./onboarding-required-guard";

describe("onboardingRequiredGuard", () => {
  let status: jest.Mock;

  const runGuard = (url: string) =>
    TestBed.runInInjectionContext(() =>
      onboardingRequiredGuard(
        {} as Parameters<CanActivateFn>[0],
        { url } as Parameters<CanActivateFn>[1],
      ),
    );

  beforeEach(() => {
    status = jest.fn().mockReturnValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: { status } },
      ],
    });
  });

  it("should be created", () => {
    expect(onboardingRequiredGuard).toBeTruthy();
  });

  it("allows navigation when the profile has not been loaded yet", () => {
    status.mockReturnValue(undefined);

    expect(runGuard("/dashboard")).toBe(true);
  });

  it("allows ACTIVE users into the dashboard", () => {
    status.mockReturnValue({ name: UserStatusEnum.ACTIVE });

    expect(runGuard("/dashboard")).toBe(true);
  });

  it("allows PENDING_ONBOARDING users into the onboarding flow", () => {
    status.mockReturnValue({ name: UserStatusEnum.PENDING_ONBOARDING });

    expect(runGuard("/onboarding")).toBe(true);
  });

  it("redirects PENDING_ONBOARDING users away from the dashboard", () => {
    status.mockReturnValue({ name: UserStatusEnum.PENDING_ONBOARDING });

    const result = runGuard("/dashboard");

    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe("/onboarding");
  });

  it("redirects ACTIVE users away from the onboarding flow", () => {
    status.mockReturnValue({ name: UserStatusEnum.ACTIVE });

    const result = runGuard("/onboarding");

    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe("/dashboard");
  });
});