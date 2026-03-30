import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { authInterceptor } from '@core/interceptors';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { NxPreset } from './theme/preset';

const globalService = [DialogService, MessageService];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    ...globalService,
    providePrimeNG({
      theme: {
        preset: NxPreset,
        options: {
          darkModeSelector: 'none',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
  ],
};
