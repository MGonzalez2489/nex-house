import {definePreset} from '@openng/optimus-ui-themes';
import Aura from '@openng/optimus-ui-themes/aura';

export const NxPreset = definePreset(Aura, {
  components: {
    select: {
      colorScheme: {
        light: {
          root: {
            // bg-slate-50
            background: '{slate.50}',
            // text-slate-800
            color: '{slate.800}',
            // border (default color)
            borderColor: '{slate.200}',
            // placeholder:text-slate-400
            placeholderColor: '{slate.400}',
            // focus:border-cyan-500
          },
        },
        dark: {
          root: {
            // dark:bg-slate-800
            background: '{slate.800}',
            // dark:text-slate-200
            color: '{slate.200}',
            // border (color in dark)
            borderColor: '{slate.700}',
            // placeholder:text-slate-400 (adjust if different in dark)
            placeholderColor: '{slate.500}',
            // focus:border-cyan-500
            focusBorderColor: '{cyan.500}',
            // focus:ring
            focusRing: {
              width: '2px',
              color: '{cyan.500}',
              offset: '2px',
              style: 'solid',
            },
          },
        },
      },
    },
    inputtext: {
      root: {},
      colorScheme: {
        light: {
          root: {
            // bg-slate-50
            background: '{slate.50}',
            // text-slate-800
            color: '{slate.800}',
            // border (default color)
            borderColor: '{slate.200}',
            // placeholder:text-slate-400
            placeholderColor: '{slate.400}',
            // focus:border-cyan-500
          },
        },
        dark: {
          root: {
            // dark:bg-slate-800
            background: '{slate.800}',
            // dark:text-slate-200
            color: '{slate.200}',
            // border (color in dark)
            borderColor: '{slate.700}',
            // placeholder:text-slate-400 (adjust if different in dark)
            placeholderColor: '{slate.500}',
            // focus:border-cyan-500
            focusBorderColor: '{cyan.500}',
            // focus:ring
            focusRing: {
              width: '2px',
              color: '{cyan.500}',
              offset: '2px',
              style: 'solid',
            },
          },
        },
      },
    },
    panel: {
      colorScheme: {
        light: {
          header: {
            color: '{slate.500}',
          },
          title: {
            fontWeight: '3px',
          },
        },
        dark: {
          header: {
            color: '{text-white}',
          },
        },
      },
    },
  },
  semantic: {
    primary: {
      50: '{cyan.50}',
      100: '{cyan.100}',
      200: '{cyan.200}',
      300: '{cyan.300}',
      400: '{cyan.400}',
      500: '{cyan.600}',
      600: '{cyan.700}',
      700: '{cyan.800}',
      800: '{cyan.800}',
      900: '{cyan.900}',
    },
    colorScheme: {
      light: {
        //   surface: {
        //     0: "#ffffff",
        //     50: "{zinc.50}",
        //     100: "{zinc.100}",
        //     200: "{zinc.200}",
        //     300: "{zinc.300}",
        //     400: "{zinc.400}",
        //     500: "{zinc.500}",
        //     600: "{zinc.600}",
        //     700: "{zinc.700}",
        //     800: "{zinc.800}",
        //     900: "{zinc.900}",
        //     950: "{zinc.950}",
        //   },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
    },
  },
});
