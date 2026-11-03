/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Sporty color namespaces — map to CSS custom properties */
        "court-green": {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          950: "var(--color-primary-950)",
        },
        "ball-yellow": {
          50: "var(--color-accent-50)",
          100: "var(--color-accent-100)",
          200: "var(--color-accent-200)",
          300: "var(--color-accent-300)",
          400: "var(--color-accent-400)",
          500: "var(--color-accent-500)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
          800: "var(--color-accent-800)",
          900: "var(--color-accent-900)",
          950: "var(--color-accent-950)",
        },
        "sky-blue": {
          50: "var(--color-sky-50)",
          100: "var(--color-sky-100)",
          200: "var(--color-sky-200)",
          300: "var(--color-sky-300)",
          400: "var(--color-sky-400)",
          500: "var(--color-sky-500)",
          600: "var(--color-sky-600)",
          700: "var(--color-sky-700)",
          800: "var(--color-sky-800)",
          900: "var(--color-sky-900)",
          950: "var(--color-sky-950)",
        },

        /* Semantic color aliases — map to CSS custom properties */
        surface: "var(--color-surface)",
        "surface-elevated": "var(--color-surface-elevated)",
        "surface-sunken": "var(--color-surface-sunken)",
        "surface-inverse": "var(--color-surface-inverse)",
        "surface-card": "var(--color-surface-card)",
        "surface-card-hover": "var(--color-surface-card-hover)",

        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        "border-focus": "var(--color-border-focus)",
        "border-error": "var(--color-border-error)",
        "border-success": "var(--color-border-success)",

        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
          link: "var(--color-text-link)",
          "link-hover": "var(--color-text-link-hover)",
          "on-primary": "var(--color-text-on-primary)",
          "on-accent": "var(--color-text-on-accent)",
          "on-sky": "var(--color-text-on-sky)",
        },

        interactive: {
          bg: "var(--color-interactive-bg)",
          "bg-hover": "var(--color-interactive-bg-hover)",
          "bg-active": "var(--color-interactive-bg-active)",
          text: "var(--color-interactive-text)",

          "accent-bg": "var(--color-interactive-accent-bg)",
          "accent-bg-hover": "var(--color-interactive-accent-bg-hover)",
          "accent-bg-active": "var(--color-interactive-accent-bg-active)",
          "accent-text": "var(--color-interactive-accent-text)",

          "sky-bg": "var(--color-interactive-sky-bg)",
          "sky-bg-hover": "var(--color-interactive-sky-bg-hover)",
          "sky-bg-active": "var(--color-interactive-sky-bg-active)",
          "sky-text": "var(--color-interactive-sky-text)",
        },

        status: {
          pending: {
            bg: "var(--color-status-pending-bg)",
            text: "var(--color-status-pending-text)",
          },
          waiting: {
            bg: "var(--color-status-waiting-bg)",
            text: "var(--color-status-waiting-text)",
          },
          called: {
            bg: "var(--color-status-called-bg)",
            text: "var(--color-status-called-text)",
          },
          playing: {
            bg: "var(--color-status-playing-bg)",
            text: "var(--color-status-playing-text)",
          },
          completed: {
            bg: "var(--color-status-completed-bg)",
            text: "var(--color-status-completed-text)",
          },
          cancelled: {
            bg: "var(--color-status-cancelled-bg)",
            text: "var(--color-status-cancelled-text)",
          },
          available: {
            bg: "var(--color-status-available-bg)",
            text: "var(--color-status-available-text)",
          },
          maintenance: {
            bg: "var(--color-status-maintenance-bg)",
            text: "var(--color-status-maintenance-text)",
          },
        },
      },

      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },

      fontSize: {
        display: ["var(--text-display)", { lineHeight: "var(--text-display--line-height)", fontWeight: "var(--text-display--font-weight)" }],
        h1: ["var(--text-h1)", { lineHeight: "var(--text-h1--line-height)", fontWeight: "var(--text-h1--font-weight)" }],
        h2: ["var(--text-h2)", { lineHeight: "var(--text-h2--line-height)", fontWeight: "var(--text-h2--font-weight)" }],
        h3: ["var(--text-h3)", { lineHeight: "var(--text-h3--line-height)", fontWeight: "var(--text-h3--font-weight)" }],
        body: ["var(--text-body)", { lineHeight: "var(--text-body--line-height)", fontWeight: "var(--text-body--font-weight)" }],
        small: ["var(--text-small)", { lineHeight: "var(--text-small--line-height)", fontWeight: "var(--text-small--font-weight)" }],
        tiny: ["var(--text-tiny)", { lineHeight: "var(--text-tiny--line-height)", fontWeight: "var(--text-tiny--font-weight)" }],
        mono: ["var(--text-mono)", { lineHeight: "var(--text-mono--line-height)", fontWeight: "var(--text-mono--font-weight)" }],
      },

      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
      },

      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },

      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },

      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
        spring: "300ms",
      },

      transitionTimingFunction: {
        default: "ease",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        fixed: "var(--z-fixed)",
        "modal-backdrop": "var(--z-modal-backdrop)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        tooltip: "var(--z-tooltip)",
        toast: "var(--z-toast)",
      },

      backgroundImage: {
        "mesh-light": "var(--bg-mesh-light)",
        "mesh-dark": "var(--bg-mesh-dark)",
        "grid-light": "var(--bg-grid-light)",
        "grid-dark": "var(--bg-grid-dark)",
      },
    },
  },
  plugins: [],
}