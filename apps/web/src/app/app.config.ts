import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { appRoutes } from "./app.routes";
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from "@angular/common/http";
import { NxPreset } from "./theme/preset";
import { provideOptimus } from "@openng/optimus-ui/config";
import { StartupStore } from "@stores/startup.store";
import {
  authInterceptor,
  ErrorInterceptor,
  idempotencyInterceptor,
} from "@core/interceptors";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        ErrorInterceptor,
        idempotencyInterceptor,
      ]),
    ),
    provideAppInitializer(() => {
      const startupStore = inject(StartupStore);
      return startupStore.initializeApp();
    }),
    provideOptimus({
      inputVariant: "filled",
      theme: {
        preset: NxPreset,
        options: {
          darkModeSelector: ".dark",
          cssLayer: {
            name: "optimus",
            order: "theme, base, optimus",
          },
        },
      },
    }),
  ],
};
