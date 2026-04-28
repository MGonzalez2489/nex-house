import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { applicationConfig, type Preview } from '@storybook/angular';
import { NxPreset } from '../src/app/theme/preset';

import { providePrimeNG } from 'primeng/config';

import { setCompodocJson } from '@storybook/addon-docs/angular';

import docJson from './../documentation.json';

setCompodocJson(docJson);

import '!style-loader!css-loader!postcss-loader!../src/styles.css';

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
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
    }),
  ],
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
