/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.tsx", './public/*.html'],
  theme: {
    extend: {
        width: {
            16: '4rem',
        },
        fontSize: {
            sm: '0.750rem',
            base: '1rem',
            xl: '1.333rem',
            '2xl': '1.777rem',
            '3xl': '2.369rem',
            '4xl': '3.158rem',
            '5xl': '4.210rem',
        },
        fontWeight: {
            normal: '400',
            bold: '700',
        },
        colors: {
            text: {
                primary: 'oklch(26.33% 0.040 91.04)',
                secondary: 'oklch(43.57% 0.028 90.91)',
                tertiary: 'oklch(52.82% 0.022 90.66)',
            },
            'text-dark': {
                primary: 'oklch(94.00% 0.033 91.67)',
                secondary: 'oklch(79.23% 0.024 90.79)',
                tertiary: 'oklch(62.3% 0.015 93.07)',
            },
            background: 'oklch(87.84% 0.001 197.14)',
            'background-dark': 'oklch(31.00% 0.007 229.04)',
            primary: 'oklch(73.01% 0.146 74.32)',
            'primary-dark': 'oklch(65.87% 0.146 74.32)',
            secondary: {
                primary: 'oklch(75.31% 0.040 200.43)',
                secondary: 'oklch(66.14% 0.04 200.43)',
                tertiary: 'oklch(57.44% 0.04 200.43)',
            },
            'secondary-dark': {
                primary: 'oklch(50.08% 0.042 200.20)',
                secondary: 'oklch(44.12% 0.042 200.2)',
                tertiary: 'oklch(37.59% 0.042 200.2)',
            },
            accent: {
                primary: 'oklch(67.61% 0.114 293.10)',
                secondary: 'oklch(63.15% 0.114 293.1)',
            },
            'accent-dark': {
                primary: 'oklch(46.02% 0.127 287.87)',
                secondary: 'oklch(43.57% 0.127 287.87)',
            },
        },
    },
  },
  plugins: [],
}