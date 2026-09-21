import { definePreset } from "@openng/optimus-ui-themes";
import Aura from "@openng/optimus-ui-themes/aura";

export const NxPreset = definePreset(Aura, {
  components: {
    select: {
      colorScheme: {
        light: {
          root: {
            // bg-slate-50
            background: "{slate.50}",
            // text-slate-800
            color: "{slate.800}",
            // border (default color)
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
            // border (color in dark)
            borderColor: "{slate.700}",
            // placeholder:text-slate-400 (adjust if different in dark)
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
    inputtext: {
      root: {},
      colorScheme: {
        light: {
          root: {
            // bg-slate-50
            background: "{slate.50}",
            // text-slate-800
            color: "{slate.800}",
            // border (default color)
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
            // border (color in dark)
            borderColor: "{slate.700}",
            // placeholder:text-slate-400 (adjust if different in dark)
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
            color: "{slate.500}",
          },
          title: {
            fontWeight: "3px",
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
        // borderWidth: '0', // Border is handled in cells/header
        borderColor: "{slate.800}", // border-slate-100 (base)
        transitionDuration: "{transition.duration.normal}",
      },

      header: {
        background: "#fff", // No extra background
        borderColor: "{slate.100}", // border-b
        borderWidth: "0 0 1px 0", // Bottom border only
        padding: "0", // Padding is applied at the cells
        color: "{slate.400}", // text-slate-400
      },
      headerCell: {
        background: "#fff", // No extra background
        borderColor: "{slate.100}", // border-b inherited or explicit
        color: "{slate.400}", // text-slate-400
        padding: "0.50rem 1.25rem", // py-3 px-5 (adjusted: 12px/20px)

        hoverBackground: "transparent", // No header hover by default in your example
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
            background: "#fff", // No extra background
            color: "{slate.500}", // text-slate-500 (default for cells)
            hoverBackground: "{slate.800}", // hover:bg-slate-50
            hoverColor: "{slate.800}", // Optional: darken text on hover
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
    primary: {
      50: "{cyan.50}",
      100: "{cyan.100}",
      200: "{cyan.200}",
      300: "{cyan.300}",
      400: "{cyan.400}",
      500: "{cyan.600}",
      600: "{cyan.700}",
      700: "{cyan.800}",
      800: "{cyan.800}",
      900: "{cyan.900}",
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
