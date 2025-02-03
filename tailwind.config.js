//--------------------------------------------------------------------------
// Tailwind configuration
//--------------------------------------------------------------------------
//
// Use the Tailwind configuration to completely define the current sites
// design system by adding and extending to Tailwinds default utility
// classes. Various aspects of the config are split inmultiple files.
//

import {FontSizes, font, rem} from './tailwind-plugins/font.plugin.mjs';
import {NoJs} from './tailwind-plugins/no-js.plugin.mjs';

/** @type {import('tailwindcss').Config} */
export default {
  // Configure files to scan for utility classes (JIT).
  content: ['./app/**/*.jsx', './app/**/*.js', './app/**/*.scss'],
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms')({strategy: 'class'}),
    FontSizes,
    NoJs,
    require('tailwindcss/plugin')(function ({addVariant}) {
      addVariant('active', ['.active &', '&.active']);
      addVariant('alt', ['.alt &', '&.alt']); // for alternate styling
      addVariant('error', ['.error &', '&.error']); // form error styling
      addVariant('open', ['.open &', '&.open']);
      addVariant('scrolled', ['html.scrolled &']);
    }),
  ],

  theme: {
    colors: {
      current: 'currentColor',
      transparent: 'transparent',
      red: '#B51518',
      green: '#1DB954',
      black: {
        DEFAULT: '#000',
        true: '#000000',
      },
      grey: {
        DEFAULT: '#646464',
        dark: '#8A8A8A',
        light: '#F4F4F4',
      },
      white: '#ffffff',
      theme: {
        DEFAULT: 'var(--theme-color)',
        text: 'var(--theme-text-color)',
        accent: 'var(--theme-accent-color)',
      },
    },
    fontFamily: {
      impact: ['Impact', 'sans-serif'],
      courier: ['Courier', 'monospace'],
    },
    fontSize: {
      body: {
        base: font(16, {
          lineHeight: 21,
          letterSpacing: 0.2,
        }),
        screens: {
          lg: font(18, {
            lineHeight: 24,
            letterSpacing: 0.2,
          }),
        },
      },
      h1: {
        base: font(30, {
          lineHeight: 36,
          letterSpacing: 0,
          fontFamily: 'Impact',
          textTransform: 'uppercase',
        }),
        screens: {
          lg: font(100, {
            lineHeight: 120,
            letterSpacing: 0,
          }),
        },
      },
      h2: {
        base: font(20, {
          lineHeight: 24,
          letterSpacing: 0,
          fontFamily: 'Impact',
        }),
        screens: {
          lg: font(50, {
            lineHeight: 56,
            letterSpacing: 0,
          }),
        },
      },
      h3: {
        base: font(24, {
          lineHeight: 28,
          letterSpacing: -0.2,
          fontFamily: 'Impact',
        }),
        screens: {
          lg: font(30, {
            lineHeight: 36,
            letterSpacing: -1,
          }),
        },
      },
      h4: {
        base: font(20, {
          lineHeight: 24,
          letterSpacing: 0,
          fontFamily: 'Impact',
        }),
      },
      h5: {
        base: font(20, {
          lineHeight: 24,
          letterSpacing: 0,
          fontFamily: 'Impact',
        }),
      },
      button: {
        base: font(16, {
          lineHeight: 16,
          letterSpacing: 0,
          textTransform: 'uppercase',
          fontFamily: 'Impact',
        }),
      },
      nav: {
        base: font(36, {
          lineHeight: 36,
          letterSpacing: 0,
          fontFamily: 'Impact',
        }),
        screens: {
          lg: font(50, {
            lineHeight: 50,
            letterSpacing: 0,
          }),
        },
      },
      caps: {
        base: font(12, {
          lineHeight: 12,
          letterSpacing: 3,
        }),
        screens: {
          lg: font(14, {
            lineHeight: 14,
            letterSpacing: 4,
          }),
        },
      },
      small: {
        base: font(16, {
          lineHeight: 16,
          letterSpacing: 0,
          fontFamily: 'courier',
        }),
        screens: {
          lg: font(20, {
            lineHeight: 20,
            letterSpacing: 0,
          }),
        },
      },
    },
    extend: {
      aspectRatio: {
        '3/2': '3/2',
        '4/3': '4/3',
        '16/9': '16/9',
        '2/3': '2/3',
        '3/4': '3/4',
        square: '1/1',
        video: '16/9',
      },
      spacing: {
        3.75: rem(15),
        7.5: rem(30),
        9.5: rem(38),
        12.5: rem(50),
        15: rem(60),
        18: rem(72),
        22: rem(88),
        25: rem(100),
        30: rem(120),
        37.5: rem(150),
        104: rem(416),
        gutter: 'var(--gutter)',
        header: 'var(--header-height)',
        gap: 'var(--grid-gap)',
        scrollbar: 'var(--scrollbar-gutter, 0px)',
        viewport: 'var(--viewport)',
      },
      gap: {
        grid: 'var(--grid-gap)',
        3.75: rem(15),
      },
      zIndex: {
        '-1': -1,
        1: 1,
        header: 100,
        footer: 100,
      },
      maxHeight: {
        0: '0px',
      },
      borderWidth: {
        button: '1.125rem',
      },
      screens: {
        '-sm': {max: '639px'},
        '-md': {max: '767px'},
        '-lg': {max: '1023px'},
        '-xl': {max: '1279px'},
        '-2xl': {max: '1535px'},
        xs: '(min-width: 474px)',
        touch: {raw: '(hover: none) and (pointer: coarse)'},
        mouse: {raw: '(hover: hover) and (pointer: fine)'},
        '3xl': '1900px',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        slide: 'cubic-bezier(0.95, 0.2, 0.25, 1)',
        shift: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fade: 'cubic-bezier(.645,.045,.355,1)',
        rollover: 'cubic-bezier(.16,.16,.2,.9)',
        clip: 'cubic-bezier(0.95, 0.2, 0.25, 1)',
      },
      transitionDuration: {
        clip: '200ms',
        200: '200ms',
      },
      transitionProperty: {
        'visibility/opacity': 'visibility, opacity',
        opacity: 'opacity',
        color: 'color',
        'bg-color': 'background-color',
        clip: 'clip-path',
        height: 'height, max-height',
      },
      zIndex: {
        '-1': -1,
        1: 1,
        overlay: 60,
        header: 100,
      },
    },
  },
};
