import { applicationConfig, type Preview } from '@storybook/angular';
// import Aura from '@primeng/themes/aura';
import { NxPreset } from '../src/app/theme/preset';

import { providePrimeNG } from 'primeng/config';

// En Tailwind 4, solo importamos el punto de entrada principal

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [
        // provideAnimationsAsync(),
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
