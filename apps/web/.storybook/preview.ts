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
    layout: 'fullscreen',
    // layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        xs: {
          name: 'Tailwind xs (default)',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        sm: {
          name: 'Tailwind sm',
          styles: {
            width: '640px',
            height: '800px',
          },
        },
        md: {
          name: 'Tailwind md',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        lg: {
          name: 'Tailwind lg',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
        xl: {
          name: 'Tailwind xl',
          styles: {
            width: '1280px',
            height: '800px',
          },
        },
        '2xl': {
          name: 'Tailwind 2xl',
          styles: {
            width: '1536px',
            height: '1000px',
          },
        },
      },
      // Puedes definir un viewport por defecto si lo deseas
      defaultViewport: 'responsive',
    },
  },
};

export default preview;
