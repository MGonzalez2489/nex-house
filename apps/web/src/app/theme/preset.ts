import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
export const NxPreset = definePreset(Aura, {
  components: {
    inputtext: {
      root: {},
      colorScheme: {
        light: {
          root: {
            // bg-slate-50
            background: "{slate.50}",
            // text-slate-800
            color: "{slate.800}",
            // border (color por defecto)
            borderColor: "{slate.200}",
            // placeholder:text-slate-400
            placeholderColor: "{slate.400}",
            // focus:border-cyan-500
          },
        },
        dark: {
          root: {
            // dark:bg-slate-800
            background: "{slate.800}",
            // dark:text-slate-200
            color: "{slate.200}",
            // border (color en dark)
            borderColor: "{slate.700}",
            // placeholder:text-slate-400 (ajustar si es diferente en dark)
            placeholderColor: "{slate.500}",
            // focus:border-cyan-500
            focusBorderColor: "{cyan.500}",
            // focus:ring
            focusRing: {
              width: "2px",
              color: "{cyan.500}",
              offset: "2px",
              style: "solid",
            },
          },
        },
      },
    },
    panel: {
      colorScheme: {
        light: {
          header: {
            color: "{text-slate-800}",
          },
        },
        dark: {
          header: {
            color: "{text-white}",
          },
        },
      },
    },
    datatable: {
      root: {
        // fontSize: '0.875rem', // text-sm
        // borderWidth: '0', // El borde se maneja en celdas/header
        borderColor: "{slate.800}", // border-slate-100 (base)
        transitionDuration: "{transition.duration.normal}",
      },

      header: {
        background: "#fff", // Sin fondo extra
        borderColor: "{slate.100}", // border-b
        borderWidth: "0 0 1px 0", // Solo borde inferior
        padding: "0", // El padding va en las celdas
        color: "{slate.400}", // text-slate-400
      },
      headerCell: {
        background: "#fff", // Sin fondo extra
        borderColor: "{slate.100}", // border-b heredado o explícito
        color: "{slate.400}", // text-slate-400
        padding: "0.50rem 1.25rem", // py-3 px-5 (ajustado: 12px/20px)

        hoverBackground: "transparent", // Sin hover en header por defecto en tu ejemplo
        focusRing: {
          width: "0",
          style: "none",
          color: "transparent",
          offset: "0",
        },
      },
      columnTitle: {
        fontWeight: "500",
      },

      bodyCell: {
        borderColor: "{slate.100}",
        padding: "0.875rem 1.25rem", // py-3.5 px-5 (14px/20px)
      },
      colorScheme: {
        light: {
          row: {
            background: "#fff", // Sin fondo extra
            color: "{slate.500}", // text-slate-500 (default para celdas)
            hoverBackground: "{slate.800}", // hover:bg-slate-50
            hoverColor: "{slate.800}", // Opcional: oscurecer texto al hover
          },
        },
        dark: {
          root: {
            borderColor: "{slate.800}",
          },
          header: {
            background: "{slate.800}",
            borderColor: "{slate.800}",
            color: "{slate.400}",
          },
          headerCell: {
            background: "{slate.900}",
            borderColor: "{slate.800}",
            color: "{slate.400}",
          },
          row: {
            background: "{slate.900}",
            // hoverBackground: "{slate.800}/50", // dark:hover:bg-slate-800/50
            // borderColor: '{slate.800}', // divide-slate-800
            color: "{slate.400}",
          },
          bodyCell: {
            borderColor: "{slate.800}",
            // color: '{slate.200}' // Ajuste para texto principal en dark
          },
        },
      },
    },
  },
  semantic: {
    colorScheme: {
      // light: {
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
      // },
      dark: {
        surface: {
          0: "#ffffff",
          50: "{slate.50}",
          100: "{slate.100}",
          200: "{slate.200}",
          300: "{slate.300}",
          400: "{slate.400}",
          500: "{slate.500}",
          600: "{slate.600}",
          700: "{slate.700}",
          800: "{slate.800}",
          900: "{slate.900}",
          950: "{slate.950}",
        },
      },
    },
  },
});
